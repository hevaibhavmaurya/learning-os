export const MAX_IMAGE_BYTES = 15 * 1024 * 1024;
export const IMAGE_TYPES = ["image/jpeg", "image/png", "image/gif", "image/webp"] as const;
export type StoredImage = { id: string; url: string };
