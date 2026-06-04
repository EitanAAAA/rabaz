"use client";

import { ImagePlus } from "lucide-react";
import { ChangeEvent, useEffect, useRef, useState } from "react";

type UploadBoxProps = {
  file: File | null;
  onFileChange: (file: File | null) => void;
};

export default function UploadBox({ file, onFileChange }: UploadBoxProps) {
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    if (!file) {
      setPreviewUrl(null);
      return;
    }

    const nextUrl = URL.createObjectURL(file);
    setPreviewUrl(nextUrl);
    return () => URL.revokeObjectURL(nextUrl);
  }, [file]);

  function handleChange(event: ChangeEvent<HTMLInputElement>) {
    onFileChange(event.target.files?.[0] ?? null);
  }

  return (
    <div className="upload-box">
      <label className="drop-zone">
        <input ref={inputRef} type="file" accept="image/*" onChange={handleChange} />
        {previewUrl ? (
          <img className="preview-image" src={previewUrl} alt="Selected face preview" />
        ) : (
          <span className="drop-zone__empty">
            <ImagePlus size={34} aria-hidden="true" />
            <span>Choose a face image</span>
          </span>
        )}
      </label>
    </div>
  );
}
