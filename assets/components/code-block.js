import {html} from "../util.js";

class CodeBlock extends HTMLElement {
  constructor() {
    super();

    let lines = this.textContent.split("\n");

    this.attachShadow({mode: "open"});

    let {link, pre, code, span} = html;

    this.shadowRoot.append(
      link({
        rel: "stylesheet",
        href: new URL("../common.css", import.meta.url).pathname,
      }),
      link({
        rel: "stylesheet",
        href: new URL("./code-block.css", import.meta.url).pathname,
      }),
      pre(
        {className: "pre"},
        code(
          {className: "code"},
          lines.map((ln) => [span({className: "line"}, span(ln || " ", "\n"))])
        )
      )
    );
  }
}

customElements.define("code-block", CodeBlock);
