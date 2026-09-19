# -*- coding: utf-8 -*-
"""
Door - segment detection + 1D CNN binary classification
=======================================================
Task: in a CONTINUOUS door sensor stream, find each door open/close cycle
(a "segment") and classify it  Normal  vs  Abnormal resistance.

Two stages:
  1. SEGMENT DETECTION (rule-based, exact on the training data)
     The stream is door operations recorded back-to-back with a multi-second
     time GAP between them (rows within one operation are ~20 ms apart). So we
     split on large jumps in the Datetime column. On Train.csv this reproduces
     all 110 ground-truth segments exactly.
  2. CLASSIFICATION (1D CNN)
     Each detected segment is resampled to a fixed length and its sensor
     channels (motor current/voltage/back-EMF, switches, door position, ...)
     are fed to a small 1D CNN -> Normal / Abnormal resistance.

Why this split: the boundaries are given away by the timing, so a learned
detector is unnecessary and risky; the hard part - telling a healthy cycle
from an abnormal-resistance one by its motor-current shape - is what the CNN
does. Class imbalance (80 Normal / 30 Abnormal) is handled with class weights.

Run:
    python train_door_cnn.py [--data <Door folder>] [--epochs N] [--no-aug]
Outputs:
    door_cnn.keras, door_scaler.npz, door_labels.json,
    door_confusion_matrix.png, door_training_curves.png, door_metrics.json,
    door_predictions.csv   (start_time, end_time, prediction  - submission format)
"""

import os
import json
import argparse
import datetime as _dt
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
    matplotlib.use("Agg"); import matplotlib.pyplot as plt
    HAVE_MPL = True
except Exception:
    HAVE_MPL = False

# --------------------------------------------------------------------------
# CONFIG
# --------------------------------------------------------------------------
BASE_DIR   = os.path.dirname(os.path.abspath(__file__))
CLASSES    = ["Normal", "Abnormal resistance"]     # fixed output order
FIXED_LEN  = 192          # resample every segment to this many timesteps
GAP_MS     = 500          # a Datetime jump larger than this = new segment
EPOCHS     = 120
BATCH      = 16
INIT_LR    = 1e-3
VAL_FRAC   = 0.2
SEED       = 42

AUGMENT      = True
JITTER_SIGMA = 0.05
MAX_SHIFT    = 15
SCALE_SIGMA  = 0.08

np.random.seed(SEED); tf.random.set_seed(SEED)


def configure_gpu():
    gpus = tf.config.list_physical_devices("GPU")
    for g in gpus:
        try: tf.config.experimental.set_memory_growth(g, True)
        except Exception: pass
    print("GPU DETECTED -> training on GPU" if gpus else
          "No GPU visible -> training on CPU (fine, this dataset is small).")
    return bool(gpus)


def resolve_data_dir(cli):
    cands = [cli] if cli else []
    cands += [os.path.join(BASE_DIR, "datasets", "Door"),
              os.path.join(BASE_DIR, "Door"),
              os.path.join(BASE_DIR, "..", "02_Datasets", "Door"),
              os.path.join(BASE_DIR, "02_Datasets", "Door")]
    for c in cands:
        if c and os.path.exists(os.path.join(c, "Train.csv")):
            return os.path.abspath(c)
    raise SystemExit("Could not find the Door folder (with Train.csv). "
                     "Pass it: python train_door_cnn.py --data /path/to/Door")


# --------------------------------------------------------------------------
# SEGMENT DETECTION  (split the continuous stream on time gaps)
# --------------------------------------------------------------------------
def parse_dt_ms(s):
    """'Year-Month-Day-Hour-Min-Sec-Millisec' -> absolute milliseconds."""
    y, mo, d, h, mi, se, ms = [int(x) for x in str(s).split("-")]
    return _dt.datetime(y, mo, d, h, mi, se).timestamp() * 1000.0 + ms


def detect_segments(df):
    """Return list of (start_row, end_row) index pairs, one per door cycle."""
    t = df["Datetime"].map(parse_dt_ms).to_numpy()
    gaps = np.where(np.diff(t) > GAP_MS)[0]
    starts = [0] + [g + 1 for g in gaps]
    ends   = [g for g in gaps] + [len(df) - 1]
    return list(zip(starts, ends))


