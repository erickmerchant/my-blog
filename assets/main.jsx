/*
  @jsx h
  @jsxFrag fragment
*/

import { h, fragment, render, selector, proxy } from "./html.js";

window.customElements.define(
  "side-nav",

  class SideNav extends HTMLElement {
    static get observedAttributes() {
      return ["open"];
    }

    attributeChangedCallback(name, oldValue, newValue) {
      let isTrue = newValue === "";

      if (oldValue !== newValue && this.state[name] !== isTrue) {
        this.state[name] = isTrue;
      }
    }

    state = proxy({
      open: false,
    });

    toggleOpen = () => {
      this.state.open = !this.state.open;
      this.toggleAttribute("open", this.state.open);
    };

    connectedCallback() {
      this.attachShadow({ mode: "open" });
      this.toggleAttribute("open", this.state.open);

      let open = selector(this.state, "open");

      render(
        <>
          <style>@import '/main.css';</style>

          <nav class="SideNav nav">
            <button
              class="SideNav button"
              type="button"
              aria-expanded={open((o) => (o ? "true" : "false"))}
              aria-label={open((o) => (o ? "Close nav" : "Open nav"))}
              onclick={this.toggleOpen}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                class="SideNav icon"
                viewBox="0 0 100 100"
                aria-hidden="true"
              >
                {open((o) =>
                  o ? (
                    <>
                      <rect
                        height="20"
                        width="120"
                        transform="rotate(-45,50,50)"
                        x="-10"
                        y="40"
                      />
                      <rect
                        height="20"
                        width="120"
                        transform="rotate(45,50,50)"
                        x="-10"
                        y="40"
                      />
                    </>
                  ) : (
                    <>
                      <rect x="0" y="0" height="20" width="100" />
                      <rect x="0" y="40" height="20" width="100" />
                      <rect x="0" y="80" height="20" width="100" />
                    </>
                  )
                )}
              </svg>
            </button>

            <div class="SideNav triangle" />

            <div class="SideNav links">
              <slot name="links" />
            </div>
          </nav>

          <div class="SideNav panel">
            <slot name="panel" />
          </div>
        </>,

        this.shadowRoot
      );
    }
  }
);
