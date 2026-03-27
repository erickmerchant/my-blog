import MarkdownIt from "markdown-it";
import highlightjsPlugin from "markdown-it-highlightjs";
import highlightjs from "highlight.js";

highlightjs.configure({ classPrefix: "" });

export function parse(markdown: string): Promise<string> {
  const md = new MarkdownIt({ typographer: true });

  md.use(highlightjsPlugin);

  return md.render(markdown);
}
