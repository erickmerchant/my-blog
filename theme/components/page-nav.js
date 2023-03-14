import {BaseElement} from "./base-element.js";

customElements.define(
  "page-nav",
  class extends BaseElement {
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

    #refs = new Proxy(
      {},
      {
        get: (refs, id) => {
          let el = refs[id]?.deref();

          if (!el) {
            el = this.shadowRoot.getElementById(id);

            refs[id] = new WeakRef(el);
          }

          return el;
        },
      }
    );

    #open = false;

    #toggleOpen = () => {
      this.#open = !this.#open;

      this.toggleAttribute("open", this.#open);

      this.#refs.nav?.classList?.toggle("open", this.#open);

      this.#refs.toggle?.setAttribute("aria-pressed", String(this.#open));

      this.#setIcon();
    };

    #setIcon() {
      this.#refs.icon?.setAttribute(
        "d",
        this.#icons[this.#open ? "close" : "open"]
      );
    }

    #setClosing = (closing) => {
      this.#refs.nav?.classList?.toggle("closing", closing);
    };

    constructor() {
      super();

      this.#refs.nav?.addEventListener("transitionend", () => {
        this.#setClosing(false);
      });

      this.#refs.toggle?.addEventListener("click", () => {
        this.#setClosing(this.#open);
        this.#toggleOpen();
      });

      this.#setIcon();
    }
  }
);
