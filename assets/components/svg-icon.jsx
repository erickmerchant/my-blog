import {Element, Formula} from "../element.js";

class SvgIcon extends Element {
  static #paths = {
    asterisk: [
      "M1 6",
      "L3 3",
      "L15 10",
      "L13 13",
      "z",
      "M13 3",
      "L15 6",
      "L3 13",
      "L1 10",
      "z",
      "M6.25 1",
      "L9.75 1",
      "L9.75 15",
      "L6.25 15",
      "z",
    ],
    check: ["M1 10", "L3 6.5", "L7 9", "L12 1", "L15 3", "L8 14.5", "z"],
    close: [
      "M1 4",
      "L4 1",
      "L15 12",
      "L12 15",
      "z",
      "M12 1",
      "L15 4",
      "L4 15",
      "L1 12",
      "z",
    ],
    open: [
      "M1 1",
      "L15 1",
      "L15 4.5",
      "L1 4.5",
      "z",
      "M1 6.25",
      "L15 6.25",
      "L15 9.75",
      "L1 9.75",
      "z",
      "M1 11.5",
      "L15 11.5",
      "L15 15",
      "L1 15",
      "z",
    ],
  };

  static #svgns = "http://www.w3.org/2000/svg";

  static get observedAttributes() {
    return ["name"];
  }

  #state = this.watch({name: null});

  attributeChangedCallback(name, old, current) {
    if (name === "name" && current !== old) {
      this.#state.name = current;
    }
  }

  render() {
    return (
      <>
        {["../common.css", "./svg-icon.css"].map((url) => (
          <link rel="stylesheet" href={new URL(url, import.meta.url).href} />
        ))}
        <svg
          class="icon"
          aria-hidden="true"
          viewBox="0 0 16 16"
          xmlns={SvgIcon.#svgns}
        >
          {
            new Formula(() =>
              this.#state.name ? (
                <path
                  d={SvgIcon.#paths[this.#state.name]?.join(" ")}
                  xmlns={SvgIcon.#svgns}
                />
              ) : (
                ""
              )
            )
          }
        </svg>
      </>
    );
  }
}

customElements.define("svg-icon", SvgIcon);
