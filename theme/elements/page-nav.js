import {Element} from "../element.js";

customElements.define(
  "page-nav",
  class PageNav extends Element {
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

    static #icons = {
      open: "M1 1 l14 0 l0 3.5 l-14 0 z m0 5.25 l14 0 l0 3.5 l-14 0 z m0 5.25 l14 0 l0 3.5 l-14 0 z",
      close: "M1 4 l3 -3 l11 11 l-3 3 z m11 -3 l3 3 l-11 11 l-3 -3 z",
    };

    #state = Element.watch({open: false, transitioning: false});

    #nav = this.shadowRoot.getElementById("nav");
    #toggle = this.shadowRoot.getElementById("toggle");
    #icon = this.shadowRoot.getElementById("icon");

    constructor() {
      super();

      this.#toggle?.addEventListener("click", () => {
        this.#state.open = !this.#state.open;
        this.#state.transitioning = true;
      });

      this.#nav?.addEventListener("transitionend", () => {
        this.#state.transitioning = false;
      });

      Element.update(
        () => this.toggleAttribute("open", this.#state.open),
        () => this.#nav?.classList?.toggle("open", this.#state.open),
        () =>
          this.#nav?.classList?.toggle(
            "transitioning",
            this.#state.transitioning
          ),
        () =>
          this.#toggle?.setAttribute("aria-pressed", String(this.#state.open)),
        () =>
          this.#icon?.setAttribute(
            "d",
            PageNav.#icons[this.#state.open ? "close" : "open"]
          )
      );
    }
  }
);
