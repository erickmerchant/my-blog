import {Element} from "../element.js";

class PageLayout extends Element {
  #state = this.watch({open: false});

  effect = () => {
    this.toggleAttribute("open", this.#state.open);
  };

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
            "class": "button",
            "aria-label": "Toggle nav",
            "type": "button",
            "aria-controls": "nav-content",
            "aria-expanded": this.formula(() => String(this.#state.open)),
            "onclick": this.#toggleOpen,
          },
          svgIcon({
            name: this.formula(() => (this.#state.open ? "close" : "open")),
          })
        ),
        div(
          {
            "id": "nav-content",
            "class": "nav-content",
            "aria-hidden": this.formula(() => String(!this.#state.open)),
            "inert": this.formula(() => !this.#state.open),
          },
          slot({name: "links"})
        )
      ),
      div(
        {
          onclick: this.formula(() => {
            if (this.#state.open) {
              return this.#toggleOpen;
            }
          }),
          class: "panel",
        },
        div(
          {
            "aria-hidden": this.formula(() => String(this.#state.open)),
            "inert": this.formula(() => this.#state.open),
          },
          slot({name: "content"})
        )
      ),
    ];
  }
}

customElements.define("page-layout", PageLayout);
