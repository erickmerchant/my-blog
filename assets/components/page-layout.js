import {Element} from "../element.js";

class PageLayout extends Element {
  #open = false;

  #toggleOpen() {
    this.#open = !this.#open;

    this.update();
  }

  effect() {
    this.toggleAttribute("open", this.#open);
  }

  render() {
    let isOpen = () => this.#open;
    let isNotOpen = () => !this.#open;

    return (
      <>
        <link
          rel="stylesheet"
          href={new URL("./page-layout.css", import.meta.url).pathname}
        />
        <nav>
          <button
            class="toggle"
            aria-label="Toggle nav"
            type="button"
            aria-expanded={isOpen}
            onclick={() => this.#toggleOpen()}
          >
            <slot
              class="icon"
              aria-hidden="true"
              name={() => (this.#open ? "close" : "open")}
            />
          </button>
          <div class="nav" aria-hidden={isNotOpen} inert={isNotOpen}>
            <slot name="nav" />
          </div>
        </nav>
        <div
          onclick={() => {
            if (this.#open) {
              this.#toggleOpen();
            }
          }}
        >
          <div class="panel" aria-hidden={isOpen} inert={isOpen}>
            <slot name="panel" />
          </div>
        </div>
      </>
    );
  }
}

customElements.define("page-layout", PageLayout);
