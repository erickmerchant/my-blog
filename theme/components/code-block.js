customElements.define(
  "code-block",
  class extends HTMLElement {
    constructor() {
      super();

      let template = this.firstElementChild;

      if (
        !this.shadowRoot &&
        template?.nodeName === "TEMPLATE" &&
        template?.hasAttribute("shadowroot")
      ) {
        let templateContent = template.content;
        let shadowRoot = this.attachShadow({
          mode: template.getAttribute("shadowroot") ?? "open",
        });

        shadowRoot.appendChild(templateContent.cloneNode(true));
      }
    }
  }
);
