import { html, render } from "/vendor/@hyper-views/framework/main.js";

class PageApp extends HTMLElement {
  open = false;

  toggleOpen = () => {
    this.open = !this.open;

    this.update();
  };

  prefersColorSchemeDark = window.matchMedia("(prefers-color-scheme: dark)");

  initColorScheme = () =>
    window.localStorage.getItem("color-scheme") ??
    (this.prefersColorSchemeDark.matches ? "dark" : "light");

  colorScheme = this.initColorScheme();

  changeColorScheme = (e) => {
    this.colorScheme = e.currentTarget.value;

    window.localStorage.setItem("color-scheme", this.colorScheme);

    this.update();
  };

  update = () => {
    this.setAttribute("color-scheme", this.colorScheme);

    this.toggleAttribute("open", this.open);

    for (const anchor of this.querySelectorAll('[slot="links"] a')) {
      anchor.setAttribute("tabIndex", !this.open ? "-1" : "0");
    }

    for (const anchor of this.querySelectorAll('[slot="panel"] a')) {
      anchor.setAttribute("tabIndex", this.open ? "-1" : "0");
    }

    render(this.view(), this.shadowRoot);
  };

  view = () => html`
    <style>
      @import "/site.css";
    </style>

    <nav class="nav">
      <div class="nav-toggle">
        <button
          type="button"
          aria-expanded=${this.open ? "true" : "false"}
          aria-label="Toggle nav"
          @click=${this.toggleOpen}
        >
          <svg class="icon" viewBox="0 0 100 100" aria-hidden="true">
            ${this.open
              ? html`
                  <rect
                    height="20"
                    width="120"
                    transform="rotate(-45,50,50)"
                    x="-10"
                    y="40"
                  />
                  <rect
                    height="20"
                    width="120"
                    transform="rotate(45,50,50)"
                    x="-10"
                    y="40"
                  />
                `
              : html`
                  <rect x="0" y="0" transform="" height="20" width="100" />
                  <rect x="0" y="40" transform="" height="20" width="100" />
                  <rect x="0" y="80" transform="" height="20" width="100" />
                `}
          </svg>
        </button>
      </div>

      <div
        class="nav-content"
        aria-hidden=${this.open ? null : "true"}
        inert=${!this.open}
      >
        <slot name="links" />

        <form class="color-scheme-selector">
          <h6>Color Scheme</h6>
          <ul>
            <li>
              <input
                type="radio"
                id="light"
                name="color-scheme"
                value="light"
                tabindex=${this.open ? "0" : "-1"}
                :checked=${this.colorScheme === "light"}
                @change=${this.changeColorScheme}
              />
              <label for="light">Light</label>
            </li>
            <li>
              <input
                type="radio"
                id="dark"
                name="color-scheme"
                value="dark"
                tabindex=${this.open ? "0" : "-1"}
                :checked=${this.colorScheme === "dark"}
                @change=${this.changeColorScheme}
              />
              <label for="dark">Dark</label>
            </li>
          </ul>
        </form>
      </div>
    </nav>

    <div
      class="panel"
      aria-hidden=${this.open ? "true" : null}
      inert=${this.open}
      @click=${this.open ? this.toggleOpen : null}
    >
      <slot name="panel" />
    </div>
  `;

  connectedCallback() {
    this.attachShadow({ mode: "open" });

    this.update();

    this.prefersColorSchemeDark.addEventListener("change", () => {
      this.colorScheme = this.initColorScheme();

      this.update();
    });
  }
}

customElements.define("page-app", PageApp);
