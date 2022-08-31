import {Element} from "../element.js";

class ColorSchemeForm extends Element {
  static #options = ["light", "dark", "auto"];

  #prefersColorSchemeDark = window.matchMedia("(prefers-color-scheme: dark)");

  #state = this.watch({
    autoColorScheme: this.#prefersColorSchemeDark.matches ? "dark" : "light",
    colorScheme: window.localStorage.getItem("color-scheme") ?? "auto",
  });

  #changeColorScheme(value) {
    this.#state.colorScheme = value;

    window.localStorage.setItem("color-scheme", value);
  }

  effect() {
    let colorScheme;

    if (this.#state.colorScheme === "auto") {
      colorScheme = this.#state.autoColorScheme;
    } else {
      colorScheme = this.#state.colorScheme;
    }

    for (let option of ColorSchemeForm.#options) {
      this.closest("body").classList.toggle(option, colorScheme === option);
    }
  }

  render() {
    this.#prefersColorSchemeDark.addEventListener("change", (e) => {
      this.#state.autoColorScheme = e.matches ? "dark" : "light";
    });

    return (
      <>
        {["../common.css", "./color-scheme-form.css"].map((url) => (
          <link
            rel="stylesheet"
            href={new URL(url, import.meta.url).pathname}
          />
        ))}
        <form class="form">
          <h3>Theme</h3>
          {ColorSchemeForm.#options.map((scheme) => {
            return (
              <button
                type="button"
                class="button"
                aria-pressed={() => String(this.#state.colorScheme === scheme)}
                onclick={() => {
                  this.#changeColorScheme(scheme);
                }}
              >
                <span
                  class={
                    scheme === "auto"
                      ? () => this.#state.autoColorScheme
                      : scheme
                  }
                >
                  <span class="circle">
                    {() =>
                      scheme === this.#state.colorScheme ? (
                        <slot class="check" name="check" />
                      ) : (
                        ""
                      )
                    }
                  </span>
                  <span class="name">{scheme}</span>
                </span>
              </button>
            );
          })}
        </form>
      </>
    );
  }
}

customElements.define("color-scheme-form", ColorSchemeForm);
