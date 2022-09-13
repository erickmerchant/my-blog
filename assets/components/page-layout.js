import {Element} from "../element.js";

class PageLayout extends Element {
  #state = this.watch({open: false});

  toggleOpen = () => {
    this.#state.open = !this.#state.open;
  };

  effect = () => {
    this.toggleAttribute("open", this.#state.open);
  };

  render({link, nav, button, div, slot}, {svg, use}) {
    return [
      ...["../common.css", "./page-layout.css"].map((url) =>
        link({
          rel: "stylesheet",
          href: new URL(url, import.meta.url).pathname,
        })
      ),
      nav(
        {},
        button(
          {
            "class": "toggle",
            "aria-label": "Toggle nav",
            "type": "button",
            "aria-controls": "nav",
            "aria-expanded": () => String(this.#state.open),
            "onclick": this.toggleOpen,
          },
          svg(
            {"class": "icon", "aria-hidden": "true"},
            use({
              href: () =>
                this.#state.open ? "/icons.svg#close" : "/icons.svg#open",
            })
          )
        ),
        div(
          {
            "id": "nav",
            "class": "nav",
            "aria-hidden": () => String(!this.#state.open),
            "inert": () => !this.#state.open,
          },
          slot({name: "nav"})
        )
      ),
      div(
        {
          onclick: () => {
            if (this.#state.open) {
              this.toggleOpen();
            }
          },
        },
        div(
          {
            "class": "panel",
            "aria-hidden": () => String(this.#state.open),
            "inert": () => this.#state.open,
          },
          slot({name: "panel"})
        )
      ),
    ];
  }
}

customElements.define("page-layout", PageLayout);
