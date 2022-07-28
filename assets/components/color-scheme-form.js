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
        {super.render()}
        <link
          rel="stylesheet"
          href={new URL("./color-scheme-form.css", import.meta.url).pathname}
        />
        <form className="form">
          <h6 className="heading">Color Scheme</h6>
          {this.#options.map((scheme) => {
            let value = scheme.toLowerCase();

            return (
              <label className="label">
                <input
                  className="input"
                  type="radio"
                  value={value}
                  checked={() => this.#colorScheme === value}
                  onChange={() => {
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
