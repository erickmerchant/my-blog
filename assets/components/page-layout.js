import {Element} from "../element.js";

class PageLayout extends Element {
  #state = this.watch({open: false});

  #toggleOpen = () => {
    this.#state.open = !this.#state.open;
  };

  render({"svg-icon": svgIcon, button, div, link, nav, slot}) {
    return [
      {
        open: this.compute(() => this.#state.open),
      },
      ...["../common.css", "./page-layout.css"].map((url) =>
        link({
          rel: "stylesheet",
          href: new URL(url, import.meta.url).href,
        })
      ),
      nav(
        button(
          {
            "aria-label": "Toggle nav",
            "type": "button",
            "aria-controls": "nav-content",
            "aria-expanded": this.compute(() => String(this.#state.open)),
            "onclick": this.#toggleOpen,
          },
          svgIcon({
            name: this.compute(() => (this.#state.open ? "close" : "open")),
          })
        ),
        div(
          {
            "id": "nav-content",
            "class": "nav-content",
            "aria-hidden": this.compute(() => String(!this.#state.open)),
            "inert": this.compute(() => !this.#state.open),
          },
          slot({name: "links"})
        )
      ),
      div(
        {
          onclick: this.compute(() => {
            if (this.#state.open) {
              return () => this.#toggleOpen(false);
            }
          }),
          class: "panel",
        },
        div(
          {
            "aria-hidden": this.compute(() => String(this.#state.open)),
            "inert": this.compute(() => this.#state.open),
          },
          slot({name: "content"})
        )
      ),
    ];
  }
}

customElements.define("page-layout", PageLayout);
