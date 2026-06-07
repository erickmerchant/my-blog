import MarkdownIt from "markdown-it";
import highlightjsPlugin from "markdown-it-highlightjs";
import highlightjs from "highlight.js";
import * as parse5 from "parse5";
import { type HandcraftNode, NODE_STATE } from "@handcraft/lib";

highlightjs.configure({ classPrefix: "" });

export function parse(markdown: string): Array<HandcraftNode | string> {
  const md = new MarkdownIt({ typographer: true });

  md.use(highlightjsPlugin);

  const html = md.render(markdown);
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
