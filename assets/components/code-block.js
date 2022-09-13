import {Element} from "../element.js";

class CodeBlock extends Element {
  render({link, pre, code, span}) {
    let lines = this.textContent.split("\n");

    return [
      ...["../common.css", "./code-block.css"].map((url) =>
        link({
          rel: "stylesheet",
          href: new URL(url, import.meta.url).pathname,
        })
      ),
      pre(
        {class: "pre"},
        code(
          {class: "code"},
          ...lines.map((ln) => span({class: "line"}, span({}, ln || " ", "\n")))
        )
      ),
    ];
  }
}

customElements.define("code-block", CodeBlock);
