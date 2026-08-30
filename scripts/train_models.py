#!/usr/bin/env python
"""
Offline Model Training Script — Phase 3A IntelliBlock AI

Run this script ONCE to train all AI models and save them to the registry.
Models are loaded at API startup and used for stateless inference.

Usage:
    cd "IntelliBlock AI"
    $env:PYTHONPATH="backend;."
    python scripts/train_models.py

    # With a specific seed:
    python scripts/train_models.py --seed 42

IMPORTANT: Training uses SYNTHETIC scenario data only.
           Model performance metrics do NOT represent real Indian Railways data.
"""
import argparse
import sys
import os

# Ensure backend module is importable
sys.path.insert(0, os.path.join(os.path.dirname(__file__), "..", "backend"))
sys.path.insert(0, os.path.join(os.path.dirname(__file__), ".."))


def main():
    parser = argparse.ArgumentParser(description="Train IntelliBlock AI models")
    parser.add_argument(
        "--seed", type=int, default=42,
        help="Random seed for reproducibility (default: 42)"
    )
    args = parser.parse_args()

    print("=" * 60)
    print("IntelliBlock AI — Offline Model Training")
    print("Phase 3A Prototype | Synthetic Data Only")
    print("=" * 60)

    from app.services.ai.training.trainer import run_full_training_pipeline

    results = run_full_training_pipeline(seed=args.seed)

    print("\n" + "=" * 60)
    print("TRAINING COMPLETE")
    print(f"  Total examples: {results['total_examples']}")
    print(f"  Train: {results['train_examples']} | Test: {results['test_examples']}")
    print("\nDuration Model Metrics:")
    dm = results["duration_model"]["metrics"]
    print(f"  Test MAE:      {dm.get('test_mae_mins')} mins")
    print(f"  Test RMSE:     {dm.get('test_rmse_mins')} mins")
    print(f"  R²:            {dm.get('test_r2')}")
    print(f"  Baseline MAE:  {dm.get('baseline_median_mae_mins')} mins")
    print(f"  Improvement:   {dm.get('improvement_over_baseline_mins')} mins")
    print("\nOverrun Risk Model Metrics:")
    om = results["overrun_model"]["metrics"]
    print(f"  Precision:     {om.get('test_precision')}")
    print(f"  Recall:        {om.get('test_recall')}")
    print(f"  F1:            {om.get('test_f1')}")
    print(f"  ROC-AUC:       {om.get('test_roc_auc')}")
    print(f"  Baseline F1:   {om.get('baseline_f1')}")
    print("\n[NOTE] These metrics are on SYNTHETIC data only.")
    print("Models saved to: models/")
    print("=" * 60)


if __name__ == "__main__":
    main()
