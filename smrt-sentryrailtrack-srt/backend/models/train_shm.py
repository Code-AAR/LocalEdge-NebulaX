# -*- coding: utf-8 -*-
"""
SHM - cumulative fatigue-damage regression
==========================================
Each file is a long single-channel dynamic-stress time series; the target is a
single cumulative-damage value. We DON'T feed the raw 500k-point signal to a
network - with only 64 training files that would overfit. Instead we engineer
fatigue-relevant features and fit a gradient-boosted regressor.

Feature choice follows the physics: Miner's rule makes damage grow with the
sum of stress-range^b (b ~ 3-5 for steel), so power-sum features (mean|s|^3..5)
are strong predictors, alongside RMS, spread, peak and cycle-count statistics.

Metric: the official score is max(0, 1 - MAPE). We also report R^2 and MAE.

Run:    python train_shm.py [--data <SHM folder>]
Output: shm_predictions.csv  (file_id, prediction),
        shm_metrics.json, shm_pred_vs_actual.png
"""
import os, glob, json, argparse
import numpy as np, pandas as pd
from sklearn.ensemble import GradientBoostingRegressor
from sklearn.model_selection import KFold, cross_val_predict
from sklearn.metrics import r2_score, mean_absolute_error, mean_absolute_percentage_error
try:
    import matplotlib; matplotlib.use("Agg"); import matplotlib.pyplot as plt
    HAVE_MPL = True
except Exception:
    HAVE_MPL = False

BASE_DIR = os.path.dirname(os.path.abspath(__file__))


def resolve(cli):
    for c in ([cli] if cli else []) + [os.path.join(BASE_DIR, "datasets", "SHM"),
              os.path.join(BASE_DIR, "SHM"), os.path.join(BASE_DIR, "..", "02_Datasets", "SHM"),
              os.path.join(BASE_DIR, "02_Datasets", "SHM")]:
        if c and os.path.isdir(os.path.join(c, "Test")):
            return os.path.abspath(c)
    raise SystemExit("SHM folder not found. Use --data /path/to/SHM")


def features(path):
    """Fatigue-relevant features from one stress signal (header=None -> keep all rows)."""
    s = pd.read_csv(path, header=None).iloc[:, 0]
    s = pd.to_numeric(s, errors="coerce").dropna().to_numpy(dtype=np.float64)
    a = np.abs(s)
    d = np.diff(s)                                   # first difference ~ ranges
    ad = np.abs(d)
    def q(x, p): return np.percentile(x, p) if x.size else 0.0
    feats = [
        len(s), s.std(), np.sqrt((s**2).mean()),     # length, std, RMS
        a.max(), q(a, 99), q(a, 95),                 # peak & high percentiles
        (a**3).mean(), (a**4).mean(), (a**5).mean(), # power sums (Miner/S-N)
        ad.mean(), ad.std(), (ad**3).mean(),         # cycle-range stats
        ((s[1:] * s[:-1]) < 0).mean(),               # zero-crossing rate
        (a > 3 * s.std()).mean(),                    # fraction of big excursions
        float(pd.Series(s).kurt()), float(pd.Series(s).skew()),
    ]
    return np.nan_to_num(np.array(feats, dtype=np.float64))


def main():
    ap = argparse.ArgumentParser(); ap.add_argument("--data", default=None)
    data = resolve(ap.parse_args().data)

    lab = pd.read_csv(os.path.join(data, "Train_Labels.csv"))
    print(f"Loading {len(lab)} training signals + features...")
    Xtr = np.stack([features(os.path.join(data, "Train", f)) for f in lab.filename])
    ytr = lab["damage"].to_numpy(dtype=np.float64)

    model = GradientBoostingRegressor(n_estimators=400, max_depth=3,
                                      learning_rate=0.05, subsample=0.9, random_state=42)

    # honest cross-validated scores (64 samples -> 5-fold)
    cvpred = cross_val_predict(model, Xtr, ytr, cv=KFold(5, shuffle=True, random_state=42))
    cvpred = np.clip(cvpred, 0, None)
    r2   = r2_score(ytr, cvpred)
    mae  = mean_absolute_error(ytr, cvpred)
    mape = mean_absolute_percentage_error(ytr, cvpred)
    score = max(0.0, 1.0 - mape)
    print("\n" + "=" * 50 + "\nCROSS-VALIDATED SCORES (5-fold)\n" + "=" * 50)
    print(f"  R^2            : {r2:.4f}")
    print(f"  MAE            : {mae:.4f}")
    print(f"  MAPE           : {mape:.4f}")
    print(f"  Score 1-MAPE   : {score:.4f}   <- official metric")

    json.dump({"r2": round(float(r2), 4), "mae": round(float(mae), 4),
               "mape": round(float(mape), 4), "score_1_minus_mape": round(float(score), 4),
               "n_train": int(len(ytr))},
              open(os.path.join(BASE_DIR, "shm_metrics.json"), "w"), indent=2)

    if HAVE_MPL:
        plt.figure(figsize=(5.2, 5))
        plt.scatter(ytr, cvpred, alpha=0.7, color="#028090")
        lim = [0, max(ytr.max(), cvpred.max()) * 1.05]
        plt.plot(lim, lim, "--", color="grey")
        plt.xlabel("True damage"); plt.ylabel("Predicted (CV)")
        plt.title(f"SHM - predicted vs actual  (R^2={r2:.2f})", fontweight="bold")
        plt.tight_layout(); plt.savefig(os.path.join(BASE_DIR, "shm_pred_vs_actual.png"), dpi=140)
        print("  saved shm_pred_vs_actual.png")

    # fit on all training data, predict the test files
    model.fit(Xtr, ytr)
    rows = []
    for f in sorted(glob.glob(os.path.join(data, "Test", "*.csv"))):
        val = float(np.clip(model.predict(features(f).reshape(1, -1))[0], 0, None))
        rows.append({"file_id": os.path.basename(f), "prediction": round(val, 6)})
    out = os.path.join(BASE_DIR, "shm_predictions.csv")
    pd.DataFrame(rows, columns=["file_id", "prediction"]).to_csv(out, index=False)
    print("Wrote", out, f"({len(rows)} rows)")


if __name__ == "__main__":
    main()
