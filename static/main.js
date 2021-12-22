import {
  render,
  register,
  html,
} from "/modules/@hyper-views/framework/index.js";

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
