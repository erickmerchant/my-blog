import {h, watch, render} from "../component.js";

customElements.define(
  "page-nav",
  class extends HTMLElement {
    static {
      let previousY = 0,
        frameRequested = false;

      document.body.addEventListener("scroll", () => {
        if (!frameRequested) {
          frameRequested = true;

          window.requestAnimationFrame(() => {
            frameRequested = false;

            let currentY = document.body.scrollTop;

            if (currentY !== previousY) {
              document.body.style.setProperty(
                "--scrolling-down",
                currentY < previousY ? "0" : "1"
              );
            }

            previousY = currentY;
          });
        }
      });
    }

    #state = watch({open: false, closing: false});

    #toggle = (open) => {
      this.toggleAttribute("open", open);
    };

    connectedCallback() {
      this.attachShadow({mode: "open"});

      let {link, nav, button, "svg-icon": svgIcon, div, slot} = h;

      render(
        [
          link({
            rel: "stylesheet",
            href: "/components/page-nav.css",
          }),
          nav(
            {
              class: () =>
                [
                  "nav",
                  this.#state.open && "open",
                  this.#state.closing && "closing",
                ]
                  .filter((c) => !!c)
                  .join(" "),
              onTransitionend: () => {
                this.#state.closing = false;
              },
            },
            button(
              {
                class: "toggle",
                "aria-label": "Toggle Nav List",
                "aria-pressed": () => String(this.#state.open),
                onClick: () => {
                  this.#state.closing = this.#state.open;

                  this.#state.open = !this.#state.open;

                  this.#toggle(this.#state.open);
                },
              },
              svgIcon({
                class: "toggleIcon",
                name: () => (this.#state.open ? "close" : "menu"),
              })
            ),
            div({class: "list"}, slot())
          ),
        ],
        this.shadowRoot
      );
    }
  }
);
