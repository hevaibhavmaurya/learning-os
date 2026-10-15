/**
 * Convert simple curriculum markdown into a Lexical editorState JSON.
 * Supports ATX headings, paragraphs, bullet/ordered lists, fenced code, quotes.
 */

type TextNode = {
  detail: 0;
  format: number;
  mode: "normal";
  style: "";
  text: string;
  type: "text";
  version: 1;
};

type ElementNode = {
  children: Array<TextNode | ElementNode>;
  direction: "ltr";
  format: "";
  indent: number;
  type: string;
  version: 1;
  tag?: string;
  listType?: "bullet" | "number";
  start?: number;
  value?: number;
  language?: string;
};

function text(value: string, format = 0): TextNode {
  return {
    detail: 0,
    format,
    mode: "normal",
    style: "",
    text: value,
    type: "text",
    version: 1,
  };
}

function paragraph(line: string): ElementNode {
  return {
    children: line ? [text(line)] : [],
    direction: "ltr",
    format: "",
    indent: 0,
    type: "paragraph",
    version: 1,
  };
}

function heading(line: string, level: number): ElementNode {
  const tag = level <= 1 ? "h2" : level === 2 ? "h2" : "h3";
  return {
    children: [text(line)],
    direction: "ltr",
    format: "",
    indent: 0,
    type: "heading",
    version: 1,
    tag,
  };
}

function quote(line: string): ElementNode {
  return {
    children: [text(line)],
    direction: "ltr",
    format: "",
    indent: 0,
    type: "quote",
    version: 1,
  };
}

function codeBlock(body: string, language = ""): ElementNode {
  return {
    children: [text(body)],
    direction: "ltr",
    format: "",
    indent: 0,
    type: "code",
    version: 1,
    language,
  };
}

function listItem(line: string, value: number): ElementNode {
  return {
    children: [paragraph(line)],
    direction: "ltr",
    format: "",
    indent: 0,
    type: "listitem",
    version: 1,
    value,
  };
}

function list(
  items: ElementNode[],
  listType: "bullet" | "number",
): ElementNode {
  return {
    children: items,
    direction: "ltr",
    format: "",
    indent: 0,
    type: "list",
    version: 1,
    listType,
    start: 1,
    tag: listType === "number" ? "ol" : "ul",
  };
}

/** Parse inline **bold** / *italic* / `code` into text nodes (best-effort). */
function inlineChildren(raw: string): TextNode[] {
  if (!raw) return [];
  const nodes: TextNode[] = [];
  const re = /(\*\*[^*]+\*\*|\*[^*]+\*|`[^`]+`)/g;
  let last = 0;
  let m: RegExpExecArray | null;
  while ((m = re.exec(raw))) {
    if (m.index > last) nodes.push(text(raw.slice(last, m.index)));
    const token = m[0]!;
    if (token.startsWith("**")) nodes.push(text(token.slice(2, -2), 1));
    else if (token.startsWith("*")) nodes.push(text(token.slice(1, -1), 2));
    else nodes.push(text(token.slice(1, -1), 16));
    last = m.index + token.length;
  }
  if (last < raw.length) nodes.push(text(raw.slice(last)));
  return nodes.length ? nodes : [text(raw)];
}

function richParagraph(line: string): ElementNode {
  return {
    children: inlineChildren(line),
    direction: "ltr",
    format: "",
    indent: 0,
    type: "paragraph",
    version: 1,
  };
}

export function markdownToEditorState(markdown: string): unknown {
  const lines = markdown.replace(/\r\n/g, "\n").split("\n");
  const children: ElementNode[] = [];
  let i = 0;
  let bulletBuf: ElementNode[] = [];
  let numberBuf: ElementNode[] = [];

  const flushLists = () => {
    if (bulletBuf.length) {
      children.push(list(bulletBuf, "bullet"));
      bulletBuf = [];
    }
    if (numberBuf.length) {
      children.push(list(numberBuf, "number"));
      numberBuf = [];
    }
  };

  while (i < lines.length) {
    const line = lines[i] ?? "";

    if (line.startsWith("```")) {
      flushLists();
      const language = line.slice(3).trim();
      i += 1;
      const body: string[] = [];
      while (i < lines.length && !(lines[i] ?? "").startsWith("```")) {
        body.push(lines[i] ?? "");
        i += 1;
      }
      children.push(codeBlock(body.join("\n"), language));
      i += 1;
      continue;
    }

    const headingMatch = /^(#{1,6})\s+(.*)$/.exec(line);
    if (headingMatch) {
      flushLists();
      children.push(heading(headingMatch[2] ?? "", headingMatch[1]!.length));
      i += 1;
      continue;
    }

    const bulletMatch = /^[-*+]\s+(.*)$/.exec(line);
    if (bulletMatch) {
      if (numberBuf.length) flushLists();
      bulletBuf.push(listItem(bulletMatch[1] ?? "", bulletBuf.length + 1));
      i += 1;
      continue;
    }

    const numberMatch = /^(\d+)\.\s+(.*)$/.exec(line);
    if (numberMatch) {
      if (bulletBuf.length) flushLists();
      numberBuf.push(
        listItem(numberMatch[2] ?? "", numberBuf.length + 1),
      );
      i += 1;
      continue;
    }

    const quoteMatch = /^>\s?(.*)$/.exec(line);
    if (quoteMatch) {
      flushLists();
      children.push(quote(quoteMatch[1] ?? ""));
      i += 1;
      continue;
    }

    if (!line.trim()) {
      flushLists();
      i += 1;
      continue;
    }

    flushLists();
    children.push(richParagraph(line));
    i += 1;
  }
  flushLists();

  if (!children.length) children.push(paragraph(""));

  return {
    root: {
      children,
      direction: "ltr",
      format: "",
      indent: 0,
      type: "root",
      version: 1,
    },
  };
}

export function looksLikeMarkdown(text: string): boolean {
  return /^(#{1,6}\s|[-*+]\s|\d+\.\s|>\s|```)/m.test(text);
}
