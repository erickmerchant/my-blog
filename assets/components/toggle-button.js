import {Element} from "../element.js";

class ToggleButton extends Element {
  #state = this.watch({pressed: this.getAttribute("pressed") === ""});

  static get observedAttributes() {
    return ["pressed"];
  }

  attributeChangedCallback(_name, old, current) {
    if (current !== old) {
      this.#state.pressed = current === "";
    }
  }

  render({button, span, link, slot}, {svg, use}) {
    return [
      ...["../common.css", "./toggle-button.css"].map((url) =>
        link({
          rel: "stylesheet",
          href: new URL(url, import.meta.url).pathname,
        })
      ),
      button(
        {
          "type": "button",
          "class": "button",
          "aria-pressed": () => String(this.#state.pressed),
        },
        span(
          {},
          span({class: "option"}, () => [
            this.#state.pressed
              ? svg(
                  {"class": "icon", "aria-hidden": "true"},
                  use({href: "/icons.svg#check"})
                )
              : "",
          ]),
          slot({})
        )
      ),
    ];
  }
}

customElements.define("toggle-button", ToggleButton);
