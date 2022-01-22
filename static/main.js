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
        </style>
        <div part="toggle">
          <button
            type="button"
            @click=${this.toggleOpen}
            aria-label=${this.isOpen ? "Close" : "Menu"}
          >
            <div class="icon">
              <span class="line"></span>
              <span class="line"></span>
              <span class="line"></span>
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
