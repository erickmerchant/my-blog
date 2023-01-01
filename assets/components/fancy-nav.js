import {Element} from "../element.js";

class FancyNav extends Element {
  #state = this.watch({open: false, collapsed: false});

  #toggleOpen = () => {
    this.#state.open = !this.#state.open;

    this.style.setProperty("--scrolling-override", this.#state.open ? 0 : "");
  };

  render({link, nav, slot, button, div, "svg-icon": svgIcon}) {
    return [
      link({
        rel: "stylesheet",
        href: new URL("./fancy-nav.css", import.meta.url).href,
      }),
      nav({class: "nav"}, () => {
        if (this.#state.collapsed) {
          return [
            button(
              {
                onclick: this.#toggleOpen,
                class: "toggle",
                "aria-lable": "Menu",
              },
              svgIcon({name: () => (this.#state.open ? "close" : "open")})
            ),
            div(
              {
                class: () =>
                  this.#state.open ? "menu visible" : "menu hidden",
              },
              div(slot())
            ),
          ];
        }

        return slot();
      }),
    ];
  }

  #previousY = 0;

  #scrollCalcFired = false;

  #resizeObserver = new ResizeObserver(() => {
    let collapsed = this.offsetWidth < this.scrollWidth;

    this.#state.collapsed = collapsed;

    if (collapsed) {
      this.#resizeObserver.unobserve(this);
    }
  });

  #handleBodyScroll = () => {
    if (!this.#scrollCalcFired) {
      this.#scrollCalcFired = true;

      window.requestAnimationFrame(() => {
        this.#scrollCalcFired = false;

        let body = document.body;

        let currentY = body.scrollTop;

        // Scrolling down/up
        if (currentY !== this.#previousY) {
          this.style.setProperty(
            "--scrolling-down",
            currentY < this.#previousY ? 0 : 1
          );
        }

        this.#previousY = currentY;
      });
    }
  };

  connectedCallback() {
    super.connectedCallback();

    this.#resizeObserver.observe(this);

    document.body.addEventListener("scroll", this.#handleBodyScroll);
  }

  disconnectedCallback() {
    this.#resizeObserver.unobserve(this);

    document.body.removeEventListener("scroll", this.#handleBodyScroll);
  }
}

customElements.define("fancy-nav", FancyNav);
