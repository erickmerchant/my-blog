import {Element} from "../element.js";

class CheckButton extends Element {
  static get observedAttributes() {
    return ["pressed"];
  }

  #state = this.watch({pressed: null});

  attributeChangedCallback(name, old, current) {
    if (name === "pressed" && current !== old) {
      this.#state.pressed = current === "";
    }
  }

  render({"svg-icon": svgIcon, button, link, slot, span}) {
    return [
      ...["../common.css", "./check-button.css"].map((url) =>
        link({
          rel: "stylesheet",
          href: new URL(url, import.meta.url).href,
        })
      ),
      button(
        {
          "type": "button",
          "class": "button",
          "aria-pressed": this.compute(() => String(this.#state.pressed)),
        },
        span(
          span(
            {class: "option"},
            this.compute(() =>
              this.#state.pressed ? svgIcon({name: "check"}) : ""
            )
          ),
          slot()
        )
      ),
    ];
  }
}

customElements.define("check-button", CheckButton);
