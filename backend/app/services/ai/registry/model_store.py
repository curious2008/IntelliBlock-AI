"""
Lightweight Model Registry — loads serialised scikit-learn Pipelines from disk
and provides metadata access.

Design decisions:
  - Models are loaded ONCE at application startup into memory.
  - No model artefacts are loaded from user-supplied paths.
  - No arbitrary code execution happens at inference time.
  - The registry path is resolved relative to the project root, not from user input.
"""
import json
import os
from typing import Any, Dict, List, Optional

import joblib


# Resolve the models/ directory relative to the project root
# Path: registry/ -> ai/ -> services/ -> app/ -> backend/ -> project_root/
_PROJECT_ROOT = os.path.abspath(
    os.path.join(os.path.dirname(__file__), "..", "..", "..", "..", "..")
)
MODELS_DIR = os.path.join(_PROJECT_ROOT, "models")

# Known registered model identifiers — prevents loading arbitrary files
_REGISTERED_MODELS = {
    "duration_rf": "1.0.0",
    "overrun_gbc": "1.0.0",
}


class ModelNotReadyError(Exception):
    """Raised when a model artefact has not been trained and saved yet."""
    pass


class ModelStore:
    """
    In-memory registry of loaded ML model pipelines and their metadata.
    Loaded once at startup; thread-safe for read-only inference access.
    """

    def __init__(self) -> None:
        self._pipelines: Dict[str, Any] = {}
        self._metadata: Dict[str, Dict[str, Any]] = {}
        self._loaded = False

    def load_all(self) -> None:
        """
        Attempt to load all registered models from disk.
        Silently skips models not yet trained (model-not-trained state is
        handled gracefully at inference time via ModelNotReadyError).
        """
        for model_name, version in _REGISTERED_MODELS.items():
            self._try_load_model(model_name, version)
        self._loaded = True

    def _try_load_model(self, model_name: str, version: str) -> None:
        model_path = os.path.join(MODELS_DIR, f"{model_name}_v{version}.joblib")
        meta_path = os.path.join(MODELS_DIR, f"{model_name}_v{version}_meta.json")

        if not os.path.exists(model_path):
            return  # Not yet trained — caller handles via ModelNotReadyError

        try:
            pipeline = joblib.load(model_path)
            self._pipelines[model_name] = pipeline

            if os.path.exists(meta_path):
                with open(meta_path, "r") as f:
                    self._metadata[model_name] = json.load(f)
            else:
                self._metadata[model_name] = {
                    "model_name": model_name,
                    "model_version": version,
                    "feature_version": "1.0",
                }
        except Exception as e:
            # Log but don't crash the API — model will be marked not-ready
            print(f"[ModelStore] Failed to load {model_name}: {e}")

    def get_pipeline(self, model_name: str) -> Any:
        """Return loaded sklearn Pipeline. Raises ModelNotReadyError if not trained."""
        if model_name not in self._pipelines:
            raise ModelNotReadyError(
                f"Model '{model_name}' is not yet trained. "
                f"Run 'python scripts/train_models.py' to train all models."
            )
        return self._pipelines[model_name]

    def get_metadata(self, model_name: str) -> Dict[str, Any]:
        return self._metadata.get(model_name, {})

    def get_model_version(self, model_name: str) -> str:
        meta = self._metadata.get(model_name, {})
        return meta.get("model_version", "unknown")

    def list_models(self) -> List[Dict[str, Any]]:
        """Return status information for all registered models."""
        result = []
        for model_name, version in _REGISTERED_MODELS.items():
            is_loaded = model_name in self._pipelines
            meta = self._metadata.get(model_name, {})
            result.append({
                "model_name": model_name,
                "model_version": version,
                "status": "LOADED" if is_loaded else "NOT_TRAINED",
                "feature_version": meta.get("feature_version", "1.0"),
                "record_count": meta.get("record_count", 0),
                "created_at": meta.get("created_at", None),
                "metrics": meta.get("metrics", {}),
                "prediction_basis": "SYNTHETIC_PROTOTYPE",
            })
        return result


# Global singleton — loaded once on app startup
model_store = ModelStore()
