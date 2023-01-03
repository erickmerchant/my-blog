import {Element} from "../element.js";

class FancyNav extends Element {
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

  #state = this.watch({open: false});

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
        return [
          button(
            {
              onclick: this.#toggleOpen,
              class: "toggle",
              "aria-label": "Menu",
            },
            svgIcon({
              class: "toggle-icon",
              name: () => (this.#state.open ? "close" : "open"),
            })
          ),
          div(
            {
              class: () => (this.#state.open ? "menu open" : "menu not-open"),
            },
            div({class: "menu-content"}, slot())
          ),
        ];
      }),
    ];
  }
}

customElements.define("fancy-nav", FancyNav);
