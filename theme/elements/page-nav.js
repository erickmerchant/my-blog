import {Element} from "../element.js";

customElements.define(
  "page-nav",
  class extends Element {
    static {
      let previousY = 0;
      let frameRequested = false;

      document.body.addEventListener("scroll", () => {
        if (!frameRequested) {
          frameRequested = true;

          window.requestAnimationFrame(() => {
            frameRequested = false;

            let currentY = document.body.scrollTop;

            if (currentY !== previousY) {
              document.body.style.setProperty(
                "--scrolling-down",
                currentY < previousY ? "0" : "1"
              );
            }

            previousY = currentY;
          });
        }
      });
    }

    #icons = {
      open: "M1 1 l14 0 l0 3.5 l-14 0 z m0 5.25 l14 0 l0 3.5 l-14 0 z m0 5.25 l14 0 l0 3.5 l-14 0 z",
      close: "M1 4 l3 -3 l11 11 l-3 3 z m11 -3 l3 3 l-11 11 l-3 -3 z",
    };

    #state = Element.watch({open: false, closing: false});

    constructor() {
      super();

      let nav = this.shadowRoot.getElementById("nav");
      let toggle = this.shadowRoot.getElementById("toggle");
      let icon = this.shadowRoot.getElementById("icon");

      nav?.addEventListener("transitionend", () => {
        this.#state.closing = false;
      });

      toggle?.addEventListener("click", () => {
        this.#state.closing = this.#state.open;

        this.#state.open = !this.#state.open;
      });

      Element.run(
        () => this.toggleAttribute("open", this.#state.open),
        () => nav?.classList?.toggle("open", this.#state.open),
        () => nav?.classList?.toggle("closing", this.#state.closing),
        () => toggle?.setAttribute("aria-pressed", String(this.#state.open)),
        () =>
          icon?.setAttribute(
            "d",
            this.#icons[this.#state.open ? "close" : "open"]
          )
      );
    }
  }
);
