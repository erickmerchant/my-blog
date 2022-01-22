import { render, register, html } from "/vendor/@hyper-views/framework/main.js";

register(
  class {
    static tag = "site-nav";

    open = false;

    toggleOpen = () => {
      this.open = !this.open;

      document.body.classList.toggle("nav--open", this.open);

      render(this);
    };

    template = () => html`
      <div>
        <button part="toggle" type="button" @click=${this.toggleOpen}>
          ${this.open ? "Close" : "Menu"}
        </button>
        <nav part="nav">
          <slot />
        </nav>
      </div>
    `;
  }
);
