# Rail Corrugation 1D CNN — GPU training guide (from scratch)

Your GPU (RTX 5070 Ti) can ONLY be used through **WSL2 + Linux TensorFlow**.
Native Windows TensorFlow is CPU-only (since v2.11). So we train inside WSL.

The script (`train_rail_cnn.py`) auto-detects the GPU and enables memory growth —
you just have to run it in a GPU-enabled TensorFlow environment.

--------------------------------------------------------------------------
## FOLDER LAYOUT
--------------------------------------------------------------------------
```
Rail_Corrugation_1DCNN/
├── train_rail_cnn.py
├── RUN_RAIL_CNN.md          (this file)
└── datasets/
    └── Rail_Corrugation/
        ├── Train/           Train1.csv ... Train272.csv
        ├── Test/            Test1.csv ... Test68.csv
        └── Train_Labels.csv
```
Or keep the dataset anywhere and pass it with `--data` (see step 4).

==========================================================================
## PART A — ONE-TIME GPU SETUP (skip if your 'tf' env already works)
==========================================================================
You already did most of this for the fruit project. If your `tf` conda env
still trains on GPU, jump straight to PART B.

### A1. Open WSL (Ubuntu) from Windows
```
wsl
```

### A2. Install Miniforge (if `conda` is not found)
```
cd ~
curl -L -O https://github.com/conda-forge/miniforge/releases/latest/download/Miniforge3-Linux-x86_64.sh
bash Miniforge3-Linux-x86_64.sh
```
During the installer: press ENTER through the licence, type `yes`, press ENTER
at the location prompt (type nothing), type `yes` to run conda init. Then:
```
source ~/.bashrc
```

### A3. Create the GPU TensorFlow environment
```
conda create -n tf python=3.11 -y
conda activate tf
pip install --upgrade pip
pip install tensorflow[and-cuda] numpy pandas scikit-learn
```

### A4. Fix the CUDA library path (needed on WSL), made permanent
```
mkdir -p $CONDA_PREFIX/etc/conda/activate.d
echo 'export LD_LIBRARY_PATH=/usr/lib/wsl/lib:$(python -c "import nvidia,os,glob; print(\":\".join(sorted(set(os.path.dirname(p) for p in glob.glob(os.path.dirname(nvidia.__file__)+\"/**/*.so*\", recursive=True)))))"):$LD_LIBRARY_PATH' > $CONDA_PREFIX/etc/conda/activate.d/cuda_libs.sh
conda deactivate && conda activate tf
```

### A5. Confirm the GPU is visible
```
python -c "import tensorflow as tf; print(tf.config.list_physical_devices('GPU'))"
```
You want a non-empty list, e.g. `[PhysicalDevice(name='/physical_device:GPU:0', ...)]`.
If it prints `[]` with a "Cannot dlopen" warning, re-run A4.
(First run may pause a few minutes doing PTX JIT on a new GPU — that's normal.)

==========================================================================
## PART B — TRAIN ON THE GPU
==========================================================================
### B1. Activate the env and go to the project (note the /mnt/c path)
```
conda activate tf
cd "/mnt/c/Users/htait/OneDrive/Tài liệu/Nebula X/NebulaX-Hackathon-ProblemStatement/PS3/Rail_Corrugation_1DCNN"
```

### B2. Run it
```
python train_rail_cnn.py
```
Or point at the dataset explicitly:
```
python train_rail_cnn.py --data "/mnt/c/path/to/Rail_Corrugation"
```
Options:
```
python train_rail_cnn.py --epochs 120     # train longer
python train_rail_cnn.py --no-aug         # turn off signal augmentation
```

You should see near the top:
```
GPU DETECTED: 1 device(s) -> training on GPU
```

TIP: `/mnt/c` disk access is slow. For a big speed-up, copy the dataset into the
Linux home first and point `--data` there:
```
cp -r "/mnt/c/.../Rail_Corrugation" ~/rail_data
python train_rail_cnn.py --data ~/rail_data
```

==========================================================================
## WHAT IT PRODUCES  (next to the script)
==========================================================================
```
rail_cnn.keras          trained model
rail_scaler.npz         per-channel mean/std for inference
rail_labels.json        class order (Normal / Side I / Side II)
rail_predictions.csv    predictions on the Test folder (submission schema)
```
It prints per-epoch `val_macro_f1` (the official metric), then a final
validation Macro-F1, per-class precision/recall/F1 report, and confusion matrix.

==========================================================================
## NOTES
==========================================================================
- Augmentation (jitter + time-shift + magnitude scaling) is ON by default,
  applied to TRAINING data only — it helps the rare Side I / Side II classes.
- Side I has only 14 samples; its F1 will be the noisiest. More Side I data
  helps more than any model change.
- For the FINAL submission, generate `rail_predictions.csv` by running the
  held-out Test files through your APP — this script trains the model the app
  loads. The webcam/app step runs on Windows; training runs in WSL.
- No GPU? The script still runs on CPU (just slower) — same commands, it will
  print "training on CPU".
