import {Element} from "../element.js";

class PageLayout extends Element {
  open = false;

  toggleOpen() {
    this.open = !this.open;

    this.update();
  }

  effect() {
    this.toggleAttribute("open", this.open);
  }

  update() {
    this.effect();

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

  render() {
    return (
      <>
        <link
          rel="stylesheet"
          href={new URL("../common.css", import.meta.url).pathname}
        />
        <link
          rel="stylesheet"
          href={new URL("./page-layout.css", import.meta.url).pathname}
        />
        <nav>
          {
            (this.refs.toggle = (
              <button
                className="toggle"
                ariaExpanded="false"
                ariaLabel="Toggle nav"
                onClick={() => this.toggleOpen()}
                type="button"
              >
                {
                  (this.refs.toggleIcon = (
                    <slot className="icon" ariaHidden="true" name="open" />
                  ))
                }
              </button>
            ))
          }
          {
            (this.refs.nav = (
              <div className="nav" ariaHidden="true" inert>
                <slot name="nav" />
              </div>
            ))
          }
        </nav>
        <div
          onClick={() => {
            if (this.open) {
              this.toggleOpen();
            }
          }}
        >
          {
            (this.refs.panel = (
              <div className="panel" ariaHidden="false">
                <slot name="panel" />
              </div>
            ))
          }
        </div>
      </>
    );
  }
}

customElements.define("page-layout", PageLayout);
