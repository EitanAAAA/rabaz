from __future__ import annotations

import pickle
from datetime import datetime, timezone
from pathlib import Path
from typing import Any

import numpy as np
from fastapi import FastAPI, File, Form, HTTPException, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from sklearn.decomposition import PCA

from model import AdaFaceEmbedder


BASE_DIR = Path(__file__).resolve().parent
PCA_PATH = BASE_DIR / "pca.pkl"
EMBEDDINGS_PATH = BASE_DIR / "embeddings.pkl"
DEFAULT_THRESHOLD = 0.42
PCA_VERSION = "deterministic_random_face_space_v2"

app = FastAPI(title="AdaFace Access MVP")
embedder = AdaFaceEmbedder()
pca: PCA | None = None
reference_embedding: np.ndarray | None = None
reference_vector: np.ndarray | None = None
verification_log: list[dict[str, Any]] = []

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3051", "http://127.0.0.1:3051"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


def load_state() -> None:
    global pca, reference_embedding, reference_vector, verification_log

    if PCA_PATH.exists():
        with PCA_PATH.open("rb") as file:
            loaded_pca = pickle.load(file)
            pca = loaded_pca if getattr(loaded_pca, "access_pca_version", None) == PCA_VERSION else None

    if EMBEDDINGS_PATH.exists():
        with EMBEDDINGS_PATH.open("rb") as file:
            state = pickle.load(file)
            if state.get("pca_version") == PCA_VERSION:
                reference_embedding = state.get("reference_embedding")
                reference_vector = state.get("reference_vector")
            else:
                reference_embedding = None
                reference_vector = None
            verification_log = state.get("verification_log", [])


def save_state() -> None:
    with EMBEDDINGS_PATH.open("wb") as file:
        pickle.dump(
            {
                "reference_vector": reference_vector,
                "reference_embedding": reference_embedding,
                "verification_log": verification_log[-10:],
                "pca_version": PCA_VERSION,
            },
            file,
        )


def fit_or_load_pca(owner_embedding: np.ndarray | None = None) -> PCA:
    global pca

    if pca is not None:
        return pca

    if PCA_PATH.exists():
        with PCA_PATH.open("rb") as file:
            loaded_pca = pickle.load(file)
        if getattr(loaded_pca, "access_pca_version", None) == PCA_VERSION:
            pca = loaded_pca
            return pca

    training_matrix = build_pca_training_matrix()

    pca = PCA(n_components=256, random_state=42, svd_solver="randomized")
    pca.fit(training_matrix)
    pca.access_pca_version = PCA_VERSION

    with PCA_PATH.open("wb") as file:
        pickle.dump(pca, file)

    return pca


def build_pca_training_matrix() -> np.ndarray:
    rng = np.random.default_rng(42)
    samples = rng.normal(size=(4096, 512)).astype(np.float32)
    samples /= np.linalg.norm(samples, axis=1, keepdims=True)
    return samples


def quantize_vector(vector: np.ndarray) -> np.ndarray:
    return (vector * 127).astype(np.int8)


def dequantize_vector(vector: np.ndarray) -> np.ndarray:
    return vector.astype(np.float32) / 127.0


def normalize_vector(vector: np.ndarray) -> np.ndarray:
    norm = np.linalg.norm(vector)
    if norm == 0:
        raise HTTPException(status_code=422, detail="Embedding collapsed to a zero vector.")
    return (vector / norm).astype(np.float32)


def compress_embedding(embedding: np.ndarray) -> np.ndarray:
    reduced = project_embedding(embedding)
    return quantize_vector(reduced)


def project_embedding(embedding: np.ndarray) -> np.ndarray:
    if pca is None:
        raise HTTPException(status_code=500, detail="PCA is not fitted. Enroll a face first.")

    reduced = pca.transform(embedding.reshape(1, -1))[0].astype(np.float32)
    return normalize_vector(reduced)


def reconstruct_embedding(reduced_vector: np.ndarray) -> np.ndarray:
    if pca is None:
        raise HTTPException(status_code=500, detail="PCA is not fitted. Enroll a face first.")

    reconstructed = pca.inverse_transform(reduced_vector.reshape(1, -1))[0].astype(np.float32)
    return normalize_vector(reconstructed)


def cosine_similarity(a: np.ndarray, b: np.ndarray) -> float:
    a_float = dequantize_vector(a)
    b_float = dequantize_vector(b)
    return float(np.dot(a_float, b_float) / (np.linalg.norm(a_float) * np.linalg.norm(b_float)))


def cosine_similarity_float(a: np.ndarray, b: np.ndarray) -> float:
    return float(np.dot(a, b) / (np.linalg.norm(a) * np.linalg.norm(b)))


def compressed_similarity(owner_embedding: np.ndarray, query_vector: np.ndarray) -> float:
    owner_256 = project_embedding(owner_embedding)
    query_256 = normalize_vector(dequantize_vector(query_vector))
    return cosine_similarity_float(owner_256, query_256)


def vector_values(vector: np.ndarray) -> list[float]:
    return [round(float(value), 5) for value in vector.astype(np.float32)]


def int_values(vector: np.ndarray) -> list[int]:
    return [int(value) for value in vector.astype(np.int8)]


def vector_math(owner: np.ndarray, query: np.ndarray) -> dict[str, float]:
    dot = float(np.dot(owner, query))
    owner_norm = float(np.linalg.norm(owner))
    query_norm = float(np.linalg.norm(query))
    denominator = owner_norm * query_norm
    cosine = dot / denominator
    return {
        "dot": round(dot, 6),
        "owner_norm": round(owner_norm, 6),
        "query_norm": round(query_norm, 6),
        "denominator": round(denominator, 6),
        "cosine": round(float(cosine), 6),
    }


