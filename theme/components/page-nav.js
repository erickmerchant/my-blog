customElements.define(
  "page-nav",
  class extends HTMLElement {
    static {
      let previousY = 0,
        frameRequested = false;

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

      this.#refs.nav.classList.toggle("nav--open", this.#open);

      this.#refs.toggle.setAttribute("aria-pressed", String(this.#open));

      this.#refs.toggleIcon.setAttribute("name", this.#open ? "close" : "menu");
    };

    #setClosing = (closing) => {
      this.#refs.nav.classList.toggle("nav--closing", closing);
    };

    #refs = new Proxy(
      {},
      {
        get: (_, id) => {
          return this.shadowRoot.getElementById(id);
        },
      }
    );

    constructor() {
      super();

      let template = document.getElementById("page-nav");

      let templateContent = template.content;

      const shadowRoot = this.attachShadow({
        mode: "open",
      });

      shadowRoot.appendChild(templateContent.cloneNode(true));

      this.#refs.nav.addEventListener("transitionend", () => {
        this.#setClosing(false);
      });

      this.#refs.toggle.addEventListener("click", () => {
        this.#setClosing(this.#open);
        this.#toggleOpen();
      });
    }
  }
);
