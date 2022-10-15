import {Element, Computed} from "../element.js";

class PageLayout extends Element {
  #state = this.watch({open: false});

  effect = () => {
    this.toggleAttribute("open", this.#state.open);
  };

  #toggleOpen = () => {
    this.#state.open = !this.#state.open;
  };

  render() {
    return (
      <>
        {["../common.css", "./page-layout.css"].map((url) => (
          <link rel="stylesheet" href={new URL(url, import.meta.url).href} />
        ))}
        <nav>
          <button
            class="button"
            aria-label="Toggle nav"
            type="button"
            aria-controls="nav-content"
            aria-expanded={new Computed(() => String(this.#state.open))}
            onclick={this.#toggleOpen}
          >
            <svg-icon
              name={new Computed(() => (this.#state.open ? "close" : "open"))}
            />
          </button>
          <div
            id="nav-content"
            class="nav-content"
            aria-hidden={new Computed(() => String(!this.#state.open))}
            inert={new Computed(() => !this.#state.open)}
          >
            <slot name="links" />
          </div>
        </nav>
        <div
          onclick={
            new Computed(() => {
              if (this.#state.open) {
                return this.#toggleOpen;
              }
            })
          }
          class="panel"
        >
          <div
            aria-hidden={new Computed(() => String(this.#state.open))}
            inert={new Computed(() => this.#state.open)}
          >
            <slot name="content" />
          </div>
        </div>
      </>
    );
  }
}

customElements.define("page-layout", PageLayout);
