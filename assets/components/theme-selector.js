import {Element, svg} from "../element.js";

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
    let theme =
      this.#state.theme === "auto" ? this.#state.autoTheme : this.#state.theme;

    for (let option of ThemeSelector.#options) {
      this.closest("body").classList.toggle(option, theme === option);
    }
  };

  render() {
    this.#prefersThemeDark.addEventListener("change", (e) => {
      this.#state.autoTheme = e.matches ? "dark" : "light";
    });

    return (
      <>
        {["../common.css", "./theme-selector.css"].map((url) => (
          <link
            rel="stylesheet"
            href={new URL(url, import.meta.url).pathname}
          />
        ))}
        <div class="root">
          <h3>Theme</h3>
          {ThemeSelector.#options.map((scheme) => (
            <toggle-button
              pressed={() => this.#state.theme === scheme}
              onclick={() => {
                this.#setTheme(scheme);
              }}
            >
              <span class="name">
                {scheme}
                {() =>
                  scheme === this.#state.autoTheme ? (
                    <span class="helper">
                      <svg class="icon" aria-hidden="true" xmlns={svg}>
                        <use href="/icons.svg#asterisk" xmlns={svg} />
                      </svg>
                    </span>
                  ) : (
                    ""
                  )
                }
              </span>
            </toggle-button>
          ))}
          <p class="helper">
            <svg class="icon" aria-hidden="true" xmlns={svg}>
              <use href="/icons.svg#asterisk" xmlns={svg} />
            </svg>
            system default
          </p>
        </div>
      </>
    );
  }
}

customElements.define("theme-selector", ThemeSelector);
