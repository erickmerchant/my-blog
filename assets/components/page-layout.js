import {Element} from "../element.js";

class PageLayout extends Element {
  #state = this.watch({open: false});

  toggleOpen = () => {
    this.#state.open = !this.#state.open;
  };

  effect = () => {
    this.toggleAttribute("open", this.#state.open);
  };

  render() {
    return (
      <>
        {["../common.css", "./page-layout.css"].map((url) => (
          <link rel="stylesheet" href={new URL(url, import.meta.url).href} />
        ))}
        <nav>
          <button
            class="toggle"
            aria-label="Toggle nav"
            type="button"
            aria-controls="nav"
            aria-expanded={() => String(this.#state.open)}
            onclick={this.toggleOpen}
          >
            <svg-icon name={() => (this.#state.open ? "close" : "open")} />
          </button>
          <div
            id="nav"
            class="nav"
            aria-hidden={() => String(!this.#state.open)}
            inert={() => !this.#state.open}
          >
            <slot name="nav" />
          </div>
        </nav>
        <div
          onclick={() => {
            if (this.#state.open) {
              this.toggleOpen();
            }
          }}
          class="panel"
        >
          <div
            aria-hidden={() => String(this.#state.open)}
            inert={() => this.#state.open}
          >
            <slot name="panel" />
          </div>
        </div>
      </>
    );
  }
}

customElements.define("page-layout", PageLayout);
