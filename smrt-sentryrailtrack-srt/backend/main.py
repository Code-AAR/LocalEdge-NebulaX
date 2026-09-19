# -*- coding: utf-8 -*-
"""
LocalEdge prediction API  (NebulaX PS3)
=======================================
FastAPI backend that runs the trained TensorFlow models and returns predictions,
so a frontend (e.g. the SMRT TrackBot Ops Vercel app) can upload a test file and
show / download the result in the exact submission schema.

Endpoints:
  GET  /                -> health + which models are loaded
  POST /predict/rail    -> multipart files[]  (one or more rail .csv recordings)
                           returns {columns, rows:[{file_id, prediction}], csv}
  POST /predict/door    -> multipart file     (the continuous Door Test.csv)
                           returns {columns, rows:[{start_time,end_time,prediction}], csv}

Run locally:   uvicorn main:app --reload --port 7860
Models live in ./models/  (rail_cnn.keras + rail_scaler.npz + rail_labels.json,
door_cnn.keras + door_scaler.npz + door_labels.json).
"""

import os
import io
import json
import datetime as _dt
import numpy as np
import pandas as pd

os.environ.setdefault("TF_CPP_MIN_LOG_LEVEL", "3")
import tensorflow as tf
from fastapi import FastAPI, UploadFile, File, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

APP_DIR   = os.path.dirname(os.path.abspath(__file__))
MODEL_DIR = os.path.join(APP_DIR, "models")

# ---- preprocessing constants (MUST match the training scripts) ----
RAIL_DOWNSAMPLE = 4
DOOR_FIXED_LEN  = 192
DOOR_GAP_MS     = 500
DOOR_FEATURE_COLS = ["Motor current(mA)", "Motor Voltage(10mV)", "Motor electrodynamic force",
                     "Door opening time(.1s)", "Door closing time(.1s)", "Close command",
                     "Open command", "DCSR", "DCSL", "DLSR", "DLSL", "Door Opened",
                     "Door Locked", "Door is opening", "Door is closing", "Door leaf position"]

app = FastAPI(title="LocalEdge Prediction API", version="1.0")
app.add_middleware(CORSMiddleware, allow_origins=["*"], allow_methods=["*"],
                   allow_headers=["*"], expose_headers=["*"])


# Guarantee CORS headers on EVERY response, including 500s. Without this, an
# unhandled error in a route returns a 500 with no Access-Control-Allow-Origin
# header, and the browser reports it as a CORS error that hides the real cause.
@app.exception_handler(Exception)
async def _cors_safe_errors(request: Request, exc: Exception):
    return JSONResponse(status_code=500,
                        content={"detail": f"{type(exc).__name__}: {exc}"},
                        headers={"Access-Control-Allow-Origin": "*"})


@app.exception_handler(HTTPException)
async def _cors_safe_http_errors(request: Request, exc: HTTPException):
    return JSONResponse(status_code=exc.status_code,
                        content={"detail": exc.detail},
                        headers={"Access-Control-Allow-Origin": "*"})


_BUNDLES = {}


def load_bundle(kind):
    """Cache-load a model bundle: (model, mean, std, labels) or None."""
    if kind in _BUNDLES:
        return _BUNDLES[kind]
    mp = os.path.join(MODEL_DIR, f"{kind}_cnn.keras")
    sp = os.path.join(MODEL_DIR, f"{kind}_scaler.npz")
    lp = os.path.join(MODEL_DIR, f"{kind}_labels.json")
    if not (os.path.exists(mp) and os.path.exists(sp)):
        _BUNDLES[kind] = None
        return None
    model = tf.keras.models.load_model(mp)
    z = np.load(sp)
    labels = json.load(open(lp)) if os.path.exists(lp) else None
    _BUNDLES[kind] = (model, z["mean"], z["std"], labels)
    return _BUNDLES[kind]


def to_payload(df):
    buf = io.StringIO(); df.to_csv(buf, index=False)
    return {"columns": list(df.columns), "rows": df.to_dict("records"), "csv": buf.getvalue()}


