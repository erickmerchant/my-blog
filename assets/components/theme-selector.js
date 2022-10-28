import {Element} from "../element.js";

class ThemeSelector extends Element {
  static #options = ["light", "dark"];

  static #storage() {
    try {
      return window.localStorage;
    } catch {
      return null;
    }
  }

  #prefersThemeDark = window.matchMedia("(prefers-color-scheme: dark)");

  #setTheme = (value) => {
    this.#state.theme = this.#state.theme === value ? "auto" : value;

    ThemeSelector.#storage()?.setItem("theme", this.#state.theme);
  };

  #state = this.watch({
    autoTheme: this.#prefersThemeDark.matches ? "dark" : "light",
    theme: ThemeSelector.#storage()?.getItem("theme") ?? "auto",
  });

  effect = () => {
    let theme =
      this.#state.theme === "auto" ? this.#state.autoTheme : this.#state.theme;

    for (let option of ThemeSelector.#options) {
      this.closest("body").classList.toggle(option, theme === option);
    }
  };

  render({
    "svg-icon": svgIcon,
    "toggle-button": toggleButton,
    div,
    h3,
    link,
    p,
    span,
  }) {
    this.#prefersThemeDark.addEventListener("change", (e) => {
      this.#state.autoTheme = e.matches ? "dark" : "light";
    });

    return [
      ...["../common.css", "./theme-selector.css"].map((url) =>
        link({rel: "stylesheet", href: new URL(url, import.meta.url).href})
      ),
      div(
        {class: "root"},
        h3({}, "Theme"),
        ...ThemeSelector.#options.map((scheme) =>
          toggleButton(
            {
              pressed: this.formula(() => this.#state.theme === scheme),
              onclick: () => {
                this.#setTheme(scheme);
              },
            },
            span(
              {class: "name"},
              scheme,
              this.formula(() =>
                scheme === this.#state.autoTheme
                  ? svgIcon({class: "helper", name: "asterisk"})
                  : ""
              )
            )
          )
        ),
        p({class: "helper"}, svgIcon({name: "asterisk"}), "system default")
      ),
    ];
  }
}

customElements.define("theme-selector", ThemeSelector);