def compare_stage(name: str, owner: np.ndarray, query: np.ndarray) -> dict[str, Any]:
    return {
        "name": name,
        "dimensions": int(owner.shape[0]),
        "owner": vector_values(owner),
        "query": vector_values(query),
        "math": vector_math(owner, query),
    }


def build_vector_debug(query_embedding: np.ndarray, query_vector: np.ndarray) -> dict[str, Any] | None:
    if reference_embedding is None or reference_vector is None:
        return None

    owner_512 = normalize_vector(reference_embedding)
    query_512 = normalize_vector(query_embedding)
    owner_256 = project_embedding(reference_embedding)
    query_256 = project_embedding(query_embedding)
    owner_int8_float = dequantize_vector(reference_vector)
    query_int8_float = dequantize_vector(query_vector)
    query_reconstructed_512 = reconstruct_embedding(query_int8_float)
    owner_reconstructed_from_256 = reconstruct_embedding(owner_256)

    return {
        "cross_space_report": {
            "owner_adaface_512": vector_values(owner_512),
            "owner_projected_256": vector_values(owner_256),
            "owner_projected_256_rebuilt_512": vector_values(owner_reconstructed_from_256),
            "query_pca_256_before_int8": vector_values(query_256),
            "query_int8_256_raw": int_values(query_vector),
            "query_int8_256_dequantized": vector_values(query_int8_float),
            "query_256_rebuilt_512": vector_values(query_reconstructed_512),
            "math": {
                "owner512_vs_query256_rebuilt512": vector_math(owner_512, query_reconstructed_512),
                "owner_projected256_vs_query_pca256": vector_math(owner_256, query_256),
                "owner_projected256_vs_query_int8_dequantized256": vector_math(
                    owner_256, query_int8_float
                ),
                "owner512_vs_owner256_rebuilt512": vector_math(owner_512, owner_reconstructed_from_256),
            },
        },
        "stages": [
            compare_stage("Owner 512 vs query 256 rebuilt to 512", owner_512, query_reconstructed_512),
            compare_stage("AdaFace 512", owner_512, query_512),
            compare_stage("PCA 256", owner_256, query_256),
            compare_stage("int8 256", owner_int8_float, query_int8_float),
        ],
        "formula": "cos_sim = dot(a, b) / (norm(a) * norm(b))",
        "cross_space": "Direct 512-vs-256 cosine is undefined, so query 256 is lifted with PCA.inverse_transform(...) back to an approximate 512 before cosine.",
        "quantization": "v_int8 = (v * 127).astype(np.int8); v_float = v_int8.astype(np.float32) / 127.0",
    }


async def read_image(upload: UploadFile) -> bytes:
    if upload.content_type and not upload.content_type.startswith("image/"):
        raise HTTPException(status_code=415, detail="Upload must be an image.")

    data = await upload.read()
    if not data:
        raise HTTPException(status_code=400, detail="Image upload is empty.")
    return data


@app.on_event("startup")
def startup() -> None:
    load_state()


@app.get("/health")
def health() -> dict[str, Any]:
    return {
        "ready": reference_vector is not None,
        "pca_fitted": pca is not None,
        "reference_dim": int(reference_vector.shape[0]) if reference_vector is not None else None,
        "device": str(embedder.device),
    }


@app.post("/enroll")
async def enroll(image: UploadFile = File(...)) -> dict[str, Any]:
    global reference_embedding, reference_vector

    image_bytes = await read_image(image)
    embedding = embedder.extract_embedding(image_bytes)
    fit_or_load_pca(embedding)
    reference_embedding = embedding
    reference_vector = compress_embedding(embedding)
    save_state()

    return {
        "status": "ENROLLED",
        "embedding_dim": 512,
        "pca_dim": 256,
        "quantized_dim": int(reference_vector.shape[0]),
    }


@app.post("/verify")
async def verify(
    image: UploadFile = File(...),
    threshold: float = Form(DEFAULT_THRESHOLD),
) -> dict[str, Any]:
    if reference_vector is None:
        raise HTTPException(status_code=400, detail="No owner face enrolled yet.")

    threshold = float(np.clip(threshold, -1.0, 1.0))
    image_bytes = await read_image(image)
    embedding = embedder.extract_embedding(image_bytes)
    candidate_vector = compress_embedding(embedding)
    if reference_embedding is None:
        raise HTTPException(status_code=400, detail="Owner must be re-enrolled to store the original 512 vector.")

    candidate_reconstructed = reconstruct_embedding(dequantize_vector(candidate_vector))
    rebuilt_similarity = cosine_similarity_float(normalize_vector(reference_embedding), candidate_reconstructed)
    compressed_score = compressed_similarity(reference_embedding, candidate_vector)
    similarity = rebuilt_similarity
    result = "ACCESS GRANTED" if similarity >= threshold else "ACCESS DENIED"

    event = {
        "timestamp": datetime.now(timezone.utc).isoformat(),
        "similarity": round(similarity, 4),
        "threshold": round(threshold, 4),
        "result": result,
    }
    verification_log.append(event)
    del verification_log[:-10]
    save_state()

    return {
        "similarity": round(similarity, 4),
        "rebuilt_512_similarity": round(rebuilt_similarity, 4),
        "compressed_256_similarity": round(compressed_score, 4),
        "score_method": "Black-box owner 512 vs query 256 rebuilt to 512 cosine",
        "threshold": threshold,
        "result": result,
        "log": verification_log,
        "vector_debug": build_vector_debug(embedding, candidate_vector),
    }


@app.get("/logs")
def logs() -> dict[str, Any]:
    return {"log": verification_log}