# ================= RAIL =================
def rail_signal(raw_bytes):
    df = pd.read_csv(io.BytesIO(raw_bytes), header=0, low_memory=False)
    arr = df.apply(pd.to_numeric, errors="coerce").to_numpy(dtype=np.float32)
    arr = np.nan_to_num(arr, nan=0.0)
    T = (arr.shape[0] // RAIL_DOWNSAMPLE) * RAIL_DOWNSAMPLE
    return arr[:T].reshape(T // RAIL_DOWNSAMPLE, RAIL_DOWNSAMPLE, arr.shape[1]).mean(axis=1)


# ================= DOOR =================
def _parse_ms(s):
    y, mo, d, h, mi, se, ms = [int(x) for x in str(s).split("-")]
    return _dt.datetime(y, mo, d, h, mi, se).timestamp() * 1000.0 + ms


def door_detect(df):
    t = df["Datetime"].map(_parse_ms).to_numpy()
    gaps = np.where(np.diff(t) > DOOR_GAP_MS)[0]
    starts = [0] + [g + 1 for g in gaps]
    ends = [g for g in gaps] + [len(df) - 1]
    return list(zip(starts, ends))


def _resample(mat, L=DOOR_FIXED_LEN):
    n = mat.shape[0]
    if n == L:
        return mat
    xi = np.linspace(0, n - 1, L); xp = np.arange(n)
    return np.stack([np.interp(xi, xp, mat[:, c]) for c in range(mat.shape[1])], axis=1)


# ================= ACV  (xlsx car-leak ranking - heuristic, no model file) =====
import re as _re

def acv_rank_cars(df):
    carcols = {}
    for c in df.columns:
        m = _re.match(r"Car\s*(\d{2})\s*-\s*(.+)", str(c))
        if m:
            carcols.setdefault(m.group(1), {})[m.group(2).strip()] = c
    ids = sorted(carcols)
    if not ids:
        return []
    params = set.intersection(*[set(carcols[c]) for c in ids])
    feats = {}
    for cid in ids:
        row = []
        for p in sorted(params):
            v = pd.to_numeric(df[carcols[cid][p]], errors="coerce")
            row += [v.mean(), v.std()]
        feats[cid] = np.array(row, dtype=float)
    M = np.nan_to_num(np.stack([feats[c] for c in ids]))
    Z = (M - np.median(M, axis=0)) / (M.std(axis=0) + 1e-9)
    dist = np.linalg.norm(Z, axis=1)
    return [ids[i] for i in np.argsort(-dist)]


# ================= SHM  (regression - loads shm_model.pkl) =====================
_SHM_MODEL = None

def load_shm_model():
    global _SHM_MODEL
    if _SHM_MODEL is None:
        p = os.path.join(MODEL_DIR, "shm_model.pkl")
        if os.path.exists(p):
            import joblib
            _SHM_MODEL = joblib.load(p)
    return _SHM_MODEL

def shm_features(raw_bytes):
    s = pd.read_csv(io.BytesIO(raw_bytes), header=None).iloc[:, 0]
    s = pd.to_numeric(s, errors="coerce").dropna().to_numpy(dtype=np.float64)
    a = np.abs(s); d = np.diff(s); ad = np.abs(d)
    q = lambda x, p: np.percentile(x, p) if x.size else 0.0
    feats = [len(s), s.std(), np.sqrt((s**2).mean()), a.max(), q(a, 99), q(a, 95),
             (a**3).mean(), (a**4).mean(), (a**5).mean(), ad.mean(), ad.std(),
             (ad**3).mean(), ((s[1:]*s[:-1]) < 0).mean(), (a > 3*s.std()).mean(),
             float(pd.Series(s).kurt()), float(pd.Series(s).skew())]
    return np.nan_to_num(np.array(feats, dtype=np.float64))


# ================= ENDPOINTS =================
@app.get("/")
def health():
    return {"status": "ok",
            "models": {"rail": load_bundle("rail") is not None,
                       "door": load_bundle("door") is not None,
                       "acv": True,                       # heuristic, always available
                       "shm": load_shm_model() is not None}}


@app.post("/predict/rail")
async def predict_rail(files: list[UploadFile] = File(...)):
    b = load_bundle("rail")
    if b is None:
        raise HTTPException(503, "Rail model not loaded (put rail_cnn.keras in models/).")
    model, mean, std, labels = b
    labels = labels or ["Normal", "Side I", "Side II"]
    rows = []
    for f in files:
        sig = (rail_signal(await f.read()) - mean) / std
        p = model.predict(sig[np.newaxis, ...], verbose=0)[0]
        rows.append({"file_id": f.filename, "prediction": labels[int(p.argmax())]})
    return to_payload(pd.DataFrame(rows, columns=["file_id", "prediction"]))


@app.post("/predict/door")
async def predict_door(file: UploadFile = File(...)):
    b = load_bundle("door")
    if b is None:
        raise HTTPException(503, "Door model not loaded (put door_cnn.keras in models/).")
    model, mean, std, labels = b
    labels = labels or ["Normal", "Abnormal resistance"]
    df = pd.read_csv(io.BytesIO(await file.read()))
    segs = door_detect(df)
    feats = []
    for s, e in segs:
        block = df.iloc[s:e + 1][DOOR_FEATURE_COLS].apply(pd.to_numeric, errors="coerce").to_numpy(np.float32)
        feats.append((_resample(np.nan_to_num(block)) - mean) / std)
    pr = model.predict(np.stack(feats), verbose=0).argmax(1)
    rows = [{"start_time": str(df["Datetime"].iloc[s]),
             "end_time": str(df["Datetime"].iloc[e]),
             "prediction": labels[int(p)]}
            for (s, e), p in zip(segs, pr)]
    return to_payload(pd.DataFrame(rows, columns=["start_time", "end_time", "prediction"]))


@app.post("/predict/acv")
async def predict_acv(file: UploadFile = File(...)):
    raw = await file.read()
    try:
        df = pd.read_excel(io.BytesIO(raw))          # .xlsx
    except Exception:
        df = pd.read_csv(io.BytesIO(raw))            # tolerate .csv too
    order = acv_rank_cars(df)
    if not order:
        raise HTTPException(400, "No 'Car NN - <param>' columns found in the file.")
    row = [{"file_id": file.filename, "ranked_cars": "|".join(order)}]
    return to_payload(pd.DataFrame(row, columns=["file_id", "ranked_cars"]))


@app.post("/predict/shm")
async def predict_shm(files: list[UploadFile] = File(...)):
    model = load_shm_model()
    if model is None:
        raise HTTPException(503, "SHM model not loaded (run train_shm.py, put shm_model.pkl in models/).")
    rows = []
    for f in files:
        val = float(np.clip(model.predict(shm_features(await f.read()).reshape(1, -1))[0], 0, None))
        rows.append({"file_id": f.filename, "prediction": round(val, 6)})
    return to_payload(pd.DataFrame(rows, columns=["file_id", "prediction"]))


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=int(os.environ.get("PORT", 7860)))