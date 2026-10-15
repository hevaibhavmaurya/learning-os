import { useEffect, useMemo, useRef, type CSSProperties } from "react";
import { LexicalComposer } from "@lexical/react/LexicalComposer";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { ContentEditable } from "@lexical/react/LexicalContentEditable";
import { LexicalErrorBoundary } from "@lexical/react/LexicalErrorBoundary";
import { HistoryPlugin } from "@lexical/react/LexicalHistoryPlugin";
import { OnChangePlugin } from "@lexical/react/LexicalOnChangePlugin";
import { PlainTextPlugin } from "@lexical/react/LexicalPlainTextPlugin";
import {
  $createParagraphNode,
  $createTextNode,
  $getRoot,
  type EditorState,
} from "lexical";
import { cx } from "@/shared/lib/cx";

export type PlainEditorProps = {
  documentId: string;
  initialText?: string;
  editable?: boolean;
  placeholder?: string;
  className?: string;
  contentClassName?: string;
  minHeightClassName?: string;
  "aria-label"?: string;
  onChange?: (text: string) => void;
  ignoreSelectionChange?: boolean;
};

function getPlainText(editorState: EditorState): string {
  let text = "";
  editorState.read(() => {
    text = $getRoot().getTextContent();
  });
  return text;
}

function InitialTextPlugin({
  documentId,
  initialText,
}: {
  documentId: string;
  initialText?: string;
}) {
  const [editor] = useLexicalComposerContext();
  const loaded = useRef<string | null>(null);

  useEffect(() => {
    if (loaded.current === documentId) return;
    loaded.current = documentId;
    const value = initialText ?? "";
    editor.update(() => {
      const root = $getRoot();
      root.clear();
      const p = $createParagraphNode();
      if (value) p.append($createTextNode(value));
      root.append(p);
    });
  }, [documentId, editor, initialText]);

  return null;
}

function EditablePlugin({ editable }: { editable: boolean }) {
  const [editor] = useLexicalComposerContext();
  useEffect(() => {
    editor.setEditable(editable);
  }, [editable, editor]);
  return null;
}

/** Sync external text when platform tab switches. */
export function ExternalTextPlugin({
  text,
  activeKey,
}: {
  text: string;
  activeKey: string;
}) {
  const [editor] = useLexicalComposerContext();
  const lastKey = useRef<string | null>(null);

  useEffect(() => {
    if (lastKey.current === activeKey) return;
    lastKey.current = activeKey;
    editor.update(() => {
      const root = $getRoot();
      if (root.getTextContent() === text) return;
      root.clear();
      const p = $createParagraphNode();
      if (text) p.append($createTextNode(text));
      root.append(p);
    });
  }, [activeKey, editor, text]);

  return null;
}

export function PlainEditor({
  documentId,
  initialText = "",
  editable = true,
  placeholder,
  className,
  contentClassName,
  minHeightClassName = "min-h-[26rem]",
  "aria-label": ariaLabel = "Text",
  onChange,
  ignoreSelectionChange = true,
}: PlainEditorProps) {
  const initialConfig = useMemo(
    () => ({
      namespace: `plain-${documentId}`,
      editable,
      onError(error: Error) {
        console.error("[PlainEditor]", error);
      },
    }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [documentId],
  );

  return (
    <LexicalComposer initialConfig={initialConfig} key={documentId}>
      <div className={cx("relative", className)}>
        <PlainTextPlugin
          contentEditable={
            <ContentEditable
              className={cx(
                "w-full bg-transparent outline-none resize-none p-6 text-[16px] leading-[1.75]",
                minHeightClassName,
                contentClassName,
              )}
              style={{ fieldSizing: "content" } as CSSProperties}
              aria-label={ariaLabel}
              aria-multiline="true"
              role="textbox"
            />
          }
          placeholder={
            placeholder ? (
              <div className="pointer-events-none absolute top-6 left-6 right-6 text-[16px] leading-[1.75] muted">
                {placeholder}
              </div>
            ) : null
          }
          ErrorBoundary={LexicalErrorBoundary}
        />
      </div>
      <HistoryPlugin />
      <OnChangePlugin
        ignoreSelectionChange={ignoreSelectionChange}
        onChange={(editorState) => {
          onChange?.(getPlainText(editorState));
        }}
      />
      <InitialTextPlugin documentId={documentId} initialText={initialText} />
      <EditablePlugin editable={editable} />
    </LexicalComposer>
  );
}
