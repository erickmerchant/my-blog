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
          * {
            font: inherit;
            box-sizing: border-box;
            max-width: 100%;
            padding: 0;
            margin: 0;
          }
        </style>
        <button part="toggle" type="button" @click=${this.toggleOpen}>
          ${this.isOpen ? "Close" : "Menu"}
        </button>
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
