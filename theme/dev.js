import {h, watch, render} from "./component.js";

let getRandomInt = (max) => {
  return Math.floor(Math.random() * max);
};

customElements.define(
  "dev-component",
  class extends HTMLElement {
    #items = watch(Array.from({length: 20}, () => getRandomInt(2)));

    connectedCallback() {
      this.attachShadow({mode: "open"});

      let itemRef = Symbol("item"),
        subItemRef = Symbol("sub-item");

      let {button, ul, li, b} = h;

      render(
        [
          button(
            {
              onClick: () => {
                for (let i = 0; i < this.#items.length; i++) {
                  this.#items[i] = getRandomInt(2);
                }
              },
              type: "button",
            },
            "run"
          ),
          ul(
            {},
            Object.keys(this.#items).map((i) => () => [
              li(
                {
                  ref: itemRef,
                  class: "item",
                },
                () => (this.#items[i] ? i : "-")
              ),
              this.#items[i] ? li({ref: subItemRef}, b({}, "-")) : "",
            ])
          ),
        ],
        this.shadowRoot
      );
    }
  }
);
