import {html} from "../util.js";

customElements.define(
  "code-block",
  class extends HTMLElement {
    connectedCallback() {
      let lines = this.textContent.split("\n");

      this.attachShadow({mode: "open"});

      const {style, pre, code, span} = html;

      this.shadowRoot.append(
        style(
          `@import url(${
            new URL("./code-block.css", import.meta.url).pathname
          });`
        ),
        pre(
          {className: "root"},
          code(
            {className: "code"},
            lines.map((ln) => [span({className: "line"}, span(ln || " "))])
          )
        )
      );
    }
  }
);
