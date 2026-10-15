import { useEffect, useState } from "react";
import { Button } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icon";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/shadcn-dialog";
import { cn } from "@/shared/lib/cn";

export type ImageViewerProps = {
  src: string;
  alt?: string;
  className?: string;
  /** Thumbnail classes when used as a clickable preview. */
  thumbClassName?: string;
};

/** Small thumbnail that opens a full-screen-friendly lightbox. */
export function ImageViewer({
  src,
  alt = "Image",
  className,
  thumbClassName,
}: ImageViewerProps) {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  return (
    <>
      <button
        type="button"
        className={cn(
          "block w-full overflow-hidden rounded-lg border line text-left focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2",
          className,
        )}
        onClick={() => setOpen(true)}
        aria-label={`View ${alt} larger`}
      >
        <img
          src={src}
          alt={alt}
          className={cn(
            "aspect-square w-full object-cover transition-transform duration-200 hover:scale-[1.02]",
            thumbClassName,
          )}
        />
      </button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent
          className="max-w-[min(96vw,56rem)] p-3 sm:p-4"
          showCloseButton={false}
        >
          <DialogHeader className="sr-only">
            <DialogTitle>{alt}</DialogTitle>
            <DialogDescription>Full size image preview</DialogDescription>
          </DialogHeader>
          <div className="relative">
            <Button
              variant="ghost"
              size="sm"
              className="absolute right-1 top-1 z-10 !px-2 surface"
              aria-label="Close"
              onClick={() => setOpen(false)}
            >
              <Icon name="x" />
            </Button>
            <img
              src={src}
              alt={alt}
              className="max-h-[85vh] w-full object-contain rounded-lg"
            />
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
