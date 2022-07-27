import {Element} from "../element.js";

class ColorSchemeForm extends Element {
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

  render() {
    this.refs.colorSchemeOptions = [];

    this.prefersColorSchemeDark.addEventListener("change", (e) => {
      this.changeColorScheme(e.matches ? "dark" : "light");
    });

    return (
      <>
        <link
          rel="stylesheet"
          href={new URL("../common.css", import.meta.url).pathname}
        />
        <link
          rel="stylesheet"
          href={new URL("./color-scheme-form.css", import.meta.url).pathname}
        />
        <form className="form">
          <h6 className="heading">Color Scheme</h6>
          {this.options.map((scheme, i) => {
            let value = scheme.toLowerCase();

            return (
              <label className="label">
                {
                  (this.refs.colorSchemeOptions[i] = (
                    <input
                      className="input"
                      type="radio"
                      checked={this.colorScheme === value}
                      value={value}
                      onChange={() => {
                        this.changeColorScheme(value);
                      }}
                    />
                  ))
                }
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
