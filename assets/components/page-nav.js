import {Element} from "../element.js";

let svgns = "http://www.w3.org/2000/svg";

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
      this.#state.open ? "0" : null
    );
  };

  render({link, nav, slot, button, div, svg, path}) {
    return [
      link({
        rel: "stylesheet",
        href: new URL("./page-nav.css", import.meta.url).href,
      }),
      nav(
        {class: "nav"},
        button(
          {
            onclick: this.#toggleOpen,
            class: "toggle",
            "aria-label": "Toggle Nav List",
            "aria-pressed": () => String(this.#state.open),
          },
          svg(
            {
              class: "toggle-icon",
              "aria-hidden": "true",
              viewBox: "0 0 16 16",
              xmlns: svgns,
            },
            path({
              class: () => (this.#state.open ? "icon-close" : "icon-open"),
              xmlns: svgns,
            })
          )
        ),
        div(
          {
            class: () => (this.#state.open ? "list--open" : "list"),
          },
          div({class: "list-content"}, slot())
        )
      ),
    ];
  }
}

customElements.define("page-nav", PageNav);
