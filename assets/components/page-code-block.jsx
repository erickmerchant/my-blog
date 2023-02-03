customElements.define(
  "page-code-block",
  class extends HTMLElement {
    constructor() {
      super();
      if (
        !this.shadowRoot &&
        this.firstChild.nodeName === "TEMPLATE" &&
        this.firstChild.hasAttribute("shadowroot")
      ) {
        let template = this.firstChild;
        let templateContent = template.content;

        const shadowRoot = this.attachShadow({
          mode: template.getAttribute("shadowroot"),
        });
        shadowRoot.appendChild(templateContent.cloneNode(true));
      }
    }
  }
);
