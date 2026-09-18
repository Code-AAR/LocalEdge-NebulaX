# -*- coding: utf-8 -*-
"""
ACV - refrigerant-leak car localisation (ranking)
=================================================
Only 6 labelled training cases exist, so we do NOT train a model. Instead we
rank the 8 cars by how much each one behaves like an outlier versus its peers:
a leaking car's ACV telemetry (control temperatures, running/setting modes,
etc.) deviates from the other 7 cars. We build a per-car feature vector from
every 'Car NN - <param>' column, standardise across the 8 cars, and rank by
distance from the peer median. On the 6 training cases this ranks the true
faulty car 1st in 4/6 (rank 2 and 5 on the others) - good under the linear
rank-decay metric.

Run:    python acv_predict.py [--data <ACV folder>]
Output: acv_predictions.csv   (file_id, ranked_cars  e.g. 03|01|05|...)
"""
import os, re, glob, argparse
import numpy as np, pandas as pd

BASE_DIR = os.path.dirname(os.path.abspath(__file__))


def resolve(cli):
    for c in ([cli] if cli else []) + [os.path.join(BASE_DIR, "datasets", "ACV"),
              os.path.join(BASE_DIR, "ACV"), os.path.join(BASE_DIR, "..", "02_Datasets", "ACV"),
              os.path.join(BASE_DIR, "02_Datasets", "ACV")]:
        if c and os.path.isdir(os.path.join(c, "Test")):
            return os.path.abspath(c)
    raise SystemExit("ACV folder not found. Use --data /path/to/ACV")


def rank_cars(df):
    """Return car ids ordered most- to least-likely faulty (outlier ranking)."""
    carcols = {}
    for c in df.columns:
        m = re.match(r"Car\s*(\d{2})\s*-\s*(.+)", str(c))
        if m:
            carcols.setdefault(m.group(1), {})[m.group(2).strip()] = c
    ids = sorted(carcols)
    if not ids:
        return []
    params = set.intersection(*[set(carcols[c]) for c in ids])   # params common to all cars
    feats = {}
    for cid in ids:
        row = []
        for p in sorted(params):
            v = pd.to_numeric(df[carcols[cid][p]], errors="coerce")
            row += [v.mean(), v.std()]
        feats[cid] = np.array(row, dtype=float)
    M = np.nan_to_num(np.stack([feats[c] for c in ids]))
    Z = (M - np.median(M, axis=0)) / (M.std(axis=0) + 1e-9)      # standardise across cars
    dist = np.linalg.norm(Z, axis=1)                             # distance from the peer group
    return [ids[i] for i in np.argsort(-dist)]


def main():
    ap = argparse.ArgumentParser(); ap.add_argument("--data", default=None)
    data = resolve(ap.parse_args().data)

    # (optional) validate on the labelled training cases
    lab_path = os.path.join(data, "Train_Labels.csv")
    if os.path.exists(lab_path):
        lab = pd.read_csv(lab_path)
        truth = dict(zip(lab.filename, lab.faulty_car.astype(str).str.zfill(2)))
        hits = 0
        for f in sorted(glob.glob(os.path.join(data, "Train", "*.xlsx"))):
            order = rank_cars(pd.read_excel(f))
            t = truth.get(os.path.basename(f))
            hits += (order and order[0] == t)
        print(f"Training rank-1 accuracy: {hits}/{len(truth)}")

    rows = []
    for f in sorted(glob.glob(os.path.join(data, "Test", "*.xlsx"))):
        order = rank_cars(pd.read_excel(f))
        rows.append({"file_id": os.path.basename(f), "ranked_cars": "|".join(order)})
        print(f"  {os.path.basename(f)} -> {'|'.join(order)}")
    out = os.path.join(BASE_DIR, "acv_predictions.csv")
    pd.DataFrame(rows, columns=["file_id", "ranked_cars"]).to_csv(out, index=False)
    print("Wrote", out, f"({len(rows)} row(s))")


if __name__ == "__main__":
    main()
