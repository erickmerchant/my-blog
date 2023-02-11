import {h, render, watch, attr} from "../component.js";

let icons = {
  close: {
    d: "M1 4 l3 -3 l11 11 l-3 3 z m11 -3 l3 3 l-11 11 l-3 -3 z",
    width: 16,
  },
  menu: {
    d: "M1 1 l14 0 l0 3.5 l-14 0 z m0 5.25 l14 0 l0 3.5 l-14 0 z m0 5.25 l14 0 l0 3.5 l-14 0 z",
    width: 16,
  },
  arrowLeft: {
    d: "M1 8 l7 -7 l2 2 l-5 5 l5 5 l-2 2 z",
    width: 11,
  },
  arrowRight: {
    d: "M10 8 l-7 -7 l-2 2 l5 5 l-5 5 l2 2 z",
    width: 11,
  },
};

customElements.define(
  "svg-icon",
  class extends HTMLElement {
    static get observedAttributes() {
      return ["name"];
    }

    #state = watch({name: this.getAttribute("name")});

    attributeChangedCallback(name, _, newValue) {
      this.#state[name] = newValue;
    }

    connectedCallback() {
      this.attachShadow({mode: "open"});

      let iconRef = Symbol("icon");

      let {link, svg, path} = h;

      render(
        [
          link(
            attr({rel: "stylesheet", href: "/components/svg-icon.css"}),
            null
          ),
          () =>
            icons[this.#state.name]
              ? svg(
                  iconRef,
                  attr({
                    "aria-hidden": "true",
                    "viewBox": () =>
                      "0 0 " + icons[this.#state.name].width + " 16",
                  }),
                  path(
                    attr("d", () => icons[this.#state.name].d ?? ""),
                    null
                  )
                )
              : "",
        ],
        this.shadowRoot
      );
    }
  }
);
