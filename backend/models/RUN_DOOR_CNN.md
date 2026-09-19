# Door — segment detection + 1D CNN classifier — run guide

## Folder layout
```
Door_1DCNN/
├── train_door_cnn.py
└── datasets/Door/
    ├── Train.csv                 continuous training stream
    ├── Train_Segments_Answer.csv segment labels
    └── Test.csv                  continuous test stream (unlabelled)
```
Or pass the Door folder with --data.

## How it works
1. SEGMENT DETECTION: the stream is door cycles back-to-back with a multi-second
   time gap between them. We split on Datetime jumps > 0.5 s. This reproduces
   all 110 training segments EXACTLY, so detection timing is essentially perfect
   (which is what the IoU part of the score rewards).
2. CLASSIFICATION: each segment is resampled to 192 timesteps, its 16 sensor
   channels standardised, and a small 1D CNN predicts Normal vs Abnormal
   resistance. Class weights handle the 80 / 30 imbalance.

## Install (GPU = WSL; CPU is fine here, dataset is tiny)
```
pip install tensorflow numpy pandas scikit-learn matplotlib
```
(WSL/GPU: `pip install tensorflow[and-cuda] numpy pandas scikit-learn matplotlib`)

## Run
```
python train_door_cnn.py
python train_door_cnn.py --data "/mnt/c/path/to/Door"
python train_door_cnn.py --epochs 200
```

## Outputs (next to the script)
```
door_cnn.keras              trained model
door_scaler.npz             per-channel mean/std for inference
door_labels.json            Normal / Abnormal resistance
door_confusion_matrix.png   confusion matrix image
door_training_curves.png    loss / accuracy / macro-F1 curves
door_metrics.json           accuracy, macro-F1, per-class scores
door_predictions.csv        SUBMISSION: start_time, end_time, prediction
```

## Submission schema (already matched)
`door_predictions.csv` has columns `start_time, end_time, prediction`, NO file_id,
one row per detected segment, values exactly `Normal` or `Abnormal resistance`.
For the real submission, generate it by running the held-out Test.csv through
your APP (which loads door_cnn.keras), not this script directly.

## Note
- Only 30 Abnormal training segments, so its per-class F1 is the noisiest metric.
  More abnormal examples help most.
- CPU is fine for Door (110 tiny segments); GPU optional.
