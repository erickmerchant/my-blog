import {Element} from "../element.js";

class PageIcon extends Element {
  static #paths = {
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
    ].join(" "),
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
    ].join(" "),
  };

  static #svgns = "http://www.w3.org/2000/svg";

  static get observedAttributes() {
    return ["name"];
  }

  attributeChangedCallback(name, _, newValue) {
    this.#state[name] = newValue;
  }

  #state = this.watch({name: this.getAttribute("name")});

  render({link, path, svg}) {
    return [
      link({
        rel: "stylesheet",
        href: new URL("./page-icon.css", import.meta.url).href,
      }),
      svg(
        {
          "aria-hidden": "true",
          viewBox: "0 0 16 16",
          xmlns: PageIcon.#svgns,
        },
        () =>
          this.#state.name
            ? path({
                d: PageIcon.#paths[this.#state.name],
                xmlns: PageIcon.#svgns,
              })
            : ""
      ),
    ];
  }
}

customElements.define("page-icon", PageIcon);
