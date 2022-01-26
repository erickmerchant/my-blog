import { render, register, html } from "/vendor/@hyper-views/framework/main.js";

const closeIcon = html`
  <svg
    viewBox="0 0 100 100"
    xmlns="http://www.w3.org/2000/svg"
    aria-hidden="true"
    class="Nav icon"
  >
    <rect
      height="20"
      width="120"
      transform="rotate(-45,50,50)"
      x="-10"
      y="40"
    />
    <rect height="20" width="120" transform="rotate(45,50,50)" x="-10" y="40" />
  </svg>
`;

const menuIcon = html`
  <svg
    viewBox="0 0 100 100"
    xmlns="http://www.w3.org/2000/svg"
    aria-hidden="true"
    class="Nav icon"
  >
    <rect x="0" y="0" height="20" width="100" />
    <rect x="0" y="40" height="20" width="100" />
    <rect x="0" y="80" height="20" width="100" />
  </svg>
`;

register(
  class {
    static tag = "page-layout";

    isOpen = false;

    toggleOpen = () => {
      this.isOpen = !this.isOpen;

      render(this);
    };

    template = () => html`
      <page-layout open=${this.isOpen}>
        <style>
          @import "/static/main.css";
        </style>
        <nav class="Nav self">
          <button
            class="Nav button"
            type="button"
            aria-label=${this.isOpen ? "Close nav" : "Open nav"}
            aria-expanded=${this.isOpen ? "true" : "false"}
            @click=${this.toggleOpen}
          >
            ${this.isOpen ? closeIcon : menuIcon}
          </button>
          <div class="Nav links">
            ${this.isOpen ? html`<slot name="links" />` : ""}
          </div>
        </nav>
        <div class="Panel self">
          <slot name="panel" />
        </div>
      </page-layout>
    `;
  }
);
