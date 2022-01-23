import { render, register, html } from "/vendor/@hyper-views/framework/main.js";

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
          @import "/static/page-layout.css";

          button {
            display: none;
          }
        </style>
        <div part="toggle">
          <button
            class="Button root"
            type="button"
            aria-label=${this.isOpen ? "Close" : "Menu"}
            @click=${this.toggleOpen}
          >
            <div
              class=${["Icon root", this.isOpen ? "close" : "open"].join(" ")}
              aria-hidden="true"
            >
              <span class="Icon line" />
              <span class="Icon line" />
              ${!this.isOpen ? html`<span class="Icon line" />` : ""}
            </div>
          </button>
        </div>
        <nav part="nav">
          <slot name="nav" />
        </nav>
        <div part="panel">
          <slot name="panel" />
        </div>
      </page-layout>
    `;
  }
);
