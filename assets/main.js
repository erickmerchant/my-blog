window.customElements.define(
  "slot-match",
  class SlotMatch extends HTMLElement {
    connectedCallback() {
      this.setName(this.getAttribute("name"));
    }

    setName(name) {
      this.name = name;

      this.render();
    }

    render() {
      let slot = this.shadowRoot?.getElementById("slot");

      slot?.setAttribute("name", this.name);

      this.querySelector(`[slot="${this.name}"]`)?.dispatchEvent(
        new CustomEvent("slot:enter", {})
      );
    }
  }
);

window.customElements.define(
  "side-nav",
  class SideNav extends HTMLElement {
    open = false;

    toggleOpen = () => {
      this.open = !this.open;

      this.render();
    };

    connectedCallback() {
      this.open = this.getAttribute("open");

      this.setAttribute("mounted", "");

      let button = this.shadowRoot?.getElementById("toggle");

      button?.addEventListener("click", this.toggleOpen);
      button?.setAttribute("aria-hidden", "false");
      button?.setAttribute("tabindex", "0");

      this.render();
    }

    render() {
      this.toggleAttribute("open", this.open);

      let button = this.shadowRoot?.getElementById("toggle");

      button?.setAttribute("aria-expanded", this.open ? "true" : "false");
      button?.setAttribute("aria-label", this.open ? "Close nav" : "Open nav");

      this.shadowRoot
        ?.getElementById("icon")
        ?.setName(this.open ? "close" : "menu");
    }
  }
);
