import { render, register, html } from "/vendor/@hyper-views/framework/main.js";

register(
  class {
    static tag = "site-nav";

    template = () => html`
      <div>
        <slot />
      </div>
    `;
  }
);
