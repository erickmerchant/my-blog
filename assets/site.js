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
    const shadow = this.shadowRoot;

    const toggle = shadow.getElementById("toggle");

    const nav = shadow.getElementById("nav");

    const panel = shadow.getElementById("panel");

    this.setAttribute("color-scheme", this.colorScheme);

    this.toggleAttribute("open", this.open);

    for (let anchor of this.querySelectorAll('[slot="nav"] a')) {
      anchor.setAttribute("tabIndex", !this.open ? "-1" : "0");
    }

    for (let anchor of this.querySelectorAll('[slot="panel"] a')) {
      anchor.setAttribute("tabIndex", this.open ? "-1" : "0");
    }

    toggle.setAttribute("aria-expanded", this.open ? "true" : "false");

    if (this.open) {
      nav.removeAttribute("aria-hidden");

      panel.setAttribute("aria-hidden", "true");
    } else {
      nav.setAttribute("aria-hidden", "true");

      panel.removeAttribute("aria-hidden");
    }

    nav.toggleAttribute("inert", !this.open);

    panel.toggleAttribute("inert", this.open);

    for (let input of shadow.querySelectorAll("[name='color-scheme']")) {
      input.checked = this.colorScheme === input.value;
    }

    shadow.getElementById("icon-close").toggleAttribute("hidden", !this.open);

    shadow.getElementById("icon-open").toggleAttribute("hidden", this.open);
  };

  connectedCallback() {
    this.attachShadow({ mode: "open" });

    const shadow = this.shadowRoot;

    shadow.append(this.querySelector("template")?.content);

    shadow.getElementById("toggle").addEventListener("click", this.toggleOpen);

    for (let input of shadow.querySelectorAll("[name='color-scheme']")) {
      input.addEventListener("change", this.changeColorScheme);
    }

    shadow.getElementById("panel").addEventListener("click", () => {
      if (this.open) this.toggleOpen();
    });

    this.update();

    this.prefersColorSchemeDark.addEventListener("change", () => {
      this.colorScheme = this.initColorScheme();

      this.update();
    });
  }
}

customElements.define("page-app", PageApp);
