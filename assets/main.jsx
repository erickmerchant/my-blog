/*
  @jsx h
  @jsxFrag fragment
*/

import { fragment, h, proxy, render, select } from "./html.js";

window.customElements.define(
  "side-nav",

  class SideNav extends HTMLElement {
    static get observedAttributes() {
      return ["open"];
    }

    state = proxy({
      open: false,
    });

    toggleOpen = () => {
      this.state.open = !this.state.open;
    };

    connectedCallback() {
      this.attachShadow({ mode: "open" });

      render(<side-nav open={select(() => this.state.open)} />, this);

      for (const anchor of this.querySelectorAll('[slot="links"] a')) {
        render(
          <a tabIndex={select(() => (this.state.open ? "0" : "-1"))} />,
          anchor
        );
      }

      render(
        <>
          <style>@import '/main.css';</style>

          <nav class="SideNav nav">
            <button
              class="SideNav button"
              type="button"
              aria-expanded={select(() => (this.state.open ? "true" : "false"))}
              aria-label={select(() =>
                this.state.open ? "Close nav" : "Open nav"
              )}
              onclick={this.toggleOpen}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                class="Icon self"
                viewBox="0 0 100 100"
                aria-hidden="true"
              >
                {select(() =>
                  this.state.open ? (
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

    attributeChangedCallback(name, oldValue, newValue) {
      let isTrue = newValue === "";

      if (oldValue !== newValue && this.state[name] !== isTrue) {
        this.state[name] = isTrue;
      }
    }
  }
);
