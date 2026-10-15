import { useCallback, useEffect, useState } from "react";
import { $createCodeNode } from "@lexical/code";
import { $isLinkNode, TOGGLE_LINK_COMMAND } from "@lexical/link";
import {
  INSERT_ORDERED_LIST_COMMAND,
  INSERT_UNORDERED_LIST_COMMAND,
} from "@lexical/list";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import {
  $createHeadingNode,
  $createQuoteNode,
  $isHeadingNode,
  $isQuoteNode,
} from "@lexical/rich-text";
import { $setBlocksType } from "@lexical/selection";
import { mergeRegister } from "@lexical/utils";
import {
  $createParagraphNode,
  $getSelection,
  $isRangeSelection,
  COMMAND_PRIORITY_CRITICAL,
  FORMAT_TEXT_COMMAND,
  SELECTION_CHANGE_COMMAND,
} from "lexical";
import { LinkDialog } from "@/components/editor/LinkDialog";
import { Button } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icon";

const TOOLBAR: Array<{ cmd: string; icon: string; label: string }> = [
  { cmd: "bold", icon: "bold", label: "Bold" },
  { cmd: "italic", icon: "italic", label: "Italic" },
  { cmd: "h2", icon: "heading-2", label: "Heading" },
  { cmd: "ul", icon: "list", label: "Bulleted list" },
  { cmd: "ol", icon: "list-ordered", label: "Numbered list" },
  { cmd: "quote", icon: "text-quote", label: "Quote" },
  { cmd: "code", icon: "code", label: "Inline code" },
  { cmd: "pre", icon: "square-code", label: "Code block" },
  { cmd: "link", icon: "link", label: "Link" },
];

export function RichToolbar({ disabled = false }: { disabled?: boolean }) {
  const [editor] = useLexicalComposerContext();
  const [, setTick] = useState(0);
  const [linkOpen, setLinkOpen] = useState(false);
  const [linkUrl, setLinkUrl] = useState<string | null>(null);

  useEffect(() => {
    return mergeRegister(
      editor.registerUpdateListener(() => setTick((n) => n + 1)),
      editor.registerCommand(
        SELECTION_CHANGE_COMMAND,
        () => {
          setTick((n) => n + 1);
          return false;
        },
        COMMAND_PRIORITY_CRITICAL,
      ),
    );
  }, [editor]);

  const openLinkDialog = useCallback(() => {
    editor.getEditorState().read(() => {
      setLinkUrl($getSelectedLinkUrl());
      setLinkOpen(true);
    });
  }, [editor]);

  const run = useCallback(
    (cmd: string) => {
      if (disabled) return;

      if (cmd === "bold") {
        editor.dispatchCommand(FORMAT_TEXT_COMMAND, "bold");
        return;
      }
      if (cmd === "italic") {
        editor.dispatchCommand(FORMAT_TEXT_COMMAND, "italic");
        return;
      }
      if (cmd === "code") {
        editor.dispatchCommand(FORMAT_TEXT_COMMAND, "code");
        return;
      }
      if (cmd === "ul") {
        editor.dispatchCommand(INSERT_UNORDERED_LIST_COMMAND, undefined);
        return;
      }
      if (cmd === "ol") {
        editor.dispatchCommand(INSERT_ORDERED_LIST_COMMAND, undefined);
        return;
      }
      if (cmd === "link") {
        openLinkDialog();
        return;
      }

      editor.update(() => {
        const selection = $getSelection();
        if (!$isRangeSelection(selection)) return;

        if (cmd === "h2") {
          const block = selection.anchor.getNode().getTopLevelElementOrThrow();
          if ($isHeadingNode(block) && block.getTag() === "h2") {
            $setBlocksType(selection, () => $createParagraphNode());
          } else {
            $setBlocksType(selection, () => $createHeadingNode("h2"));
          }
          return;
        }
        if (cmd === "quote") {
          const block = selection.anchor.getNode().getTopLevelElementOrThrow();
          if ($isQuoteNode(block)) {
            $setBlocksType(selection, () => $createParagraphNode());
          } else {
            $setBlocksType(selection, () => $createQuoteNode());
          }
          return;
        }
        if (cmd === "pre") {
          const text = selection.getTextContent() || "// code";
          $setBlocksType(selection, () => {
            const node = $createCodeNode();
            node.select();
            return node;
          });
          const next = $getSelection();
          if ($isRangeSelection(next) && !text.startsWith("//")) {
            next.insertText(text);
          } else if ($isRangeSelection(next) && !next.getTextContent()) {
            next.insertText(text);
          }
        }
      });
    },
    [disabled, editor, openLinkDialog],
  );

  return (
    <>
      <div
        className="sticky top-14 md:top-0 z-10 mt-5 flex flex-wrap gap-0.5 py-1.5 border-y line"
        style={{ background: "var(--bg)" }}
        role="toolbar"
        aria-label="Formatting"
      >
        {TOOLBAR.map((t) => (
          <Button
            key={t.cmd}
            variant="ghost"
            size="sm"
            className="!px-2"
            disabled={disabled}
            aria-label={t.label}
            title={t.label}
            onMouseDown={(e) => e.preventDefault()}
            onClick={() => run(t.cmd)}
          >
            <Icon name={t.icon} />
          </Button>
        ))}
      </div>
      <LinkDialog
        open={linkOpen}
        initialUrl={linkUrl}
        onOpenChange={setLinkOpen}
        onApply={(url) => {
          editor.dispatchCommand(TOGGLE_LINK_COMMAND, url);
        }}
        onRemove={() => {
          editor.dispatchCommand(TOGGLE_LINK_COMMAND, null);
        }}
      />
    </>
  );
}

function $getSelectedLinkUrl(): string | null {
  const selection = $getSelection();
  if (!$isRangeSelection(selection)) return null;
  const node = selection.anchor.getNode();
  const parent = node.getParent();
  if ($isLinkNode(parent)) return parent.getURL();
  if ($isLinkNode(node)) return node.getURL();
  return null;
}
