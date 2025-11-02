import { markedHighlight } from "marked-highlight";
import { Marked } from "marked";

const marked = new Marked(
  markedHighlight({
    async: true,
    highlight,
  }),
);

async function highlight(code: string, lang: string): Promise<string> {
  const { default: Prism } = await import("prismjs");

  Prism.manual = true;
  Prism.disableWorkerMessageHandler = true;

  if (lang === "html") lang = "markup";

  try {
    if (!Prism.languages[lang]) {
      await import(`prismjs/components/prism-${lang}.js`);
    }

    return Prism.highlight(code, Prism.languages[lang], lang);
  } catch {
    return code;
  }
}

export async function parse(markdown: string): Promise<string> {
  return await marked.parse(markdown);
}
