class PageApp extends HTMLElement {
  open = false;

  toggleOpen = () => {
    this.open = !this.open;

    this.updateLayout();
  };

  updateLayout = () => {
    this.toggleAttribute("open", this.open);

    const shadow = this.shadowRoot;

    for (let input of shadow.querySelectorAll("[name='color-scheme-option']")) {
      input.setAttribute("tabindex", !this.open ? "-1" : "0");
    }

    shadow
      .querySelector("[name='toggle']")
      .setAttribute("aria-expanded", this.open ? "true" : "false");

    shadow
      .querySelector("[name='toggle'] slot-match")
      .setAttribute("name", this.open ? "close" : "open");

    const tabs = [
      ["nav", this.open],
      ["panel", !this.open],
    ];

    for (const [tab, active] of tabs) {
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

    for (let input of shadow.querySelectorAll("[name='color-scheme-option']")) {
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

    this.addEventListener("click", (e) => {
      if (e.target.matches("a")) {
        const href = e.target.href;

        if (new URL(href).hostname === window.location.hostname) {
          if (this.open) {
            e.preventDefault();

            shadow.addEventListener(
              "transitionend",
              () => {
                window.location.assign(href);
              },
              { once: true }
            );

            this.toggleOpen();
          }
        }
      }
    });

    shadow.getElementById("panel").addEventListener("click", () => {
      if (this.open) this.toggleOpen();
    });

    this.prefersColorSchemeDark.addEventListener("change", () => {
      this.colorScheme = this.initColorScheme();

      this.updateColorScheme();
    });

    this.updateLayout();

    this.updateColorScheme();
  }
}

class CodeBlock extends HTMLElement {
  connectedCallback() {
    this.attachShadow({ mode: "open" });

    const shadow = this.shadowRoot;

    shadow.innerHTML =
      '<style>@import "/site.css";</style><pre class="code-block"><code></code></pre>';

    const code = shadow.querySelector("code");

    for (const ln of this.innerHTML.trim().split("\n")) {
      const marker = document.createElement("span");

      marker.setAttribute("class", "number");

      code.append(marker);

      const line = document.createElement("span");

      line.setAttribute("class", "line");

      line.innerHTML = ln ? ln : " ";

      code.append(line);
    }
  }
}

class SlotMatch extends HTMLElement {
  static get observedAttributes() {
    return ["name"];
  }

  attributeChangedCallback(name, _, newValue) {
    this.shadowRoot?.querySelector("slot")?.setAttribute(name, newValue);
  }

  connectedCallback() {
    this.attachShadow({ mode: "open" });

    const shadow = this.shadowRoot;

    shadow.innerHTML = `<style>@import "/site.css";</style><slot></slot>`;

    const slot = shadow.querySelector("slot");

    slot.setAttribute("name", this.getAttribute("name"));
  }
}

customElements.define("page-app", PageApp);

customElements.define("code-block", CodeBlock);

customElements.define("slot-match", SlotMatch);
