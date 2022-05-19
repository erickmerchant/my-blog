/*
  @jsx h
  @jsxFrag null
*/

const svgNS = "http://www.w3.org/2000/svg";

const render = (fn, target, replace = false) => {
  const result = fn();

  return replace ? target.replaceWith(...result) : target.append(...result);
};

const h = (tag, attrs, ...children) => {
  return (svg = false) => {
    svg = svg || tag === "svg";

    children = children
      .map((c) => {
        if (typeof c === "function") c = c(svg);

        return c;
      })
      .flat(Infinity);

    if (tag == null) {
      return children;
    }

    if (typeof tag === "function") {
      return tag(attrs, children)();
    }

    const el = svg
      ? document.createElementNS(svgNS, tag)
      : document.createElement(tag);

    for (const [key, val] of Object.entries(attrs ?? {})) {
      if (val != null && val !== false) {
        if (key.startsWith("on")) {
          el.addEventListener(
            key.substring(2).toLocaleLowerCase(),
            ...[].concat(val)
          );
        } else {
          el.setAttribute(key, val === true ? "" : val);
        }
      }
    }

    el.append(...children);

    return [el];
  };
};

const Icon = ({ open }) => (
  <svg id="navIcon" class="icon" viewBox="0 0 100 100" aria-hidden="true">
    {open ? (
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
    )}
  </svg>
);

class PageApp extends HTMLElement {
  open = false;

  toggleOpen = () => {
    this.open = !this.open;

    this.update();
  };

  prefersColorSchemeDark = window.matchMedia("(prefers-color-scheme: dark)");

  initColorScheme = () =>
    window.localStorage.getItem("color-scheme") ??
    (this.prefersColorSchemeDark.matches ? "dark" : "light");

  colorScheme = this.initColorScheme();

  changeColorScheme = (e) => {
    this.colorScheme = e.currentTarget.value;

    window.localStorage.setItem("color-scheme", this.colorScheme);

    this.update();
  };

  update = () => {
    this.setAttribute("color-scheme", this.colorScheme);

    this.toggleAttribute("open", this.open);

    for (const anchor of this.querySelectorAll('[slot="links"] a')) {
      anchor.setAttribute("tabIndex", this.open ? "0" : "-1");
    }

    for (const input of this.shadowRoot.querySelectorAll("input")) {
      input.setAttribute("tabIndex", this.open ? "0" : "-1");
    }

    for (const anchor of this.querySelectorAll('[slot="panel"] a')) {
      anchor.setAttribute("tabIndex", this.open ? "-1" : "0");
    }

    this.shadowRoot
      .getElementById("navToggle")
      .setAttribute("aria-expanded", this.open ? "true" : "false");

    const content = this.shadowRoot.getElementById("navContent");

    content.setAttribute("aria-hidden", this.open ? null : "true");

    content.setAttribute("inert", !this.open);

    const panel = this.shadowRoot.getElementById("panel");

    panel.setAttribute("aria-hidden", this.open ? "true" : null);

    panel.setAttribute("inert", this.open);

    render(
      <Icon open={this.open} />,
      this.shadowRoot.getElementById("navIcon"),
      true
    );
  };

  view = (
    <>
      <style>@import "/site.css";</style>

      <nav class="nav">
        <button
          id="navToggle"
          class="nav-toggle"
          type="button"
          aria-expanded={this.open ? "true" : "false"}
          aria-label="Toggle nav"
          onClick={this.toggleOpen}
        >
          <Icon open={this.open} />
        </button>

        <div class="nav-triangle" />

        <div
          id="navContent"
          class="nav-content"
          aria-hidden={this.open ? null : "true"}
          inert={!this.open}
        >
          <slot name="links" />

          <form class="color-scheme-selector">
            <h6>Color Scheme</h6>
            <ul>
              <li>
                <input
                  type="radio"
                  id="light"
                  name="color-scheme"
                  value="light"
                  tabIndex={this.open ? "0" : "-1"}
                  checked={this.colorScheme === "light"}
                  onChange={this.changeColorScheme}
                />
                <label for="light">Light</label>
              </li>
              <li>
                <input
                  type="radio"
                  id="dark"
                  name="color-scheme"
                  value="dark"
                  tabIndex={this.open ? "0" : "-1"}
                  checked={this.colorScheme === "dark"}
                  onChange={this.changeColorScheme}
                />
                <label for="dark">Dark</label>
              </li>
            </ul>
          </form>
        </div>
      </nav>

      <div
        id="panel"
        class="panel"
        aria-hidden={this.open ? "true" : null}
        inert={this.open}
        onClick={this.open ? this.toggleOpen : null}
      >
        <slot name="panel" />
      </div>
    </>
  );

  connectedCallback() {
    this.attachShadow({ mode: "open" });

    render(this.view, this.shadowRoot);

    this.setAttribute("color-scheme", this.colorScheme);

    this.prefersColorSchemeDark.addEventListener("change", () => {
      this.colorScheme = this.initColorScheme();

      this.update();
    });
  }
}

customElements.define("page-app", PageApp);
