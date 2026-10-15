import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/shadcn-dialog";

export type LinkDialogProps = {
  open: boolean;
  initialUrl?: string | null;
  onOpenChange: (open: boolean) => void;
  onApply: (url: string) => void;
  onRemove: () => void;
};

function normalizeUrl(raw: string): string | null {
  const trimmed = raw.trim();
  if (!trimmed) return null;
  if (/^https?:\/\//i.test(trimmed)) return trimmed;
  if (/^[\w.-]+\.[\w.-]+/.test(trimmed)) return `https://${trimmed}`;
  return null;
}

export function LinkDialog(props: LinkDialogProps) {
  return props.open ? <OpenLinkDialog {...props} /> : null;
}

function OpenLinkDialog({
  open,
  initialUrl,
  onOpenChange,
  onApply,
  onRemove,
}: LinkDialogProps) {
  const [url, setUrl] = useState(initialUrl || "https://");
  const [error, setError] = useState<string | null>(null);

  const submit = () => {
    const normalized = normalizeUrl(url);
    if (!normalized) {
      setError("Enter a valid http(s) URL");
      return;
    }
    onApply(normalized);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="sm:max-w-md"
        onOpenAutoFocus={(e) => {
          // Focus the URL field, not the close button.
          e.preventDefault();
          const el = document.getElementById("link-url-input");
          el?.focus();
          if (el instanceof HTMLInputElement) el.select();
        }}
      >
        <DialogHeader>
          <DialogTitle>{initialUrl ? "Edit link" : "Add link"}</DialogTitle>
          <DialogDescription>
            Paste a URL. Leave empty and remove to unlink the selection.
          </DialogDescription>
        </DialogHeader>
        <label className="text-xs muted" htmlFor="link-url-input">
          URL
        </label>
        <Input
          id="link-url-input"
          className="mt-1.5"
          value={url}
          placeholder="https://"
          aria-invalid={Boolean(error)}
          onChange={(e) => {
            setUrl(e.target.value);
            setError(null);
          }}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              submit();
            }
          }}
        />
        {error ? <p className="text-xs mt-1.5" style={{ color: "var(--amber)" }}>{error}</p> : null}
        <DialogFooter>
          {initialUrl ? (
            <Button
              className="mr-auto"
              onClick={() => {
                onRemove();
                onOpenChange(false);
              }}
            >
              Remove
            </Button>
          ) : null}
          <Button onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button variant="primary" onClick={submit}>
            Apply
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
