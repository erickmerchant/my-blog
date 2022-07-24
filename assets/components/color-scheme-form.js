import {html} from "../util.js";

class ColorSchemeForm extends HTMLElement {
  refs = {};

  options = ["Light", "Dark"];

  prefersColorSchemeDark = window.matchMedia("(prefers-color-scheme: dark)");

  colorScheme =
    window.localStorage.getItem("color-scheme") ??
    (this.prefersColorSchemeDark.matches ? "dark" : "light");

  changeColorScheme(value) {
    this.colorScheme = value;

    window.localStorage.setItem("color-scheme", value);

    this.update();
  }

  effect() {
    let body = this.closest("body");

    body.setAttribute("data-color-scheme", this.colorScheme);
  }

  update() {
    this.effect();

    for (let input of this.refs.colorSchemeOptions) {
      input.checked = this.colorScheme === input.value;
    }
  }

  constructor() {
    super();

    this.attachShadow({mode: "open"});

    this.refs.colorSchemeOptions = [];

    let {link, form, h6, label, input} = html;

    this.shadowRoot.append(
      link({
        rel: "stylesheet",
        href: new URL("../common.css", import.meta.url).pathname,
      }),
      link({
        rel: "stylesheet",
        href: new URL("./color-scheme-form.css", import.meta.url).pathname,
      }),
      form(
        {className: "form"},
        h6({className: "heading"}, "Color Scheme"),
        this.options.map((scheme, i) => {
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

    this.effect();
  }
}

customElements.define("color-scheme-form", ColorSchemeForm);