FEATURE_COLS = ["Motor current(mA)", "Motor Voltage(10mV)", "Motor electrodynamic force",
                "Door opening time(.1s)", "Door closing time(.1s)", "Close command",
                "Open command", "DCSR", "DCSL", "DLSR", "DLSL", "Door Opened",
                "Door Locked", "Door is opening", "Door is closing", "Door leaf position"]


def resample_segment(mat, L=FIXED_LEN):
    """(n, C) -> (L, C) by linear interpolation, so every segment fills the window."""
    n = mat.shape[0]
    if n == L:
        return mat
    xi = np.linspace(0, n - 1, L)
    xp = np.arange(n)
    return np.stack([np.interp(xi, xp, mat[:, c]) for c in range(mat.shape[1])], axis=1)


def segment_features(df, seg):
    s, e = seg
    block = df.iloc[s:e + 1][FEATURE_COLS].apply(pd.to_numeric, errors="coerce")
    block = block.to_numpy(dtype=np.float32)
    block = np.nan_to_num(block, nan=0.0)
    return resample_segment(block).astype(np.float32)   # float32 so tf.data augment matches


# --------------------------------------------------------------------------
# TRAINING-SET ASSEMBLY (match detected segments to the answer by start_time)
# --------------------------------------------------------------------------
def build_training_set(door_dir):
    df = pd.read_csv(os.path.join(door_dir, "Train.csv"))
    ans = pd.read_csv(os.path.join(door_dir, "Train_Segments_Answer.csv"))
    label_by_start = dict(zip(ans["start_time"].astype(str), ans["status"]))

    segs = detect_segments(df)
    X, y = [], []
    matched = 0
    for seg in segs:
        start_str = str(df["Datetime"].iloc[seg[0]])
        status = label_by_start.get(start_str)
        if status is None:                       # fall back: nearest by row count is overkill; skip
            continue
        X.append(segment_features(df, seg))
        y.append(CLASSES.index(status))
        matched += 1
    print(f"  detected {len(segs)} segments, matched {matched} to labels")
    return np.stack(X), np.array(y)


# --------------------------------------------------------------------------
# MODEL  (compact 1D CNN)
# --------------------------------------------------------------------------
def build_model(input_shape, n_classes):
    inp = Input(shape=input_shape)
    x = inp
    for f in (32, 64, 128):
        x = layers.Conv1D(f, 5, padding="same", use_bias=False)(x)
        x = layers.BatchNormalization()(x)
        x = layers.Activation("relu")(x)
        x = layers.MaxPooling1D(2)(x)
    x = layers.GlobalAveragePooling1D()(x)
    x = layers.Dense(64, activation="relu")(x)
    x = layers.Dropout(0.4)(x)
    out = layers.Dense(n_classes, activation="softmax")(x)
    return Model(inp, out, name="door_cnn")


def augment_signal(x, y, w):
    x = x + tf.random.normal(tf.shape(x), 0.0, JITTER_SIGMA)
    shift = tf.random.uniform([], -MAX_SHIFT, MAX_SHIFT + 1, dtype=tf.int32)
    x = tf.roll(x, shift, axis=0)
    x = x * tf.random.normal([], 1.0, SCALE_SIGMA)
    return x, y, w


class MacroF1(Callback):
    def __init__(self, vx, vy): super().__init__(); self.vx, self.vy = vx, vy
    def on_epoch_end(self, epoch, logs=None):
        logs = logs or {}
        pred = self.model.predict(self.vx, verbose=0).argmax(1)
        logs["val_macro_f1"] = f1_score(self.vy, pred, average="macro", zero_division=0)
        print(f"  - val_macro_f1: {logs['val_macro_f1']:.4f}")


