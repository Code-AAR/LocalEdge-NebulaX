# -*- coding: utf-8 -*-
"""
Rail Corrugation - 1D CNN (InceptionTime) trained from scratch
==============================================================
Three-class classification of axle-box vibration: Normal / Side I / Side II.

Each data file = 1 second at 10 kHz -> 10,000 rows x 129 columns:
    col 0      : rotating speed
    cols 1..128: alternating vibration / shock for 64 axle boxes
                 (positions 1,3,5,7 -> Side I rail ; 2,4,6,8 -> Side II rail)

Why this design (matches the challenge, avoids the usual traps):
  * 1D CNN on the raw signal - no spectrogram, no pretrained image model.
  * InceptionTime backbone: multi-scale 1D kernels catch both short shocks and
    the longer periodic corrugation pattern; residual links keep it trainable.
  * Per-channel standardisation from TRAIN stats only (saved for inference) so
    validation/test never leak into the scaler.
  * Class weighting for the severe 234 / 14 / 24 imbalance.
  * We monitor MACRO-F1 (the official metric), not accuracy, for early stopping
    and checkpointing - a model that always says "Normal" scores ~86% accuracy
    but a terrible macro-F1.
  * Stratified split so all three classes appear in both train and validation.

Run:
    python train_rail_cnn.py            # train + evaluate + write predictions
Outputs (next to this script):
    rail_cnn.keras            trained model
    rail_scaler.npz           per-channel mean/std for inference
    rail_labels.json          class order
    rail_predictions.csv      predictions on the Test folder (submission format)
"""

import os
import json
import argparse
import numpy as np
import pandas as pd
import tensorflow as tf
from tensorflow.keras import layers, Model, Input
from tensorflow.keras.callbacks import EarlyStopping, ReduceLROnPlateau, ModelCheckpoint, Callback
from sklearn.model_selection import train_test_split
from sklearn.metrics import (f1_score, classification_report, confusion_matrix,
                             accuracy_score, precision_recall_fscore_support)
try:
    import matplotlib
    matplotlib.use("Agg")
    import matplotlib.pyplot as plt
    HAVE_MPL = True
except Exception:
    HAVE_MPL = False

# --------------------------------------------------------------------------
# CONFIG
# --------------------------------------------------------------------------
BASE_DIR    = os.path.dirname(os.path.abspath(__file__))
CLASSES     = ["Normal", "Side I", "Side II"]     # fixed output order
DOWNSAMPLE  = 4          # average-pool the 10 kHz signal by this factor (10000 -> 2500)
EPOCHS      = 80
BATCH       = 16
INIT_LR     = 1e-3       # PEAK lr; warmup ramps up to it, cosine decays it down
WARMUP_EP   = 5          # epochs to linearly warm the lr from ~0 up to INIT_LR
VAL_FRAC    = 0.2
SEED        = 42

# --- smoothing knobs (why the curve was jagged, and the fix) -----------------
#   * warmup + cosine LR decay  -> no late-training loss spikes (was epoch ~37)
#   * gradient clipping         -> kills the occasional exploding-gradient jump
#   * weight EMA (evaluate on averaged weights) -> smooth val loss / acc / F1
CLIPNORM     = 1.0       # clip global grad norm (stops loss spikes)
EMA_MOMENTUM = 0.98      # weight-averaging for eval; 0.98 tracks a bit faster than
                         # 0.99 so it doesn't blur the sharp rare-class decisions

# --- signal augmentation (training only) -- helps the rare Side I / Side II ---
# Restored to full strength: the strong jitter/scale is what gives the model its
# robustness on the rare Side I / Side II faults (macro-F1). The curve smoothing
# now comes from EMA + gradient clipping + cosine LR instead, not from weaker aug.
AUGMENT      = True
JITTER_SIGMA = 0.08      # Gaussian noise, in standardised units
MAX_SHIFT    = 250       # max circular time-shift in samples (10% of 2500)
SCALE_SIGMA  = 0.10      # random per-signal magnitude scaling

np.random.seed(SEED); tf.random.set_seed(SEED)


