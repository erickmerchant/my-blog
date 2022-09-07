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

  #toggleTheme(value) {
    this.#state.theme = this.#state.theme === value ? "auto" : value;

    ThemeSelector.#storage()?.setItem("theme", this.#state.theme);
  }

  effect() {
    let theme;

    if (this.#state.theme === "auto") {
      theme = this.#state.autoTheme;
    } else {
      theme = this.#state.theme;
    }

    for (let option of ThemeSelector.#options) {
      this.closest("body").classList.toggle(option, theme === option);
    }
  }

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
          {ThemeSelector.#options.map((scheme) => {
            return (
              <button
                type="button"
                class="button"
                aria-pressed={() => String(this.#state.theme === scheme)}
                onclick={() => {
                  this.#toggleTheme(scheme);
                }}
              >
                <span class={scheme}>
                  <span class="option">
                    {() =>
                      scheme === this.#state.theme ? (
                        <slot class="check" name="check" />
                      ) : null
                    }
                  </span>
                  <span class="name">
                    {scheme}
                    {() =>
                      scheme === this.#state.autoTheme ? (
                        <span class="asterisk">✱</span>
                      ) : null
                    }
                  </span>
                </span>
              </button>
            );
          })}
          <p class="helper">✱ system default</p>
        </div>
      </>
    );
  }
}

customElements.define("theme-selector", ThemeSelector);
