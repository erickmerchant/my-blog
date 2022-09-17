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

  #state = this.watch({
    autoTheme: this.#prefersThemeDark.matches ? "dark" : "light",
    theme: ThemeSelector.#storage()?.getItem("theme") ?? "auto",
  });

  #setTheme(value) {
    this.#state.theme = this.#state.theme === value ? "auto" : value;

    ThemeSelector.#storage()?.setItem("theme", this.#state.theme);
  }

  effect = () => {
    let theme;

    if (this.#state.theme === "auto") {
      theme = this.#state.autoTheme;
    } else {
      theme = this.#state.theme;
    }

    for (let option of ThemeSelector.#options) {
      this.closest("body").classList.toggle(option, theme === option);
    }
  };

  render({link, div, h3, button, span, p}, {svg, use}) {
    this.#prefersThemeDark.addEventListener("change", (e) => {
      this.#state.autoTheme = e.matches ? "dark" : "light";
    });

    return [
      ...["../common.css", "./theme-selector.css"].map((url) =>
        link({
          rel: "stylesheet",
          href: new URL(url, import.meta.url).pathname,
        })
      ),
      div(
        {class: "root"},
        h3({}, "Theme"),
        ...ThemeSelector.#options.map((scheme) => {
          return button(
            {
              "type": "button",
              "class": "button",
              "aria-pressed": () => String(this.#state.theme === scheme),
              "onclick": () => {
                this.#setTheme(scheme);
              },
            },

            span(
              {},
              span({class: "option"}, () => [
                scheme === this.#state.theme
                  ? svg(
                      {"class": "icon", "aria-hidden": "true"},
                      use({href: "/icons.svg#check"})
                    )
                  : "",
              ]),
              span({class: "name"}, scheme, () => [
                scheme === this.#state.autoTheme
                  ? span(
                      {class: "helper"},
                      svg(
                        {"class": "icon", "aria-hidden": "true"},
                        use({href: "/icons.svg#asterisk"})
                      )
                    )
                  : "",
              ])
            )
          );
        }),
        p(
          {class: "helper"},
          svg(
            {"class": "icon", "aria-hidden": "true"},
            use({href: "/icons.svg#asterisk"})
          ),
          " system default"
        )
      ),
    ];
  }
}

customElements.define("theme-selector", ThemeSelector);
