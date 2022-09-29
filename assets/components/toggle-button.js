import {Element} from "../element.js";

class ToggleButton extends Element {
  #state = this.watch({pressed: this.getAttribute("pressed") === ""});

  static get observedAttributes() {
    return ["pressed"];
  }

  attributeChangedCallback(name, old, current) {
    if (name === "pressed" && current !== old) {
      this.#state.pressed = current === "";
    }
  }

  render() {
    return (
      <>
        {["../common.css", "./toggle-button.css"].map((url) => (
          <link
            rel="stylesheet"
            href={new URL(url, import.meta.url).pathname}
          />
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
