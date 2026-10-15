import type { EditorThemeClasses } from "lexical";

/** Map Lexical element classes onto reference `.prose-n` structure. */
export const richEditorTheme: EditorThemeClasses = {
  paragraph: "prose-n-p",
  heading: {
    h2: "prose-n-h2",
    h3: "prose-n-h3",
  },
  list: {
    ul: "prose-n-ul",
    ol: "prose-n-ol",
    listitem: "prose-n-li",
    nested: {
      listitem: "prose-n-li",
    },
  },
  quote: "prose-n-quote",
  code: "prose-n-pre",
  text: {
    bold: "font-semibold",
    italic: "italic",
    code: "prose-n-inline-code",
    underline: "underline",
  },
  link: "prose-n-a",
};
