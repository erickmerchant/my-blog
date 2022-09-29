import {Element} from "../element.js";

let svgns = "http://www.w3.org/2000/svg";

class SvgIcon extends Element {
  #state = this.watch({name: this.getAttribute("name")});

  static get observedAttributes() {
    return ["name"];
  }

  attributeChangedCallback(name, old, current) {
    if (name === "name" && current !== old) {
      this.#state.name = current;
    }
  }

  render() {
    return (
      <>
        {["../common.css", "./svg-icon.css"].map((url) => (
          <link
            rel="stylesheet"
            href={new URL(url, import.meta.url).pathname}
          />
        ))}

        <svg class="icon" aria-hidden="true" xmlns={svgns}>
          <use
            href={
              new URL("./svg-icon.svg", import.meta.url).pathname +
              "#" +
              this.#state.name
            }
            xmlns={svgns}
          />
        </svg>
      </>
    );
  }
}

customElements.define("svg-icon", SvgIcon);
