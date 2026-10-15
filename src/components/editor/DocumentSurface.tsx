import { useState, type ReactNode } from "react";
import {
  RichEditor,
  type RichEditorProps,
  type RichEditorValue,
} from "@/components/editor/RichEditor";
import { Button } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icon";
import { cx } from "@/shared/lib/cx";

export type DocumentSurfaceProps = {
  documentId: string;
  initialEditorState?: unknown | null;
  plainText?: string;
  /** When true, start in edit mode (e.g. brand-new empty docs). */
  defaultEditing?: boolean;
  /** Soft-lock editing (trash). Preview still shown. */
  locked?: boolean;
  placeholder?: string;
  className?: string;
  emptyLabel?: string;
  onChange?: (value: RichEditorValue) => void;
  onEditingChange?: (editing: boolean) => void;
  toolbarExtra?: ReactNode;
};

/**
 * Shared note/project body surface: preview by default, Lexical editor on Edit.
 */
export function DocumentSurface({
  documentId,
  initialEditorState,
  plainText = "",
  defaultEditing = false,
  locked = false,
  placeholder,
  className,
  emptyLabel = "Nothing written yet.",
  onChange,
  onEditingChange,
  toolbarExtra,
}: DocumentSurfaceProps) {
  const [editing, setEditing] = useState(defaultEditing && !locked);
  const [draft, setDraft] = useState<{
    editorState: unknown;
    plainText: string;
  } | null>(null);

  // Callers key this component by document ID, so local drafts survive refetches
  // but reset when a different document is opened.
  const isEditing = editing && !locked;
  const effectiveState = draft?.editorState ?? initialEditorState;
  const effectivePlain = draft?.plainText ?? plainText;
  const hasContent =
    Boolean(effectivePlain.trim()) ||
    Boolean(
      effectiveState &&
        typeof effectiveState === "object" &&
        JSON.stringify(effectiveState).length > 80,
    );

  const setMode = (next: boolean) => {
    if (locked && next) return;
    setEditing(next);
    onEditingChange?.(next);
  };

  return (
    <div className={cx("mt-2", className)}>
      <div className="flex items-center gap-2 min-h-9">
        <span className="text-xs muted">
          {isEditing ? "Editing" : "Preview"}
        </span>
        <div className="ml-auto flex items-center gap-1.5">
          {toolbarExtra}
          {locked ? (
            <span className="text-xs muted">Read only</span>
          ) : isEditing ? (
            <Button size="sm" variant="primary" onClick={() => setMode(false)}>
              <Icon name="eye" />
              Done
            </Button>
          ) : (
            <Button size="sm" onClick={() => setMode(true)}>
              <Icon name="pen-line" />
              Edit
            </Button>
          )}
        </div>
      </div>

      {isEditing ? (
        <RichEditor
          documentId={`${documentId}-edit`}
          initialEditorState={effectiveState}
          editable={!locked}
          placeholder={placeholder}
          showToolbar
          onChange={(value) => {
            setDraft({
              editorState: value.editorState,
              plainText: value.plainText,
            });
            onChange?.(value);
          }}
        />
      ) : hasContent && effectiveState ? (
        <RichEditor
          documentId={`${documentId}-preview-${effectivePlain.length}`}
          initialEditorState={effectiveState}
          editable={false}
          showToolbar={false}
        />
      ) : hasContent ? (
        <div className="prose-n py-5 border-y line mt-5 whitespace-pre-wrap">
          {effectivePlain}
        </div>
      ) : (
        <div className="py-10 text-sm muted border-y line mt-5">
          {emptyLabel}{" "}
          {!locked ? (
            <button
              type="button"
              className="forest underline underline-offset-2"
              onClick={() => setMode(true)}
            >
              Start writing
            </button>
          ) : null}
        </div>
      )}
    </div>
  );
}

export type { RichEditorProps, RichEditorValue };
