const h = (tag, attrs, ...children) => {
  const el = document.createElement(tag);

  for (const [key, val] of Object.entries(attrs ?? {})) {
    el.setAttribute(key, val);
  }

  el.append(...children);

  return el;
};

customElements.define(
  "page-app",
  class extends HTMLElement {
    open = false;

    toggleOpen = () => {
      this.open = !this.open;

      this.updateLayout();
    };

    updateLayout = () => {
      this.toggleAttribute("open", this.open);

      const shadow = this.shadowRoot;

      for (let input of shadow.querySelectorAll(
        "[name='color-scheme-option']"
      )) {
        input.setAttribute("tabindex", !this.open ? "-1" : "0");
      }

      shadow
        .querySelector("[name='toggle']")
        .setAttribute("aria-expanded", this.open ? "true" : "false");

      shadow
        .querySelector("[name='toggle'] slot-match")
        .setAttribute("name", this.open ? "close" : "open");

      const tabs = {
        nav: this.open,
        panel: !this.open,
      };

      for (const [tab, active] of Object.entries(tabs)) {
        const el = shadow.getElementById(tab);

        if (active) {
          el.removeAttribute("aria-hidden");
        } else {
          el.setAttribute("aria-hidden", "true");
        }

        for (let anchor of this.querySelectorAll(`[slot="${tab}"] a`)) {
          anchor.setAttribute("tabindex", active ? "0" : "-1");
        }
      }
    };

    prefersColorSchemeDark = window.matchMedia("(prefers-color-scheme: dark)");

    initColorScheme = () =>
      window.localStorage.getItem("color-scheme") ??
      (this.prefersColorSchemeDark.matches ? "dark" : "light");

    colorScheme = this.initColorScheme();

    changeColorScheme = (value) => {
      this.colorScheme = value;

      window.localStorage.setItem("color-scheme", this.colorScheme);

      this.updateColorScheme();
    };

    updateColorScheme = () => {
      const shadow = this.shadowRoot;

      this.setAttribute("color-scheme", this.colorScheme);

      for (let input of shadow.querySelectorAll(
        "[name='color-scheme-option']"
      )) {
        input.checked = this.colorScheme === input.value;
      }
    };

    connectedCallback() {
      this.attachShadow({ mode: "open" });

      const shadow = this.shadowRoot;

      shadow.append(this.querySelector("template").content);

      shadow
        .querySelector("[name='toggle']")
        .addEventListener("click", this.toggleOpen);

      shadow
        .querySelector("[name='color-scheme']")
        .addEventListener("change", (e) => {
          if (e.target.matches("[name='color-scheme-option']")) {
            this.changeColorScheme(e.target.value);
          }
        });

      shadow.getElementById("panel").addEventListener("click", () => {
        if (this.open) {
          this.toggleOpen();
        }
      });

      this.prefersColorSchemeDark.addEventListener("change", () => {
        this.colorScheme = this.initColorScheme();

        this.updateColorScheme();
      });

      this.updateLayout();

      this.updateColorScheme();
    }
  }
);

customElements.define(
  "code-block",
  class extends HTMLElement {
    connectedCallback() {
      const lines = this.textContent.trim().split("\n");

      this.attachShadow({ mode: "open" });

      const shadow = this.shadowRoot;

      shadow.append(
        h("style", {}, '@import "/site.css";'),
        h(
          "pre",
          { class: "code-block" },
          h(
            "code",
            {},
            ...lines
              .map((ln) => [
                h("span", { class: "number" }),
                h("span", { class: "line" }, ln || " "),
              ])
              .flat()
          )
        )
      );
    }
  }
);

customElements.define(
  "slot-match",
  class extends HTMLElement {
    static get observedAttributes() {
      return ["name"];
    }

    attributeChangedCallback(name, _, newValue) {
      this.shadowRoot?.querySelector("slot")?.setAttribute(name, newValue);
    }

    connectedCallback() {
      this.attachShadow({ mode: "open" });

      const shadow = this.shadowRoot;

      shadow.append(h("slot", { name: this.getAttribute("name") }));
    }
  }
);
