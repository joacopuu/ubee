"use client";

import { useRef, useState } from "react";
import { ImagePlus, Loader2 } from "lucide-react";
import { img } from "@/lib/data";
import { db, MEDIA_BUCKET } from "@/lib/supabase";

/** Resize to ≤ max px on the long side and re-encode as JPEG, in the browser. */
async function compress(file: File, max = 1400, quality = 0.82): Promise<Blob> {
  const bitmap = await createImageBitmap(file);
  const scale = Math.min(1, max / Math.max(bitmap.width, bitmap.height));
  const canvas = document.createElement("canvas");
  canvas.width = Math.round(bitmap.width * scale);
  canvas.height = Math.round(bitmap.height * scale);
  canvas.getContext("2d")!.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
  return new Promise((resolve, reject) =>
    canvas.toBlob((b) => (b ? resolve(b) : reject(new Error("No se pudo procesar la imagen"))), "image/jpeg", quality),
  );
}

const toDataUrl = (blob: Blob) =>
  new Promise<string>((resolve, reject) => {
    const r = new FileReader();
    r.onload = () => resolve(String(r.result));
    r.onerror = () => reject(r.error);
    r.readAsDataURL(blob);
  });

/**
 * Photo picker for news and products.
 * Supabase mode: uploads to the public "media" bucket and stores its URL.
 * Demo mode: keeps a small data URL in this browser.
 */
export function ImageInput({
  value,
  onChange,
  folder,
  label = "Imagen",
}: {
  value: string;
  onChange: (url: string) => void;
  folder: string;
  label?: string;
}) {
  const input = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const pick = async (file?: File) => {
    if (!file) return;
    if (!file.type.startsWith("image/")) return setError("El archivo tiene que ser una imagen (JPG, PNG o WebP).");
    setError(null);
    setBusy(true);
    try {
      const client = db();
      if (!client) {
        onChange(await toDataUrl(await compress(file, 900, 0.75)));
      } else {
        const blob = await compress(file);
        const path = `${folder}/${Date.now()}-${Math.random().toString(36).slice(2, 7)}.jpg`;
        const { error: upErr } = await client.storage
          .from(MEDIA_BUCKET)
          .upload(path, blob, { contentType: "image/jpeg", cacheControl: "31536000" });
        if (upErr) throw upErr;
        onChange(client.storage.from(MEDIA_BUCKET).getPublicUrl(path).data.publicUrl);
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "No se pudo subir la imagen.");
    } finally {
      setBusy(false);
      if (input.current) input.current.value = "";
    }
  };

  return (
    <div>
      <p className="mb-2 text-sm text-bone/80">{label}</p>
      <button
        type="button"
        onClick={() => input.current?.click()}
        onDragOver={(e) => e.preventDefault()}
        onDrop={(e) => {
          e.preventDefault();
          void pick(e.dataTransfer.files[0]);
        }}
        className="press group relative grid aspect-[16/10] w-full place-items-center overflow-hidden rounded-2xl border border-dashed border-bone/20 bg-ink hover:border-filament/60"
      >
        {value ? (
          <img src={img(value, 800)} alt="" className="absolute inset-0 size-full object-cover" />
        ) : null}
        <span
          className={
            "relative flex items-center gap-2 rounded-full px-4 py-2 text-sm " +
            (value ? "bg-ink/70 opacity-0 backdrop-blur-md transition-opacity group-hover:opacity-100" : "text-bone/70")
          }
        >
          {busy ? <Loader2 className="size-4 animate-spin" aria-hidden /> : <ImagePlus className="size-4" aria-hidden />}
          {busy ? "Subiendo…" : value ? "Cambiar imagen" : "Subir imagen o arrastrarla acá"}
        </span>
      </button>
      <input
        ref={input}
        type="file"
        accept="image/*"
        className="sr-only"
        tabIndex={-1}
        onChange={(e) => void pick(e.target.files?.[0])}
      />
      {error ? (
        <p role="alert" className="mt-2 text-sm text-destructive">
          {error}
        </p>
      ) : null}
    </div>
  );
}
