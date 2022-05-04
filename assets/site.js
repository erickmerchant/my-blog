import { html, render } from "/vendor/@hyper-views/framework/main.js";

class PageApp extends HTMLElement {
  open = false;

  prefersColorSchemeDark = window.matchMedia("(prefers-color-scheme: dark)");

  initTheme = () => {
    return (
      window.localStorage.getItem("theme") ??
      (this.prefersColorSchemeDark.matches ? "dark" : "light")
    );
  };

  theme = this.initTheme();

  toggleOpen = () => {
    this.open = !this.open;

    this.update();
  };

  changeTheme = (e) => {
    this.theme = e.currentTarget.value;

    window.localStorage.setItem("theme", this.theme);

    this.update();
  };

  update = () => {
    document.body.dataset.theme = this.theme;

    this.toggleAttribute("open", this.open);

    for (const anchor of this.querySelectorAll('[slot="links"] a')) {
      anchor.setAttribute("tabIndex", this.open ? "0" : "-1");
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

    <nav>
      <button
        class="nav-toggle"
        type="button"
        aria-expanded=${this.open ? "true" : "false"}
        aria-label=${this.open ? "Close nav" : "Open nav"}
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

      <div class="nav-triangle" />

      <div
        class="nav-content"
        aria-hidden=${this.open ? null : "true"}
        inert=${!this.open}
      >
        <slot name="links" />

        <form class="theme">
          <h2 class="theme-heading">Theme</h2>
          <ul class="theme-list">
            <li>
              <input
                type="radio"
                id="light"
                name="theme"
                value="light"
                tabindex=${this.open ? "0" : "-1"}
                :checked=${this.theme === "light"}
                @change=${this.changeTheme}
              />
              <label for="light">Light</label>
            </li>
            <li>
              <input
                type="radio"
                id="dark"
                name="theme"
                value="dark"
                tabindex=${this.open ? "0" : "-1"}
                :checked=${this.theme === "dark"}
                @change=${this.changeTheme}
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
    >
      <slot name="panel" />
    </div>
  `;

  connectedCallback() {
    this.attachShadow({ mode: "open" });

    this.update();

    this.prefersColorSchemeDark.addEventListener("change", () => {
      this.theme = this.initTheme();

      this.update();
    });
  }
}

customElements.define("page-app", PageApp);
