import {html} from "../util.js";

class ColorSchemeForm extends HTMLElement {
  refs = {};

  prefersColorSchemeDark = window.matchMedia("(prefers-color-scheme: dark)");

  colorScheme =
    window.localStorage.getItem("color-scheme") ??
    (this.prefersColorSchemeDark.matches ? "dark" : "light");

  changeColorScheme(value) {
    this.colorScheme = value;

    window.localStorage.setItem("color-scheme", value);

    this.update();
  }

  update(initial = false) {
    let body = this.closest("body");

    for (let scheme of ["light", "dark"]) {
      body.classList.toggle(
        `color-scheme-${scheme}`,
        scheme === this.colorScheme
      );
    }

    if (initial) return;

    for (let input of this.refs.colorSchemeOptions) {
      input.checked = this.colorScheme === input.value;
    }
  }

  connectedCallback() {
    this.attachShadow({mode: "open"});

    this.refs.colorSchemeOptions = [];

    const {style, form, h6, label, input} = html;

    this.shadowRoot.append(
      style(
        `@import url(${
          new URL("./color-scheme-form.css", import.meta.url).pathname
        });`
      ),
      form(
        {className: "form"},
        h6({className: "heading"}, "Color Scheme"),
        ["Light", "Dark"].map((scheme, i) => {
          let value = scheme.toLowerCase();

          return label(
            {className: "label"},
            (this.refs.colorSchemeOptions[i] = input({
              className: "input",
              type: "radio",
              checked: this.colorScheme === value,
              value,
              onChange: () => {
                this.changeColorScheme(value);
              },
            })),
            scheme
          );
        })
      )
    );

    this.prefersColorSchemeDark.addEventListener("change", (e) => {
      this.changeColorScheme(e.matches ? "dark" : "light");
    });

    this.update(true);
  }
}

customElements.define("color-scheme-form", ColorSchemeForm);
