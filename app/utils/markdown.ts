import { Marked } from "marked";
import Prism from "prismjs";

const marked = new Marked({ async: true });

type Node = {
  type?: string;
  tag?: string;
  children?: Array<Node>;
  attrs?: Record<string, string | boolean | null>;
  classes?: Record<string, boolean>;
  content?: string;
};

function walkPrismAST(tokens): Array<Node> {
  const result: Array<Node> = [];

  for (const token of tokens) {
    if (typeof token === "string") {
      result.push({ "type": "text", content: token });
    } else {
      result.push({
        type: "element",
        tag: "span",
        classes: { ["token-" + token.type]: true },
        children: typeof token.content === "string"
          ? [{ type: "text", content: token.content }]
          : walkPrismAST(token.content),
      });
    }
  }

  return result;
}

async function highlight(code, lang): Promise<Array<Node>> {
  if (lang === "html") lang = "markup";

  try {
    if (!Prism.languages[lang]) {
      await import(
        `prismjs/components/prism-${lang}.js`
      );
    }

    const tokens = Prism.tokenize(code, Prism.languages[lang], lang);

    return walkPrismAST(tokens);
  } catch {
    return [{ type: "text", content: code }];
  }
}

async function walkMarkedAST(tokens) {
  const result: Array<Node> = [];

  for (const node of tokens) {
    const res: Node = {};

    switch (node.type) {
      case "paragraph":
        res.type = "element";
        res.tag = "p";
        break;

      case "list":
        res.type = "element";
        res.tag = node.ordered ? "ol" : "ul";
        break;

      case "list_item":
        res.type = "element";
        res.tag = "li";
        break;

      case "text":
      case "escape":
        if (node.tokens) {
          res.type = "fragment";
          res.children = await walkMarkedAST(node.tokens);
        } else {
          res.type = "text";
          res.content = node.text;
        }
        break;

      case "link":
        res.type = "element";
        res.tag = "a";
        res.attrs = { href: node.href };
        break;

      case "heading":
        res.type = "element";
        res.tag = "h" + node.depth;
        break;

      case "space":
        break;

      case "code":
        res.type = "element";
        res.tag = "pre";
        res.children = [{
          type: "element",
          tag: "code",
          children: await highlight(node.text, node.lang),
        }];
        break;

      case "codespan":
        res.type = "element";
        res.tag = "code";
        res.children = [{
          type: "text",
          content: node.text,
        }];
        break;

      case "em":
        res.type = "element";
        res.tag = "em";
        res.children = [{
          type: "text",
          content: node.text,
        }];
        break;

      case "del":
        res.type = "element";
        res.tag = "del";
        res.children = [{
          type: "text",
          content: node.text,
        }];
        break;

      case "blockquote":
        res.type = "element";
        res.tag = "blockquote";
        break;

      default:
        throw Error(node.type + " unsupported in markdown");
    }

    if (node.tokens || node.items) {
      res.children = await walkMarkedAST(node.tokens ?? node.items);
    }

    result.push(res);
  }

  return result;
}

export async function parse(markdown) {
  const ast = await marked.lexer(markdown);

  return await walkMarkedAST(ast);
}
