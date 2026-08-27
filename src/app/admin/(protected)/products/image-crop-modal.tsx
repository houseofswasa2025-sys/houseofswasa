"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Cropper from "react-easy-crop";
import type { Area, MediaSize, Size } from "react-easy-crop";
import { cropAndCompress, PRODUCT_ASPECT } from "@/lib/client-image";

const ASPECTS = [
  { label: "Portrait", value: PRODUCT_ASPECT, hint: "fits the site" },
  { label: "Square", value: 1 },
  { label: "Landscape", value: 4 / 3 },
];

export default function ImageCropModal({
  file,
  onCancel,
  onApply,
}: {
  file: File;
  onCancel: () => void;
  onApply: (file: File) => void;
}) {
  // file is fixed for the life of this modal instance (it unmounts on
  // cancel/apply), so the object URL can be created once at init.
  const [imageUrl] = useState(() => URL.createObjectURL(file));
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [aspect, setAspect] = useState(PRODUCT_ASPECT);
  const [straighten, setStraighten] = useState(0);
  const [quarterTurns, setQuarterTurns] = useState(0);
  const [saving, setSaving] = useState(false);
  const [mediaSize, setMediaSize] = useState<Size | null>(null);
  const [cropSize, setCropSize] = useState<Size | null>(null);
  const croppedAreaPixels = useRef<Area | null>(null);

  const rotation = (quarterTurns * 90 + straighten + 360) % 360;

  // Straightening rotates the photo, which would expose empty corners inside
  // the crop box. Derive the smallest zoom that keeps the (rotated) photo
  // covering the crop rectangle, and never let the effective zoom fall below
  // it - so a tilt can't produce a photo with blank wedges.
  const minZoom = useMemo(() => {
    if (!mediaSize || !cropSize) return 1;
    const rad = (rotation * Math.PI) / 180;
    const sin = Math.abs(Math.sin(rad));
    const cos = Math.abs(Math.cos(rad));
    const needX = (cropSize.width * cos + cropSize.height * sin) / mediaSize.width;
    const needY = (cropSize.width * sin + cropSize.height * cos) / mediaSize.height;
    return Math.max(1, needX, needY) * 1.01;
  }, [mediaSize, cropSize, rotation]);

  const maxZoom = Math.max(4, minZoom + 1);
  const effectiveZoom = Math.min(maxZoom, Math.max(zoom, minZoom));

  useEffect(() => {
    return () => URL.revokeObjectURL(imageUrl);
  }, [imageUrl]);

  // Lock body scroll while the full-screen editor is open.
  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, []);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onCancel();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onCancel]);

  const onCropComplete = useCallback((_area: Area, areaPixels: Area) => {
    croppedAreaPixels.current = areaPixels;
  }, []);

  async function handleApply() {
    if (!croppedAreaPixels.current || saving) return;
    setSaving(true);
    try {
      const result = await cropAndCompress(file, croppedAreaPixels.current, rotation);
      onApply(result);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-black">
      <div className="flex items-center justify-between px-4 py-3 text-white">
        <button
          type="button"
          onClick={onCancel}
          className="rounded-full px-3 py-1.5 text-sm font-medium text-white/80 transition-colors hover:text-white"
        >
          Cancel
        </button>
        <span className="text-sm font-semibold">Edit photo</span>
        <button
          type="button"
          onClick={handleApply}
          disabled={saving}
          className="rounded-full bg-maroon px-4 py-1.5 text-sm font-semibold text-white transition-transform active:scale-95 disabled:opacity-60"
        >
          {saving ? "Saving..." : "Apply"}
        </button>
      </div>

      <div className="relative flex-1">
        {imageUrl && (
          <Cropper
            image={imageUrl}
            crop={crop}
            zoom={effectiveZoom}
            rotation={rotation}
            aspect={aspect}
            minZoom={minZoom}
            maxZoom={maxZoom}
            zoomWithScroll
            showGrid
            restrictPosition
            onCropChange={setCrop}
            onZoomChange={setZoom}
            onCropComplete={onCropComplete}
            onMediaLoaded={(m: MediaSize) => setMediaSize({ width: m.width, height: m.height })}
            onCropSizeChange={(s: Size) => setCropSize(s)}
          />
        )}
      </div>

      <div className="space-y-4 bg-black px-4 pb-[calc(env(safe-area-inset-bottom)+1rem)] pt-4 text-white">
        <div className="flex justify-center gap-2">
          {ASPECTS.map((a) => (
            <button
              key={a.label}
              type="button"
              onClick={() => setAspect(a.value)}
              className={`rounded-full border px-3 py-1.5 text-xs font-medium transition-colors ${
                aspect === a.value
                  ? "border-maroon bg-maroon text-white"
                  : "border-white/30 text-white/70 hover:border-white/60"
              }`}
            >
              {a.label}
              {a.hint && <span className="ml-1 text-[10px] text-white/50">({a.hint})</span>}
            </button>
          ))}
        </div>

        <label className="flex items-center gap-3 text-xs">
          <span className="w-16 shrink-0 text-white/60">Zoom</span>
          <input
            type="range"
            min={minZoom}
            max={maxZoom}
            step={0.01}
            value={effectiveZoom}
            onChange={(e) => setZoom(Number(e.target.value))}
            className="flex-1 accent-maroon"
          />
        </label>

        <div className="flex items-center gap-3 text-xs">
          <span className="w-16 shrink-0 text-white/60">Straighten</span>
          <input
            type="range"
            min={-45}
            max={45}
            step={1}
            value={straighten}
            onChange={(e) => setStraighten(Number(e.target.value))}
            className="flex-1 accent-maroon"
          />
          <span className="w-8 shrink-0 text-right tabular-nums text-white/60">{straighten}°</span>
        </div>

        <div className="flex justify-center gap-3">
          <button
            type="button"
            onClick={() => setQuarterTurns((q) => (q + 3) % 4)}
            className="rounded-full border border-white/30 px-3 py-1.5 text-xs font-medium text-white/80 transition-colors hover:border-white/60"
          >
            ⟲ Rotate left
          </button>
          <button
            type="button"
            onClick={() => setQuarterTurns((q) => (q + 1) % 4)}
            className="rounded-full border border-white/30 px-3 py-1.5 text-xs font-medium text-white/80 transition-colors hover:border-white/60"
          >
            ⟳ Rotate right
          </button>
        </div>
      </div>
    </div>
  );
}
