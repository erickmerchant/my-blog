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

  render() {
    return (
      <>
        {super.render()}
        <link
          rel="stylesheet"
          href={new URL("./page-layout.css", import.meta.url).pathname}
        />
        <nav>
          <button
            className="toggle"
            ariaLabel="Toggle nav"
            type="button"
            ariaExpanded={() => String(this.open)}
            onClick={() => this.toggleOpen()}
          >
            <slot
              className="icon"
              ariaHidden="true"
              name={() => (this.open ? "close" : "open")}
            />
          </button>

          <div
            className="nav"
            ariaHidden={() => String(!this.open)}
            inert={() => !this.open}
          >
            <slot name="nav" />
          </div>
        </nav>
        <div
          onClick={() => {
            if (this.open) {
              this.toggleOpen();
            }
          }}
        >
          <div
            className="panel"
            ariaHidden={() => String(this.open)}
            inert={() => this.open}
          >
            <slot name="panel" />
          </div>
        </div>
      </>
    );
  }
}

customElements.define("page-layout", PageLayout);
