import { useEffect, useMemo, useRef } from "react";
import { LexicalComposer } from "@lexical/react/LexicalComposer";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { ContentEditable } from "@lexical/react/LexicalContentEditable";
import { LexicalErrorBoundary } from "@lexical/react/LexicalErrorBoundary";
import { HistoryPlugin } from "@lexical/react/LexicalHistoryPlugin";
import { LinkPlugin } from "@lexical/react/LexicalLinkPlugin";
import { ListPlugin } from "@lexical/react/LexicalListPlugin";
import { OnChangePlugin } from "@lexical/react/LexicalOnChangePlugin";
import { RichTextPlugin } from "@lexical/react/LexicalRichTextPlugin";
import { $getRoot, type EditorState } from "lexical";
import { RICH_EDITOR_NODES } from "@/components/editor/nodes";
import { richEditorTheme } from "@/components/editor/theme";
import { RichToolbar } from "@/components/editor/Toolbar";
import { cx } from "@/shared/lib/cx";

export type RichEditorValue = {
  schemaVersion: 1;
  editorState: unknown;
  plainText: string;
};

export type RichEditorProps = {
  documentId: string;
  initialEditorState?: unknown | null;
  editable?: boolean;
  /** When false, hide the formatting toolbar (preview mode). */
  showToolbar?: boolean;
  placeholder?: string;
  className?: string;
  onChange?: (value: RichEditorValue) => void;
  ignoreSelectionChange?: boolean;
};

function serializeValue(editorState: EditorState): RichEditorValue {
  let plainText = "";
  editorState.read(() => {
    plainText = $getRoot().getTextContent();
  });
  return {
    schemaVersion: 1,
    editorState: editorState.toJSON(),
    plainText,
  };
}

function InitialStatePlugin({
  documentId,
  initialEditorState,
}: {
  documentId: string;
  initialEditorState?: unknown | null;
}) {
  const [editor] = useLexicalComposerContext();
  const loaded = useRef<string | null>(null);

  useEffect(() => {
    if (loaded.current === documentId) return;
    loaded.current = documentId;
    if (!initialEditorState) return;
    try {
      const state =
        typeof initialEditorState === "string"
          ? editor.parseEditorState(initialEditorState)
          : editor.parseEditorState(JSON.stringify(initialEditorState));
      editor.setEditorState(state);
    } catch {
      // leave empty editor on corrupt state
    }
  }, [documentId, editor, initialEditorState]);

  return null;
}

function EditablePlugin({ editable }: { editable: boolean }) {
  const [editor] = useLexicalComposerContext();
  useEffect(() => {
    editor.setEditable(editable);
  }, [editable, editor]);
  return null;
}

export function RichEditor({
  documentId,
  initialEditorState,
  editable = true,
  showToolbar,
  placeholder = "Start writing. Paste code into a code block with the toolbar.",
  className,
  onChange,
  ignoreSelectionChange = true,
}: RichEditorProps) {
  const toolbarVisible = showToolbar ?? editable;
  const initialConfig = useMemo(
    () => ({
      namespace: `rich-${documentId}`,
      theme: richEditorTheme,
      nodes: RICH_EDITOR_NODES,
      editable,
      onError(error: Error) {
        console.error("[RichEditor]", error);
      },
    }),
    // Recreate composer when document changes
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [documentId],
  );

  return (
    <LexicalComposer initialConfig={initialConfig} key={documentId}>
      {toolbarVisible ? <RichToolbar disabled={!editable} /> : null}
      <div className={cx("relative", className)}>
        <RichTextPlugin
          contentEditable={
            <ContentEditable
              className={cx(
                "prose-n py-5 outline-none",
                editable ? "min-h-[40vh]" : "min-h-0",
                !editable && "cursor-default",
              )}
              aria-label={editable ? "Note body" : "Note preview"}
              aria-multiline={editable ? true : undefined}
              role={editable ? "textbox" : "article"}
            />
          }
          placeholder={
            editable ? (
              <div className="pointer-events-none absolute top-5 left-0 right-0 muted text-[0.95rem] leading-[1.7]">
                {placeholder}
              </div>
            ) : null
          }
          ErrorBoundary={LexicalErrorBoundary}
        />
      </div>
      <HistoryPlugin />
      <ListPlugin />
      <LinkPlugin />
      <OnChangePlugin
        ignoreSelectionChange={ignoreSelectionChange}
        onChange={(editorState) => {
          onChange?.(serializeValue(editorState));
        }}
      />
      <InitialStatePlugin
        documentId={documentId}
        initialEditorState={initialEditorState}
      />
      <EditablePlugin editable={editable} />
    </LexicalComposer>
  );
}
