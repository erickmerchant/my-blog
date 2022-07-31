import {Element} from "../element.js";

class ColorSchemeForm extends Element {
  #options = ["Light", "Dark"];

  #prefersColorSchemeDark = window.matchMedia("(prefers-color-scheme: dark)");

  #colorScheme =
    window.localStorage.getItem("color-scheme") ??
    (this.#prefersColorSchemeDark.matches ? "dark" : "light");

  #changeColorScheme(value) {
    this.#colorScheme = value;

    window.localStorage.setItem("color-scheme", value);

    this.update();
  }

  effect() {
    this.closest("body").setAttribute("data-color-scheme", this.#colorScheme);
  }

  render() {
    this.#prefersColorSchemeDark.addEventListener("change", (e) => {
      this.#changeColorScheme(e.matches ? "dark" : "light");
    });

    return (
      <>
        <Element.Stylesheet
          href={new URL("./color-scheme-form.css", import.meta.url).pathname}
        />
        <form class="form">
          <h6 class="heading">Color Scheme</h6>
          {this.#options.map((scheme) => {
            let value = scheme.toLowerCase();

            return (
              <label class="label">
                <input
                  class="input"
                  type="radio"
                  name="colorScheme"
                  value={value}
                  checked={this.#colorScheme === value}
                  onchange={() => {
                    this.#changeColorScheme(value);
                  }}
                />
                {scheme}
              </label>
            );
          })}
        </form>
      </>
    );
  }
}

customElements.define("color-scheme-form", ColorSchemeForm);
