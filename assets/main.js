window.customElements.define(
  "page-layout",
  class extends HTMLElement {
    isOpen = false;

    toggleOpen = () => {
      this.isOpen = !this.isOpen;

      this.render();
    };

    connectedCallback() {
      const button = this.shadowRoot?.querySelector("button");

      button?.addEventListener("click", this.toggleOpen);

      this.render();
    }

    render() {
      this.shadowRoot?.host?.toggleAttribute("open", this.isOpen);

      const button = this.shadowRoot?.querySelector("button");

      button
        ?.querySelector("element-match")
        ?.setAttribute("name", this.isOpen ? "close" : "menu");

      button?.setAttribute(
        "aria-label",
        this.isOpen ? "Close nav" : "Open nav"
      );

      button?.setAttribute("aria-expanded", this.isOpen ? "true" : "false");
    }
  }
);

window.customElements.define(
  "element-match",
  class extends HTMLElement {
    static get observedAttributes() {
      return ["name"];
    }

    attributeChangedCallback() {
      this.render();
    }

    render() {
      const slot = this.shadowRoot?.querySelector("slot");

      slot?.setAttribute("name", this.shadowRoot?.host?.getAttribute("name"));
    }
  }
);
