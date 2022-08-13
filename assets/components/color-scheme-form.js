import {Element} from "../element.js";

class ColorSchemeForm extends Element {
  #options = ["Light", "Dark", "Auto"];

  #prefersColorSchemeDark = window.matchMedia("(prefers-color-scheme: dark)");

  #autoColorScheme = this.#prefersColorSchemeDark.matches ? "dark" : "light";

  #colorScheme = window.localStorage.getItem("color-scheme") ?? "auto";

  #changeColorScheme(value) {
    this.#colorScheme = value;

    window.localStorage.setItem("color-scheme", value);

    this.update();
  }

  effect() {
    let colorScheme;

    if (this.#colorScheme === "auto") {
      colorScheme = this.#autoColorScheme;
    } else {
      colorScheme = this.#colorScheme;
    }

    this.closest("body").setAttribute("data-color-scheme", colorScheme);
  }

  render() {
    this.#prefersColorSchemeDark.addEventListener("change", (e) => {
      this.#autoColorScheme = e.matches ? "dark" : "light";

      this.update();
    });

    return (
      <>
        <link
          rel="stylesheet"
          href={new URL("./color-scheme-form.css", import.meta.url).pathname}
        />
        <form class="form">
          <h3>Theme</h3>
          {this.#options.map((scheme) => {
            let value = scheme.toLowerCase();

            return (
              <button
                type="button"
                class="button"
                aria-pressed={() => String(this.#colorScheme === value)}
                onclick={() => {
                  this.#changeColorScheme(value);
                }}
              >
                <span
                  class="button-inner"
                  data-color-scheme={
                    value === "auto" ? () => this.#autoColorScheme : value
                  }
                >
                  <span class="circle">
                    {() =>
                      value === this.#colorScheme ? (
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
