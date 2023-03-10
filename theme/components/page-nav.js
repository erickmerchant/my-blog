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

    #open = false;

    #toggleOpen = () => {
      this.#open = !this.#open;

      this.toggleAttribute("open", this.#open);

      this.#refs.nav?.classList?.toggle("navOpen", this.#open);

      let toggle = this.#refs.toggle;
      let icon = this.#open ? this.#refs.closeIcon : this.#refs.menuIcon;

      toggle?.setAttribute("aria-pressed", String(this.#open));

      toggle?.firstElementChild?.replaceWith(icon?.content?.cloneNode(true));
    };

    #setClosing = (closing) => {
      this.#refs.nav?.classList?.toggle("navClosing", closing);
    };

    #refs = new Proxy(
      {},
      {
        get: (_, id) => this.shadowRoot.getElementById(id),
      }
    );

    constructor() {
      super();

      this.#refs.nav?.addEventListener("transitionend", () => {
        this.#setClosing(false);
      });

      this.#refs.toggle?.addEventListener("click", () => {
        this.#setClosing(this.#open);
        this.#toggleOpen();
      });
    }
  }
);
