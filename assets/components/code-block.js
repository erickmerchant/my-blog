import {Element} from "../element.js";

class CodeBlock extends Element {
  render({code, div, link, pre}) {
    let lines = this.textContent.trim().split("\n");

    return [
      ...["../common.css", "./code-block.css"].map((url) =>
        link({
          rel: "stylesheet",
          href: new URL(url, import.meta.url).href,
        })
      ),
      pre(
        div(
          {class: "lines"},
          ...lines.map((ln) => div({class: "line"}, code(ln)))
        )
      ),
    ];
  }
}

customElements.define("code-block", CodeBlock);
