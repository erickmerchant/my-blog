import {Element} from "../element.js";

class ToggleButton extends Element {
  static get observedAttributes() {
    return ["pressed"];
  }

  #state = this.watch({pressed: this.getAttribute("pressed") === ""});

  attributeChangedCallback(name, old, current) {
    if (name === "pressed" && current !== old) {
      this.#state.pressed = current === "";
    }
  }

  render() {
    return (
      <>
        {["../common.css", "./toggle-button.css"].map((url) => (
          <link rel="stylesheet" href={new URL(url, import.meta.url).href} />
        ))}
        <button
          type="button"
          class="button"
          aria-pressed={() => String(this.#state.pressed)}
        >
          <span>
            <span class="option">
              {() => (this.#state.pressed ? <svg-icon name="check" /> : "")}
            </span>
            <slot />
          </span>
        </button>
      </>
    );
  }
}

customElements.define("toggle-button", ToggleButton);