def plot_confusion(cm, labels, out):
    if not HAVE_MPL: return
    fig, ax = plt.subplots(figsize=(5, 4.2)); ax.imshow(cm, cmap="Blues")
    ax.set_xticks(range(len(labels))); ax.set_xticklabels(labels, rotation=20, ha="right")
    ax.set_yticks(range(len(labels))); ax.set_yticklabels(labels)
    ax.set_xlabel("Predicted"); ax.set_ylabel("True")
    ax.set_title("Door - Confusion Matrix", fontweight="bold")
    thr = cm.max()/2 if cm.max() else 0
    for i in range(len(labels)):
        for j in range(len(labels)):
            ax.text(j, i, int(cm[i, j]), ha="center", va="center",
                    color="white" if cm[i, j] > thr else "black", fontsize=13)
    fig.tight_layout(); fig.savefig(out, dpi=140); plt.close(fig); print("  saved", os.path.basename(out))


def plot_history(hist, out):
    if not HAVE_MPL or hist is None: return
    h = hist.history; ep = range(1, len(h.get("loss", [])) + 1)
    fig, (a, b) = plt.subplots(1, 2, figsize=(13, 4.5))
    a.plot(ep, h.get("loss", []), "o-", label="train loss")
    if "val_loss" in h: a.plot(ep, h["val_loss"], "s-", label="val loss")
    a.set_title("Loss"); a.set_xlabel("epoch"); a.grid(alpha=.3); a.legend()
    if "accuracy" in h: b.plot(ep, [v*100 for v in h["accuracy"]], "o-", label="train acc")
    if "val_accuracy" in h: b.plot(ep, [v*100 for v in h["val_accuracy"]], "s-", label="val acc")
    if "val_macro_f1" in h: b.plot(ep, [v*100 for v in h["val_macro_f1"]], "^-", color="green", label="val macro-F1")
    b.set_title("Accuracy & Macro-F1 (%)"); b.set_xlabel("epoch"); b.grid(alpha=.3); b.legend()
    fig.tight_layout(); fig.savefig(out, dpi=140); plt.close(fig); print("  saved", os.path.basename(out))


