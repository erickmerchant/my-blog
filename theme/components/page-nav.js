customElements.define(
  "page-nav",
  class extends HTMLElement {
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

      this.#refs.nav?.classList?.toggle("nav--open", this.#open);

      let toggle = this.#refs.toggle;
      let icon = this.#open ? this.#refs.closeIcon : this.#refs.menuIcon;

      toggle?.setAttribute("aria-pressed", String(this.#open));

      toggle?.firstElementChild?.replaceWith(icon?.content?.cloneNode(true));
    };

    #setClosing = (closing) => {
      this.#refs.nav?.classList?.toggle("nav--closing", closing);
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

      let template = this.firstElementChild;

      if (
        !this.shadowRoot &&
        template?.nodeName === "TEMPLATE" &&
        template?.hasAttribute("shadowroot")
      ) {
        let templateContent = template.content;
        let shadowRoot = this.attachShadow({
          mode: template.getAttribute("shadowroot") ?? "open",
        });

        shadowRoot.appendChild(templateContent.cloneNode(true));
      }

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
