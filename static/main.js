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
              class=${`Icon ${!this.isOpen ? "open" : "close"}`}
              aria-hidden="true"
            >
              ${(!this.isOpen ? ["", "", ""] : ["", ""]).map(
                () => html`<span />`
              )}
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
