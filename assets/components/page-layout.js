import {html} from "../util.js";

class PageLayout extends HTMLElement {
  refs = {};

  open = false;

  toggleOpen() {
    this.open = !this.open;

    this.update();
  }

  update(initial = false) {
    this.toggleAttribute("open", this.open);

    if (initial) return;

    this.refs.toggle.ariaExpanded = String(this.open);

    this.refs.toggleIcon.name = this.open ? "close" : "open";

    let active = this.open;

    for (let tab of ["nav", "panel"]) {
      let el = this.refs[tab];

      el.ariaHidden = String(!active);

      el.inert = !active;

      active = !active;
    }
  }

  connectedCallback() {
    this.attachShadow({mode: "open"});

    const {style, nav, button, slot, div} = html;

    this.shadowRoot.append(
      style(
        `@import url(${
          new URL("./page-layout.css", import.meta.url).pathname
        });`
      ),
      nav(
        (this.refs.toggle = button(
          {
            className: "toggle",
            ariaExpanded: "false",
            ariaLabel: "Toggle nav",
            onClick: () => this.toggleOpen(),
            type: "button",
          },
          (this.refs.toggleIcon = slot({
            className: "icon",
            ariaHidden: "true",
            name: "open",
          }))
        )),
        (this.refs.nav = div(
          {
            className: "nav",
            ariaHidden: "true",
            inert: true,
          },
          slot({name: "nav"})
        ))
      ),
      div(
        {
          onClick: () => {
            if (this.open) {
              this.toggleOpen();
            }
          },
        },
        (this.refs.panel = div(
          {
            className: "panel",
            ariaHidden: "false",
          },
          slot({name: "panel"})
        ))
      )
    );

    this.update(true);
  }
}

customElements.define("page-layout", PageLayout);
