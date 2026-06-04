from __future__ import annotations

import os
import sys
from contextlib import contextmanager
from io import BytesIO
from pathlib import Path
from typing import Any

import numpy as np
import torch
import cv2
from huggingface_hub import hf_hub_download
from PIL import Image, ImageOps
from torchvision.transforms import Compose, Normalize, ToTensor
from transformers import AutoModel


class AdaFaceEmbedder:
    """Loads AdaFace IR50 and returns one 512-d face embedding per image."""

    def __init__(
        self,
        repo_id: str = "minchul/cvlface_adaface_ir50_ms1mv2",
        cache_dir: Path | None = None,
    ) -> None:
        self.repo_id = repo_id
        self.cache_dir = cache_dir or Path.home() / ".cvlface_cache" / repo_id.replace("/", "_")
        self.device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
        self.face_detector = cv2.CascadeClassifier(
            cv2.data.haarcascades + "haarcascade_frontalface_default.xml"
        )
        self.transform = Compose(
            [
                ToTensor(),
                Normalize(mean=[0.5, 0.5, 0.5], std=[0.5, 0.5, 0.5]),
            ]
        )
        self.model = self._load_model()

    def extract_embedding(self, image_bytes: bytes) -> np.ndarray:
        image = self._preprocess_image(image_bytes)
        tensor = self.transform(image).unsqueeze(0).to(self.device)

        with torch.no_grad():
            output = self.model(tensor)

        embedding = self._unwrap_embedding(output)
        embedding = embedding.detach().float().cpu().reshape(-1).numpy().astype(np.float32)

        if embedding.shape[0] != 512:
            raise ValueError(f"AdaFace returned {embedding.shape[0]} dimensions; expected 512.")

        return embedding

    def _load_model(self) -> torch.nn.Module:
        self._download_repo()

        with self._local_model_context():
            model = AutoModel.from_pretrained(str(self.cache_dir), trust_remote_code=True)

        model.eval()
        model.to(self.device)
        return model

    def _download_repo(self) -> None:
        self.cache_dir.mkdir(parents=True, exist_ok=True)
        files_list = self.cache_dir / "files.txt"

        if not files_list.exists():
            hf_hub_download(self.repo_id, "files.txt", local_dir=self.cache_dir)

        files = [line.strip() for line in files_list.read_text(encoding="utf-8").splitlines() if line.strip()]
        for filename in [*files, "config.json", "wrapper.py", "model.safetensors"]:
            target = self.cache_dir / filename
            if not target.exists():
                hf_hub_download(self.repo_id, filename, local_dir=self.cache_dir)

    @contextmanager
    def _local_model_context(self):
        previous_cwd = os.getcwd()
        sys.path.insert(0, str(self.cache_dir))
        os.chdir(self.cache_dir)
        try:
            yield
        finally:
            os.chdir(previous_cwd)
            try:
                sys.path.remove(str(self.cache_dir))
            except ValueError:
                pass

    def _preprocess_image(self, image_bytes: bytes) -> Image.Image:
        image = Image.open(BytesIO(image_bytes))
        image = ImageOps.exif_transpose(image).convert("RGB")

        detected = self._crop_detected_face(image)
        image = detected if detected is not None else self._center_square_crop(image)
        return image.resize((112, 112), Image.Resampling.BILINEAR)

    def _crop_detected_face(self, image: Image.Image) -> Image.Image | None:
        if self.face_detector.empty():
            return None

        rgb = np.array(image)
        gray = cv2.cvtColor(rgb, cv2.COLOR_RGB2GRAY)
        faces = self.face_detector.detectMultiScale(
            gray,
            scaleFactor=1.08,
            minNeighbors=5,
            minSize=(80, 80),
        )

        if len(faces) == 0:
            return None

        x, y, width, height = max(faces, key=lambda face: face[2] * face[3])
        center_x = x + width / 2
        center_y = y + height / 2
        side = max(width, height) * 1.45

        left = int(max(0, center_x - side / 2))
        top = int(max(0, center_y - side / 2))
        right = int(min(image.width, center_x + side / 2))
        bottom = int(min(image.height, center_y + side / 2))

        return image.crop((left, top, right, bottom))

    @staticmethod
    def _center_square_crop(image: Image.Image) -> Image.Image:
        width, height = image.size
        side = min(width, height)
        left = (width - side) // 2
        top = (height - side) // 2
        return image.crop((left, top, left + side, top + side))

    @staticmethod
    def _unwrap_embedding(output: Any) -> torch.Tensor:
        if isinstance(output, torch.Tensor):
            return output

        if isinstance(output, dict):
            for key in ("embedding", "embeddings", "last_hidden_state", "pooler_output"):
                value = output.get(key)
                if isinstance(value, torch.Tensor):
                    return value

        if isinstance(output, (tuple, list)):
            for value in output:
                if isinstance(value, torch.Tensor):
                    return value

        raise TypeError(f"Unsupported AdaFace output type: {type(output)!r}")
