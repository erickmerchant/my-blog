import {html} from "../util.js";

class CodeBlock extends HTMLElement {
  connectedCallback() {
    let lines = this.textContent.split("\n");

    this.attachShadow({mode: "open"});

    const {style, pre, code, span} = html;

    this.shadowRoot.append(
      style(
        `@import url(${new URL("./code-block.css", import.meta.url).pathname});`
      ),
      pre(
        {className: "pre"},
        code(
          {className: "code"},
          lines.map((ln) => [span({className: "line"}, span(ln || " "))])
        )
      )
    );
  }
}

customElements.define("code-block", CodeBlock);
