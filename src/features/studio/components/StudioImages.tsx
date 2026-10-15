import { useRef, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { ImageViewer } from "@/components/ui/ImageViewer";
import { Icon } from "@/components/ui/Icon";
import { useToast } from "@/components/ui/Toast";
import { IMAGE_TYPES, MAX_IMAGE_BYTES, type StoredImage } from "@/shared/contracts/media";
import { apiFetch } from "@/shared/lib/api";
import { studioApi } from "@/features/studio/api";
import { studioKeys } from "@/features/studio/query-keys";

export function StudioImages({ postId, initialImages, disabled }: {
  postId: string;
  initialImages: StoredImage[];
  disabled: boolean;
}) {
  const qc = useQueryClient();
  const { toast } = useToast();
  const [busy, setBusy] = useState(false);
  const pending = useRef(false);
  const key = ["studio", "images", postId] as const;
  const { data: images } = useQuery({
    queryKey: key,
    queryFn: async () => (await studioApi.get(postId)).images,
    initialData: initialImages,
  });

  const change = async (operation: () => Promise<void>) => {
    if (pending.current || disabled) return;
    pending.current = true;
    setBusy(true);
    try {
      await operation();
      void qc.invalidateQueries({ queryKey: studioKeys.lists() });
      // Mark the post stale without refetching and resetting an active text draft.
      void qc.invalidateQueries({ queryKey: studioKeys.detail(postId), refetchType: "none" });
    } catch (error) {
      toast(error instanceof Error ? error.message : "Image operation failed. Please retry.", { tone: "warn" });
    } finally {
      pending.current = false;
      setBusy(false);
    }
  };

  return (
    <div aria-busy={busy}>
      <div className="text-xs muted mb-1.5">Images</div>
      <div className="grid grid-cols-3 gap-2">
        {images.map((image, index) => (
          <div key={image.id} className="relative">
            <ImageViewer src={image.url} alt={`Attached image ${index + 1}`} />
            <button type="button" className="absolute top-1 right-1 h-6 w-6 rounded-full surface grid place-items-center" aria-label={`Remove image ${index + 1}`} disabled={disabled || busy} onClick={() => void change(async () => {
              await apiFetch(`/api/media/${encodeURIComponent(image.id)}`, { method: "DELETE" });
              await qc.cancelQueries({ queryKey: key });
              qc.setQueryData<StoredImage[]>(key, (current = []) => current.filter((item) => item.id !== image.id));
              toast("Image removed");
            })}>
              <Icon name="x" className="!w-3 !h-3" />
            </button>
          </div>
        ))}
        <label className="aspect-square rounded-lg border border-dashed line grid place-items-center cursor-pointer hover:bg-[var(--sunk)]">
          <Icon name={busy ? "loader-circle" : "image-plus"} className={busy ? "animate-spin muted" : "muted"} />
          <input type="file" accept={IMAGE_TYPES.join(",")} className="sr-only" aria-label="Attach image" disabled={disabled || busy} onChange={(event) => {
            const file = event.target.files?.[0];
            event.target.value = "";
            if (!file) return;
            if (!(IMAGE_TYPES as readonly string[]).includes(file.type) || !file.size || file.size > MAX_IMAGE_BYTES) {
              toast("Choose a JPEG, PNG, GIF, or WebP image up to 15 MB.", { tone: "warn" });
              return;
            }
            void change(async () => {
              const image = await apiFetch<StoredImage>(`/api/media/upload?entityType=post&entityId=${encodeURIComponent(postId)}`, {
                method: "POST", headers: { "Content-Type": file.type }, rawBody: file,
              });
              await qc.cancelQueries({ queryKey: key });
              qc.setQueryData<StoredImage[]>(key, (current = []) => [...current, image]);
              toast("Image uploaded");
            });
          }} />
        </label>
      </div>
      <p className="text-[11px] muted mt-1.5" role="status">{busy ? "Saving image changes…" : "JPEG, PNG, GIF, or WebP · up to 15 MB each"}</p>
    </div>
  );
}
