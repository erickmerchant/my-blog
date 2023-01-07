import {Element} from "../element.js";

class PageNav extends Element {
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

  #state = Element.watch({open: false});

  #toggleOpen = () => {
    this.#state.open = !this.#state.open;

    this.style.setProperty(
      "--scrolling-down-override",
      this.#state.open ? 0 : ""
    );
  };

  render({link, nav, slot, button, div, "page-icon": pageIcon}) {
    return [
      link({
        rel: "stylesheet",
        href: new URL("./page-nav.css", import.meta.url).href,
      }),
      nav({class: "nav"}, () => {
        return [
          button(
            {
              onclick: this.#toggleOpen,
              class: "toggle",
              "aria-label": "Toggle Nav List",
            },
            pageIcon({
              class: "toggle-icon",
              name: () => (this.#state.open ? "close" : "open"),
            })
          ),
          div(
            {
              class: () => (this.#state.open ? "list open" : "list not-open"),
            },
            div({class: "list-content"}, slot())
          ),
        ];
      }),
    ];
  }
}

customElements.define("page-nav", PageNav);
