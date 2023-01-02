import {Element} from "../element.js";

class FancyNav extends Element {
  #state = this.watch({open: false, collapsed: false});

  #toggleOpen = () => {
    this.#state.open = !this.#state.open;

    this.style.setProperty("--scrolling-down", this.#state.open ? 0 : "");
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
              svgIcon({
                class: "toggle-icon",
                name: () => (this.#state.open ? "close" : "open"),
              })
            ),
            div(
              {
                class: () =>
                  this.#state.open ? "menu visible" : "menu hidden",
              },
              div({class: "menu-content"}, slot())
            ),
          ];
        }

        return slot();
      }),
    ];
  }

  #resizeObserver = new ResizeObserver(() => {
    let collapsed = this.offsetWidth < this.scrollWidth;

    this.#state.collapsed = collapsed;

    if (collapsed) {
      this.#resizeObserver.unobserve(this);
    }
  });

  connectedCallback() {
    super.connectedCallback();

    this.#resizeObserver.observe(this);
  }

  disconnectedCallback() {
    this.#resizeObserver.unobserve(this);
  }

  static {
    let previousY = 0;

    let scrollCalcFired = false;

    document.body.addEventListener("scroll", () => {
      if (!scrollCalcFired) {
        scrollCalcFired = true;

        window.requestAnimationFrame(() => {
          scrollCalcFired = false;

          let body = document.body;

          let currentY = body.scrollTop;

          // Scrolling down/up
          if (currentY !== previousY) {
            body.style.setProperty(
              "--scrolling-down",
              currentY < previousY ? 0 : 1
            );
          }

          previousY = currentY;
        });
      }
    });
  }
}

customElements.define("fancy-nav", FancyNav);
