customElements.define(
  "code-block",
  class extends HTMLElement {
    constructor() {
      super();

      let template = this.firstChild;

      if (
        !this.shadowRoot &&
        template?.nodeName === "TEMPLATE" &&
        template?.hasAttribute("shadowroot")
      ) {
        let templateContent = template.content;

        const shadowRoot = this.attachShadow({
          mode: template.getAttribute("shadowroot"),
        });

        shadowRoot.appendChild(templateContent.cloneNode(true));
      }
    }
  }
);
