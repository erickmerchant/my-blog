import {Element} from "../element.js";

class PageLayout extends Element {
  #state = this.watch({open: false});

  #toggleOpen = () => {
    this.#state.open = !this.#state.open;
  };

  render({"svg-icon": svgIcon, button, div, link, nav, slot}) {
    return [
      ...["../common.css", "./page-layout.css"].map((url) =>
        link({
          rel: "stylesheet",
          href: new URL(url, import.meta.url).href,
        })
      ),
      nav(
        button(
          {
            class: () => "toggle " + (this.#state.open ? "open" : "closed"),
            "aria-label": "Toggle tray",
            type: "button",
            "aria-controls": "tray",
            "aria-expanded": () => String(this.#state.open),
            onclick: this.#toggleOpen,
          },
          svgIcon({
            name: () => (this.#state.open ? "close" : "open"),
          })
        ),
        div(
          {
            id: "tray",
            class: "tray",
            inert: () => !this.#state.open,
          },
          slot({name: "links"})
        )
      ),
      div(
        {
          onclick: () => {
            if (this.#state.open) {
              this.#toggleOpen();
            }
          },
          class: () => "panel " + (this.#state.open ? "open" : "closed"),
        },
        div(
          {
            inert: () => this.#state.open,
          },
          div({class: "banner"}, slot({name: "banner"})),
          slot({name: "content"})
        )
      ),
    ];
  }
}

customElements.define("page-layout", PageLayout);
