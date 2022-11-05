import {Element} from "../element.js";

class PageLayout extends Element {
  #state = this.watch({open: false});

  #touchStartTouch = null;

  #touchStart = (event) => {
    let {clientX, clientY} = event.touches[0];

    this.#touchStartTouch = {clientX, clientY};
  };

  #touchEnd = (event) => {
    let {clientX, clientY} = event.changedTouches[0];
    let yDiff = clientY - this.#touchStartTouch.clientY;
    let xDiff = clientX - this.#touchStartTouch.clientX;

    if (Math.abs(xDiff) < 50) return;

    let angle = Math.abs((Math.atan2(yDiff, xDiff) * 180) / Math.PI);

    if (angle >= 170 && angle <= 180) {
      this.#state.open = false;
    }

    if (angle >= 0 && angle <= 10) {
      this.#state.open = true;
    }

    this.#touchStartTouch = null;
  };

  #toggleOpen = () => {
    this.#state.open = !this.#state.open;
  };

  effect = () => {
    this.toggleAttribute("open", this.#state.open);
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
        {
          ontouchstart: [this.#touchStart, {passive: true}],
          ontouchend: [this.#touchEnd, {passive: true}],
        },
        button(
          {
            "class": "button",
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
          ontouchstart: [this.#touchStart, {passive: true}],
          ontouchend: [this.#touchEnd, {passive: true}],
          onclick: this.compute(() => {
            if (this.#state.open) {
              return this.#toggleOpen;
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
