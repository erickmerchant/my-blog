import { html, render } from "/vendor/@hyper-views/framework/main.js";

const closeIcon = html`
  <rect height="20" width="120" transform="rotate(-45,50,50)" x="-10" y="40" />
  <rect height="20" width="120" transform="rotate(45,50,50)" x="-10" y="40" />
`;

const openIcon = html`
  <rect x="0" y="0" transform="" height="20" width="100" />
  <rect x="0" y="40" transform="" height="20" width="100" />
  <rect x="0" y="80" transform="" height="20" width="100" />
`;

class SideNav extends HTMLElement {
  open = false;

  toggleOpen = () => {
    this.open = !this.open;

    this.update();
  };

  update() {
    this.toggleAttribute("open", this.open);

    for (const anchor of this.querySelectorAll('[slot="links"] a')) {
      anchor.setAttribute("tabIndex", this.open ? "0" : "-1");
    }

    render(this.view(), this.shadowRoot);
  }

  view() {
    return html`
      <style>
        @import "/main.css";
      </style>

      <nav class="SideNav nav">
        <button
          class="SideNav button"
          type="button"
          aria-expanded=${this.open ? "true" : "false"}
          aria-label=${this.open ? "Close nav" : "Open nav"}
          @click=${this.toggleOpen}
        >
          <svg class="Icon self" viewBox="0 0 100 100" aria-hidden="true">
            ${this.open ? closeIcon : openIcon}
          </svg>
        </button>

        <div class="SideNav triangle" />

        <div class="SideNav links">
          <slot name="links" />
        </div>
      </nav>

      <div class="SideNav panel">
        <slot name="panel" />
      </div>
    `;
  }

  connectedCallback() {
    this.attachShadow({ mode: "open" });

    this.update();
  }
}

customElements.define("side-nav", SideNav);