def configure_gpu():
    """Detect the GPU and enable memory growth (so TF doesn't grab all VRAM).
    On native Windows TF is CPU-only (>=2.11) - real GPU training needs WSL2 +
    tensorflow[and-cuda]. This just reports and tunes whatever TF can see."""
    gpus = tf.config.list_physical_devices("GPU")
    if gpus:
        for g in gpus:
            try:
                tf.config.experimental.set_memory_growth(g, True)
            except Exception:
                pass
        print(f"GPU DETECTED: {len(gpus)} device(s) -> training on GPU")
    else:
        print("No GPU visible to TensorFlow -> training on CPU (slow).")
        print("  For GPU: run inside WSL2 with the 'tf' conda env (see RUN_RAIL_CNN.md).")
    return bool(gpus)


def resolve_data_dir(cli):
    """Find the Rail_Corrugation folder: CLI arg, then common locations."""
    candidates = [cli] if cli else []
    candidates += [
        os.path.join(BASE_DIR, "datasets", "Rail_Corrugation"),
        os.path.join(BASE_DIR, "Rail_Corrugation"),
        os.path.join(BASE_DIR, "..", "02_Datasets", "Rail_Corrugation"),
        os.path.join(BASE_DIR, "02_Datasets", "Rail_Corrugation"),
    ]
    for c in candidates:
        if c and os.path.isdir(os.path.join(c, "Train")):
            return os.path.abspath(c)
    raise SystemExit(
        "Could not find the Rail_Corrugation folder (with a Train/ subfolder).\n"
        "Pass it explicitly:  python train_rail_cnn.py --data /path/to/Rail_Corrugation")


