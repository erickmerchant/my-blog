window.customElements.define(
  "page-layout",
  class extends HTMLElement {
    open = false;

    toggleOpen = () => {
      this.open = !this.open;

      this.render();
    };

    connectedCallback() {
      let button = this.shadowRoot?.querySelector("button");

      button?.addEventListener("click", this.toggleOpen);
      button?.setAttribute("aria-hidden", "false");
      button?.setAttribute("tabindex", "0");

      this.render();
    }

    render() {
      this.shadowRoot?.host?.toggleAttribute("open", this.open);

      let button = this.shadowRoot?.querySelector("button");

      button?.setAttribute("aria-expanded", this.open ? "true" : "false");
      button?.setAttribute("aria-label", this.open ? "Close nav" : "Open nav");
      button
        ?.querySelector("icon-match")
        ?.setAttribute("name", this.open ? "close" : "menu");
    }
  }
);

window.customElements.define(
  "icon-match",
  class extends HTMLElement {
    static get observedAttributes() {
      return ["name"];
    }

    attributeChangedCallback() {
      this.render();
    }

    render() {
      let slot = this.shadowRoot?.querySelector("slot");

      slot?.setAttribute("name", this.shadowRoot?.host?.getAttribute("name"));
    }
  }
);
