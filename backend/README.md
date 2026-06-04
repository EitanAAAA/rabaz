# AdaFace Access Backend

Minimal FastAPI backend for one-owner face enrollment and verification.

## Run

```powershell
cd backend
python -m uvicorn main:app --reload --host 127.0.0.1 --port 8011
```

The first startup downloads `minchul/cvlface_adaface_ir50_ms1mv2` from Hugging Face.

## Endpoints

- `POST /enroll` with multipart field `image`
- `POST /verify` with multipart fields `image` and optional `threshold`
- `GET /logs`
- `GET /health`

State is persisted in `pca.pkl` and `embeddings.pkl`.
