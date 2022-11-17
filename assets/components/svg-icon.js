import {Element} from "../element.js";

class SvgIcon extends Element {
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

  #state = this.watch({name: null});

  render({link, path, svg}) {
    return [
      {
        name: this.observe((name) => (this.#state.name = name)),
      },
      ...["../common.css", "./svg-icon.css"].map((url) =>
        link({
          rel: "stylesheet",
          href: new URL(url, import.meta.url).href,
        })
      ),
      svg(
        {
          "aria-hidden": "true",
          "viewBox": "0 0 16 16",
          "xmlns": SvgIcon.#svgns,
        },
        this.compute(() =>
          this.#state.name
            ? path({
                d: SvgIcon.#paths[this.#state.name],
                xmlns: SvgIcon.#svgns,
              })
            : ""
        )
      ),
    ];
  }
}

customElements.define("svg-icon", SvgIcon);
