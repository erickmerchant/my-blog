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

      let icon = this.#open ? this.#refs.closeIcon : this.#refs.menuIcon;

      this.#refs.toggle?.setAttribute("aria-pressed", String(this.#open));

      this.#refs.toggle?.firstElementChild?.replaceWith(
        icon?.content?.cloneNode(true)
      );
    };

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
    }
  }
);