# --------------------------------------------------------------------------
# MAIN
# --------------------------------------------------------------------------
def main():
    ap = argparse.ArgumentParser(description="Train the Door segment classifier")
    ap.add_argument("--data", default=None)
    ap.add_argument("--epochs", type=int, default=EPOCHS)
    ap.add_argument("--no-aug", action="store_true")
    args = ap.parse_args()

    configure_gpu()
    door_dir = resolve_data_dir(args.data)
    use_aug = AUGMENT and not args.no_aug
    print("Data dir:", door_dir, "| augmentation:", use_aug)

    print("Building training set from segments...")
    X, y = build_training_set(door_dir)
    print("  data:", X.shape, "| labels:", np.bincount(y).tolist(), "(Normal/Abnormal)")

    Xtr, Xva, ytr, yva = train_test_split(X, y, test_size=VAL_FRAC, stratify=y, random_state=SEED)

    mean = Xtr.mean(axis=(0, 1)).astype(np.float32)
    std  = (Xtr.std(axis=(0, 1)) + 1e-6).astype(np.float32)
    Xtr = (Xtr - mean) / std; Xva = (Xva - mean) / std
    np.savez(os.path.join(BASE_DIR, "door_scaler.npz"), mean=mean, std=std)

    counts = np.bincount(ytr, minlength=len(CLASSES)); total = counts.sum()
    cw = {i: total / (len(CLASSES) * c) if c else 1.0 for i, c in enumerate(counts)}
    print("  class weights:", {CLASSES[i]: round(w, 2) for i, w in cw.items()})
    sw = np.array([cw[c] for c in ytr], dtype=np.float32)

    AUTOTUNE = tf.data.AUTOTUNE
    train_ds = tf.data.Dataset.from_tensor_slices((Xtr, ytr, sw)).shuffle(len(Xtr), seed=SEED)
    if use_aug:
        train_ds = train_ds.map(augment_signal, num_parallel_calls=AUTOTUNE)
    train_ds = train_ds.batch(BATCH).prefetch(AUTOTUNE)
    val_ds = tf.data.Dataset.from_tensor_slices((Xva, yva)).batch(BATCH)

    model = build_model(Xtr.shape[1:], len(CLASSES))
    model.compile(optimizer=tf.keras.optimizers.Adam(INIT_LR),
                  loss="sparse_categorical_crossentropy", metrics=["accuracy"])
    model.summary()

    ckpt = os.path.join(BASE_DIR, "door_cnn.keras")
    callbacks = [
        MacroF1(Xva, yva),
        ModelCheckpoint(ckpt, monitor="val_macro_f1", mode="max", save_best_only=True, verbose=1),
        EarlyStopping(monitor="val_macro_f1", mode="max", patience=20, restore_best_weights=True, verbose=1),
        ReduceLROnPlateau(monitor="val_loss", factor=0.5, patience=8, min_lr=1e-6, verbose=1),
    ]

    print(f"\nTraining for up to {args.epochs} epochs...")
    history = model.fit(train_ds, validation_data=val_ds, epochs=args.epochs,
                        callbacks=callbacks, verbose=1)

    # ---- evaluation ----
    pred = model.predict(Xva, verbose=0).argmax(1)
    acc = accuracy_score(yva, pred)
    macro_f1 = f1_score(yva, pred, average="macro", zero_division=0)
    prec, rec, f1c, sup = precision_recall_fscore_support(yva, pred, labels=range(len(CLASSES)), zero_division=0)
    cm = confusion_matrix(yva, pred, labels=range(len(CLASSES)))
    print("\n" + "=" * 60 + "\nVALIDATION SCORES\n" + "=" * 60)
    print(f"  Accuracy    : {acc*100:5.1f}%")
    print(f"  Macro-F1    : {macro_f1:.4f}")
    print(f"    {'class':<22}{'prec':>8}{'recall':>8}{'f1':>7}{'n':>5}")
    for i, c in enumerate(CLASSES):
        print(f"    {c:<22}{prec[i]:>8.3f}{rec[i]:>8.3f}{f1c[i]:>7.3f}{int(sup[i]):>5}")
    print("  Confusion matrix (rows=true, cols=pred):")
    for i, c in enumerate(CLASSES):
        print(f"    {c:<22}", cm[i].tolist())

    plot_confusion(cm, CLASSES, os.path.join(BASE_DIR, "door_confusion_matrix.png"))
    plot_history(history, os.path.join(BASE_DIR, "door_training_curves.png"))
    json.dump({"accuracy": round(float(acc), 4), "macro_f1": round(float(macro_f1), 4),
               "per_class": {CLASSES[i]: {"precision": round(float(prec[i]), 4),
                             "recall": round(float(rec[i]), 4), "f1": round(float(f1c[i]), 4),
                             "support": int(sup[i])} for i in range(len(CLASSES))},
               "confusion_matrix": cm.tolist(), "classes": CLASSES},
              open(os.path.join(BASE_DIR, "door_metrics.json"), "w"), indent=2)
    print("  saved door_metrics.json")

    model.save(ckpt)
    json.dump(CLASSES, open(os.path.join(BASE_DIR, "door_labels.json"), "w"))
    print("Saved:", ckpt)

    # ---- predictions on Test.csv (submission format) ----
    test_csv = os.path.join(door_dir, "Test.csv")
    if os.path.exists(test_csv):
        print("\nDetecting + classifying segments in Test.csv...")
        te = pd.read_csv(test_csv)
        segs = detect_segments(te)
        Xte = np.stack([(segment_features(te, s) - mean) / std for s in segs])
        pr = model.predict(Xte, batch_size=BATCH, verbose=0).argmax(1)
        rows = [{"start_time": str(te["Datetime"].iloc[s]),
                 "end_time":   str(te["Datetime"].iloc[e]),
                 "prediction": CLASSES[int(p)]}
                for (s, e), p in zip(segs, pr)]
        out = os.path.join(BASE_DIR, "door_predictions.csv")
        pd.DataFrame(rows, columns=["start_time", "end_time", "prediction"]).to_csv(out, index=False)
        print(f"Wrote {out}  ({len(rows)} segments detected)")
    else:
        print("(no Test.csv found - skipping prediction step)")


if __name__ == "__main__":
    main()
