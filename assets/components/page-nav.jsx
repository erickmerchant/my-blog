import {Element} from "../element.js";

class PageNav extends Element {
  #state = Element.watch({open: false, closing: false});

  constructor() {
    super();

    let previousY = 0,
      scrollCalcFired = false;

    document.body.addEventListener("scroll", () => {
      if (!scrollCalcFired) {
        scrollCalcFired = true;

        window.requestAnimationFrame(() => {
          scrollCalcFired = false;

          let currentY = document.body.scrollTop;

          if (currentY !== previousY) {
            this.style.setProperty(
              "--scrolling-down",
              currentY < previousY ? "0" : "1"
            );
          }

          previousY = currentY;
        });
      }
    });
  }

  render = () => {
    return (
      <>
        <link rel="stylesheet" href="/components/page-nav.css" />
        <nav
          class={() =>
            Element.classNames("nav", {
              open: this.#state.open,
              closing: this.#state.closing,
            })
          }
          on:transitionend={() => {
            this.#state.closing = false;
          }}
        >
          <button
            class="toggle"
            aria-label="Toggle Nav List"
            aria-pressed={() => String(this.#state.open)}
            on:click={() => {
              this.#state.closing = this.#state.open;

              this.#state.open = !this.#state.open;

              this.toggleAttribute("open", this.#state.open);
            }}
          >
            <svg
              class="toggle-icon"
              aria-hidden="true"
              viewBox={() => `0 ${this.#state.open ? 16 : 0} 16 16`}
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d={[
                  "M1 1 l14 0 l0 3.5 l-14 0 z m0 5.25 l14 0 l0 3.5 l-14 0 z m0 5.25 l14 0 l0 3.5 l-14 0 z",
                  "M1 20 l3 -3 l11 11 l-3 3 z m11 -3 l3 3 l-11 11 l-3 -3 z",
                ].join(" ")}
                xmlns="http://www.w3.org/2000/svg"
              />
            </svg>
          </button>
          <div class="list">
            <slot />
          </div>
        </nav>
      </>
    );
  };
}

customElements.define("page-nav", PageNav);