# --------------------------------------------------------------------------
# DATA LOADING
# --------------------------------------------------------------------------
def load_signal(path):
    """Read one CSV -> (T, C) float32 array, downsampled by average pooling."""
    # header row present; force numeric, coerce any stray text to NaN -> 0
    df = pd.read_csv(path, header=0, low_memory=False)
    arr = df.apply(pd.to_numeric, errors="coerce").to_numpy(dtype=np.float32)
    arr = np.nan_to_num(arr, nan=0.0)
    T = (arr.shape[0] // DOWNSAMPLE) * DOWNSAMPLE
    arr = arr[:T].reshape(T // DOWNSAMPLE, DOWNSAMPLE, arr.shape[1]).mean(axis=1)
    return arr                                   # (T/DOWNSAMPLE, 129)


def load_training_set(train_dir, labels_csv):
    labels = pd.read_csv(labels_csv)             # columns: filename, label
    X, y, names = [], [], []
    for _, row in labels.iterrows():
        f = os.path.join(train_dir, row["filename"])
        if not os.path.exists(f):
            print("  missing:", row["filename"]); continue
        X.append(load_signal(f))
        y.append(CLASSES.index(row["label"]))
        names.append(row["filename"])
    return np.stack(X), np.array(y), names


# --------------------------------------------------------------------------
# SIGNAL AUGMENTATION (training only): jitter + time-shift + magnitude scale
# --------------------------------------------------------------------------
def augment_signal(x, y, w):
    """Applied per-sample inside the tf.data pipeline. x is (T, C)."""
    # 1) jitter - add small Gaussian noise (sensor-noise robustness)
    x = x + tf.random.normal(tf.shape(x), mean=0.0, stddev=JITTER_SIGMA)
    # 2) time-shift - circular roll along the time axis (phase invariance)
    shift = tf.random.uniform([], -MAX_SHIFT, MAX_SHIFT + 1, dtype=tf.int32)
    x = tf.roll(x, shift, axis=0)
    # 3) magnitude scaling - random gain (speed/loading invariance)
    x = x * tf.random.normal([], mean=1.0, stddev=SCALE_SIGMA)
    return x, y, w


def standardise_fit(X):
    """Per-channel mean/std over all train samples & timesteps.
    Returned as 1-D (C,) arrays so they broadcast cleanly against both a
    batch (N,T,C) and a single signal (T,C) without adding a phantom axis."""
    mean = X.mean(axis=(0, 1))           # (C,)
    std  = X.std(axis=(0, 1)) + 1e-6     # (C,)
    return mean.astype(np.float32), std.astype(np.float32)


# --------------------------------------------------------------------------
# MODEL  (InceptionTime, from scratch)
# --------------------------------------------------------------------------
def inception_module(x, n_filters=32, bottleneck=32, kernels=(10, 20, 40)):
    inp = x
    if x.shape[-1] > 1:
        x = layers.Conv1D(bottleneck, 1, padding="same", use_bias=False)(x)
    convs = [layers.Conv1D(n_filters, k, padding="same", use_bias=False)(x) for k in kernels]
    pool = layers.MaxPooling1D(3, strides=1, padding="same")(inp)
    convs.append(layers.Conv1D(n_filters, 1, padding="same", use_bias=False)(pool))
    x = layers.Concatenate()(convs)
    x = layers.BatchNormalization()(x)
    return layers.Activation("relu")(x)


def build_inception_time(input_shape, n_classes, depth=6, n_filters=32):
    inp = Input(shape=input_shape)
    x = inp
    res = inp
    for d in range(depth):
        x = inception_module(x, n_filters)
        if d % 3 == 2:                            # residual shortcut every 3 blocks
            sc = layers.Conv1D(x.shape[-1], 1, padding="same", use_bias=False)(res)
            sc = layers.BatchNormalization()(sc)
            x = layers.Add()([x, sc])
            x = layers.Activation("relu")(x)
            res = x
    x = layers.GlobalAveragePooling1D()(x)
    x = layers.Dropout(0.3)(x)
    out = layers.Dense(n_classes, activation="softmax")(x)
    return Model(inp, out, name="rail_inception_time")


# --------------------------------------------------------------------------
# MACRO-F1 monitor (the official metric) -> drives checkpoint + early stop
# --------------------------------------------------------------------------
class MacroF1(Callback):
    def __init__(self, val_x, val_y):
        super().__init__(); self.vx, self.vy = val_x, val_y
    def on_epoch_end(self, epoch, logs=None):
        logs = logs or {}
        pred = self.model.predict(self.vx, verbose=0).argmax(1)
        logs["val_macro_f1"] = f1_score(self.vy, pred, average="macro")
        print(f"  - val_macro_f1: {logs['val_macro_f1']:.4f}")


# --------------------------------------------------------------------------
# REPORTS: confusion matrix image, metrics JSON, training curves
# --------------------------------------------------------------------------
def plot_confusion(cm, labels, out):
    if not HAVE_MPL:
        return
    fig, ax = plt.subplots(figsize=(5.2, 4.4))
    im = ax.imshow(cm, cmap="Blues")
    ax.set_xticks(range(len(labels))); ax.set_xticklabels(labels, rotation=30, ha="right")
    ax.set_yticks(range(len(labels))); ax.set_yticklabels(labels)
    ax.set_xlabel("Predicted"); ax.set_ylabel("True")
    ax.set_title("Rail Corrugation - Confusion Matrix", fontweight="bold")
    thr = cm.max() / 2 if cm.max() else 0
    for i in range(len(labels)):
        for j in range(len(labels)):
            ax.text(j, i, int(cm[i, j]), ha="center", va="center",
                    color="white" if cm[i, j] > thr else "black", fontsize=13)
    fig.tight_layout(); fig.savefig(out, dpi=140); plt.close(fig)
    print("  saved", os.path.basename(out))


def plot_history(hist, out):
    if not HAVE_MPL or hist is None:
        return
    h = hist.history
    ep = range(1, len(h.get("loss", [])) + 1)
    fig, (a, b) = plt.subplots(1, 2, figsize=(13, 4.5))
    a.plot(ep, h.get("loss", []), "o-", label="train loss")
    if "val_loss" in h: a.plot(ep, h["val_loss"], "s-", label="val loss")
    a.set_title("Loss"); a.set_xlabel("epoch"); a.grid(alpha=.3); a.legend()
    if "accuracy" in h: b.plot(ep, [v*100 for v in h["accuracy"]], "o-", label="train acc")
    if "val_accuracy" in h: b.plot(ep, [v*100 for v in h["val_accuracy"]], "s-", label="val acc")
    if "val_macro_f1" in h: b.plot(ep, [v*100 for v in h["val_macro_f1"]], "^-", color="green", label="val macro-F1")
    b.set_title("Accuracy & Macro-F1 (%)"); b.set_xlabel("epoch"); b.grid(alpha=.3); b.legend()
    fig.tight_layout(); fig.savefig(out, dpi=140); plt.close(fig)
    print("  saved", os.path.basename(out))


# --------------------------------------------------------------------------
# MAIN
# --------------------------------------------------------------------------
def main():
    ap = argparse.ArgumentParser(description="Train the Rail Corrugation 1D CNN")
    ap.add_argument("--data", default=None, help="path to the Rail_Corrugation folder")
    ap.add_argument("--epochs", type=int, default=EPOCHS)
    ap.add_argument("--no-aug", action="store_true", help="disable signal augmentation")
    args = ap.parse_args()

    configure_gpu()
    data_dir  = resolve_data_dir(args.data)
    train_dir = os.path.join(data_dir, "Train")
    test_dir  = os.path.join(data_dir, "Test")
    labels_csv = os.path.join(data_dir, "Train_Labels.csv")
    use_aug = AUGMENT and not args.no_aug
    print("Data dir:", data_dir, "| augmentation:", use_aug)

    print("Loading training signals...")
    X, y, _ = load_training_set(train_dir, labels_csv)
    print("  data:", X.shape, "| labels:", np.bincount(y).tolist(), "(Normal/Side I/Side II)")

    # stratified split so every class is in both sides (justified: each recording
    # is an independent run, so file-level stratification introduces no leakage)
    Xtr, Xva, ytr, yva = train_test_split(X, y, test_size=VAL_FRAC,
                                          stratify=y, random_state=SEED)

    # standardise using TRAIN stats only, then apply to val (no leakage)
    mean, std = standardise_fit(Xtr)
    Xtr = (Xtr - mean) / std
    Xva = (Xva - mean) / std
    np.savez(os.path.join(BASE_DIR, "rail_scaler.npz"), mean=mean, std=std)

    # class imbalance (234/14/24) -> per-sample weights (works cleanly with tf.data)
    counts = np.bincount(ytr, minlength=len(CLASSES))
    total = counts.sum()
    cw = {i: total / (len(CLASSES) * c) if c else 1.0 for i, c in enumerate(counts)}
    print("  class weights:", {CLASSES[i]: round(w, 2) for i, w in cw.items()})
    sw = np.array([cw[c] for c in ytr], dtype=np.float32)

    # build the training pipeline: shuffle -> augment (train only) -> batch
    AUTOTUNE = tf.data.AUTOTUNE
    train_ds = tf.data.Dataset.from_tensor_slices((Xtr, ytr, sw)).shuffle(len(Xtr), seed=SEED)
    if use_aug:
        train_ds = train_ds.map(augment_signal, num_parallel_calls=AUTOTUNE)
    train_ds = train_ds.batch(BATCH).prefetch(AUTOTUNE)
    val_ds = tf.data.Dataset.from_tensor_slices((Xva, yva)).batch(BATCH)

    model = build_inception_time(Xtr.shape[1:], len(CLASSES))

    # ---- smooth optimisation schedule --------------------------------------
    # warmup (linear ramp to INIT_LR) then cosine decay to ~2% of peak.
    # A smooth, monotonic lr removes the abrupt jumps a step/plateau lr caused.
    steps_per_epoch = int(np.ceil(len(Xtr) / BATCH))
    warmup_steps    = WARMUP_EP * steps_per_epoch
    decay_steps     = max(1, (args.epochs - WARMUP_EP) * steps_per_epoch)
    lr_schedule = tf.keras.optimizers.schedules.CosineDecay(
        initial_learning_rate=INIT_LR * 0.02,   # tiny start of the warmup ramp
        warmup_target=INIT_LR,                   # peak lr after warmup
        warmup_steps=warmup_steps,
        decay_steps=decay_steps,
        alpha=0.02,                              # floor = 2% of peak (smooth landing)
    )
    # Adam with gradient clipping + weight EMA. ema_overwrite_frequency overwrites
    # the live weights with their EMA at each epoch boundary, so the per-epoch
    # validation numbers (loss / acc / macro-F1) are read off the *averaged*
    # weights -> visibly smoother curves and a more stable saved checkpoint.
    optimizer = tf.keras.optimizers.Adam(
        learning_rate=lr_schedule, clipnorm=CLIPNORM,
        use_ema=True, ema_momentum=EMA_MOMENTUM,
        ema_overwrite_frequency=steps_per_epoch)
    model.compile(optimizer=optimizer,
                  loss="sparse_categorical_crossentropy", metrics=["accuracy"])
    model.summary()

    ckpt = os.path.join(BASE_DIR, "rail_cnn.keras")
    callbacks = [
        MacroF1(Xva, yva),                                    # must be first -> fills logs
        ModelCheckpoint(ckpt, monitor="val_macro_f1", mode="max",
                        save_best_only=True, verbose=1),
        EarlyStopping(monitor="val_macro_f1", mode="max", patience=20,
                      restore_best_weights=True, verbose=1),
        # NOTE: lr is now driven by the cosine schedule above, so no
        # ReduceLROnPlateau (a schedule + plateau-reducer would fight each other).
    ]

    print(f"\nTraining for up to {args.epochs} epochs...")
    history = model.fit(train_ds, validation_data=val_ds, epochs=args.epochs,
                        callbacks=callbacks, verbose=1)

    # reload the best-checkpoint (EMA) weights so evaluation + the saved model
    # are exactly the ones that scored the best macro-F1
    if os.path.exists(ckpt):
        model = tf.keras.models.load_model(ckpt)

    # ==================================================================
    # EVALUATION  (held-out validation split)
    # ==================================================================
    pred = model.predict(Xva, verbose=0).argmax(1)

    acc         = accuracy_score(yva, pred)
    macro_f1    = f1_score(yva, pred, average="macro")
    weighted_f1 = f1_score(yva, pred, average="weighted")
    prec, rec, f1c, support = precision_recall_fscore_support(
        yva, pred, labels=range(len(CLASSES)), zero_division=0)
    cm = confusion_matrix(yva, pred, labels=range(len(CLASSES)))

    print("\n" + "=" * 60)
    print("VALIDATION SCORES")
    print("=" * 60)
    print(f"  Accuracy      : {acc*100:5.1f}%")
    print(f"  Macro-F1      : {macro_f1:.4f}   <- official metric")
    print(f"  Weighted-F1   : {weighted_f1:.4f}")
    print("\n  Per-class:")
    print(f"    {'class':<10}{'precision':>10}{'recall':>9}{'f1':>8}{'n':>6}")
    for i, c in enumerate(CLASSES):
        print(f"    {c:<10}{prec[i]:>10.3f}{rec[i]:>9.3f}{f1c[i]:>8.3f}{int(support[i]):>6}")
    print("\n  Confusion matrix (rows=true, cols=pred):")
    print("   ", CLASSES)
    for i, c in enumerate(CLASSES):
        print(f"    {c:<10}", cm[i].tolist())
    # note for judges/report: R^2 is a REGRESSION metric (used for SHM),
    # not applicable to this multi-class classifier.

    # ---- save reports as files ----
    plot_confusion(cm, CLASSES, os.path.join(BASE_DIR, "rail_confusion_matrix.png"))
    plot_history(history, os.path.join(BASE_DIR, "rail_training_curves.png"))
    metrics = {
        "accuracy": round(float(acc), 4),
        "macro_f1": round(float(macro_f1), 4),
        "weighted_f1": round(float(weighted_f1), 4),
        "per_class": {CLASSES[i]: {"precision": round(float(prec[i]), 4),
                                   "recall": round(float(rec[i]), 4),
                                   "f1": round(float(f1c[i]), 4),
                                   "support": int(support[i])} for i in range(len(CLASSES))},
        "confusion_matrix": cm.tolist(),
        "classes": CLASSES,
    }
    json.dump(metrics, open(os.path.join(BASE_DIR, "rail_metrics.json"), "w"), indent=2)
    print("  saved rail_metrics.json")

    model.save(ckpt)
    json.dump(CLASSES, open(os.path.join(BASE_DIR, "rail_labels.json"), "w"))
    print("Saved:", ckpt)

    # ---- predictions on the Test folder (submission format) ----
    if os.path.isdir(test_dir):
        print("\nPredicting on Test folder...")
        test_files = sorted(f for f in os.listdir(test_dir) if f.lower().endswith(".csv"))
        # load + standardise all test signals, then predict in ONE batched call
        Xte = np.stack([(load_signal(os.path.join(test_dir, f)) - mean) / std
                        for f in test_files])
        preds = model.predict(Xte, batch_size=BATCH, verbose=0).argmax(1)
        rows = [{"file_id": f, "prediction": CLASSES[int(p)]}
                for f, p in zip(test_files, preds)]
        out = os.path.join(BASE_DIR, "rail_predictions.csv")
        pd.DataFrame(rows, columns=["file_id", "prediction"]).to_csv(out, index=False)
        print(f"Wrote {out}  ({len(rows)} rows)")
    else:
        print("(no Test folder found - skipping prediction step)")


if __name__ == "__main__":
    main()
