window.customElements.define(
  "side-nav",
  class extends HTMLElement {
    open = false;

    toggleOpen = () => {
      this.open = !this.open;

      this.render();
    };

    connectedCallback() {
      this.open = this.getAttribute("open");

      this.setAttribute("mounted", "");

      let button = this.shadowRoot?.querySelector("button");

      button?.addEventListener("click", this.toggleOpen);
      button?.setAttribute("aria-hidden", "false");
      button?.setAttribute("tabindex", "0");

      this.render();
    }

    render() {
      this.toggleAttribute("open", this.open);

      let button = this.shadowRoot?.querySelector("button");

      button?.setAttribute("aria-expanded", this.open ? "true" : "false");
      button?.setAttribute("aria-label", this.open ? "Close nav" : "Open nav");
      button?.querySelector("slot-match").setName(this.open ? "close" : "menu");
    }
  }
);

window.customElements.define(
  "slot-match",
  class extends HTMLElement {
    connectedCallback() {
      this.setName(this.getAttribute("name"));
    }

    setName(name) {
      this.name = name;

      this.render();
    }

    render() {
      let slot = this.shadowRoot?.querySelector("slot");

      slot?.setAttribute("name", this.name);
    }
  }
);
