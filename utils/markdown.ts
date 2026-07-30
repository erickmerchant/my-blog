import { Marked } from "marked";
import { markedHighlight } from "marked-highlight";
import hljs from "highlight.js";
import * as parse5 from "parse5";
import { type HandcraftNode, NODE_STATE } from "@handcraft/lib";

hljs.configure({ classPrefix: "" });

const marked = new Marked(
  markedHighlight({
    emptyLangClass: "",
    langPrefix: "hljs ",
    highlight(code, lang) {
      const language = hljs.getLanguage(lang) ? lang : "plaintext";
      return hljs.highlight(code, { language }).value;
    },
  }),
);

export async function parse(
  markdown: string,
): Promise<Array<HandcraftNode | string>> {
  const html = await marked.parse(markdown);
  const parsed = parse5.parseFragment(html);

  return nodeify(parsed.childNodes);
}

function nodeify(
  children: Array<parse5.DefaultTreeAdapterMap["childNode"]>,
): Array<HandcraftNode | string> {
  const result: Array<HandcraftNode | string> = [];

  for (const child of children) {
    if (child.nodeName === "#text") {
      result.push((child as parse5.DefaultTreeAdapterMap["textNode"]).value);
    } else {
      const element = child as parse5.DefaultTreeAdapterMap["element"];

      result.push({
        [NODE_STATE]: {
          name: element.nodeName,
          namespace: element.namespaceURI,
          attributes: element.attrs.map((
            attr,
          ) => ["attr", [attr.name, attr.value]]),
          children: nodeify(element.childNodes ?? []),
        },
      } as HandcraftNode);
    }
  }

  return result;
}
