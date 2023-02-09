import {h, watch, render} from "../component.js";

let PageNav = (props) => {
  let state = watch({open: false, closing: false});

  return (
    <nav
      class={() =>
        ["nav", state.open && "open", state.closing && "closing"]
          .filter((c) => !!c)
          .join(" ")
      }
      on:transitionend={() => {
        state.closing = false;
      }}
    >
      <button
        class="toggle"
        aria-label="Toggle Nav List"
        aria-pressed={() => String(state.open)}
        on:click={() => {
          state.closing = state.open;

          state.open = !state.open;

          props.toggle(state.open);
        }}
      >
        <svg-icon
          class="toggleIcon"
          name={() => (state.open ? "close" : "menu")}
        />
      </button>
      <div class="list">
        <slot />
      </div>
    </nav>
  );
};

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

    #getToggle = () => (open) => {
      this.toggleAttribute("open", open);
    };

    connectedCallback() {
      this.attachShadow({mode: "open"});

      render(
        <>
          <link
            rel="stylesheet"
            href="/components/page-nav.css"
          />
          <PageNav toggle={this.#getToggle} />
        </>,
        this.shadowRoot
      );
    }
  }
);
