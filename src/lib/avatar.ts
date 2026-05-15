export const AVATAR_MAX_BYTES = 1024 * 1024; // 1 MB
export const AVATAR_ALLOWED_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
] as const;
export const AVATAR_OUTPUT_WIDTH = 512;
export const AVATAR_OUTPUT_HEIGHT = 713; // 512 / 0.718 ≈ matches the card's aspect ratio
export const AVATAR_OUTPUT_QUALITY = 0.85;

export type AvatarValidationError = {
  kind: "type" | "size";
  message: string;
};

export function validateAvatarFile(file: File): AvatarValidationError | null {
  if (!AVATAR_ALLOWED_TYPES.includes(file.type as (typeof AVATAR_ALLOWED_TYPES)[number])) {
    return {
      kind: "type",
      message: "Please use a JPEG, PNG, or WebP image.",
    };
  }
  if (file.size > AVATAR_MAX_BYTES) {
    const mb = (file.size / (1024 * 1024)).toFixed(2);
    return {
      kind: "size",
      message: `Image is too large (${mb} MB). Max size is 1 MB.`,
    };
  }
  return null;
}

export async function processAvatar(file: File): Promise<Blob> {
  let bitmap: ImageBitmap;
  try {
    bitmap = await createImageBitmap(file);
  } catch {
    throw new Error("Could not read the image file.");
  }

  const targetW = AVATAR_OUTPUT_WIDTH;
  const targetH = AVATAR_OUTPUT_HEIGHT;
  const canvas = document.createElement("canvas");
  canvas.width = targetW;
  canvas.height = targetH;
  const ctx = canvas.getContext("2d");
  if (!ctx) {
    bitmap.close?.();
    throw new Error("Image processing is not supported in this browser.");
  }

  // Contain (preserve aspect, no cropping), anchored to bottom-center.
  // Transparent areas (e.g. above a bg-removed portrait) stay transparent
  // so the card's inner gradient shows through.
  const scale = Math.min(targetW / bitmap.width, targetH / bitmap.height);
  const dw = bitmap.width * scale;
  const dh = bitmap.height * scale;
  const dx = (targetW - dw) / 2;
  const dy = targetH - dh;
  ctx.drawImage(bitmap, 0, 0, bitmap.width, bitmap.height, dx, dy, dw, dh);
  bitmap.close?.();

  return new Promise<Blob>((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (!blob) reject(new Error("Could not encode the image."));
        else resolve(blob);
      },
      "image/webp",
      AVATAR_OUTPUT_QUALITY,
    );
  });
}
