let html = new Proxy(
  {},
  {
    get(_, tag) {
      return (...args) => {
        args = args.flat(Infinity);

        let el = document.createElement(tag);

        if (typeof args[0] === "object" && !(args[0] instanceof Element)) {
          let obj = args.shift();

          for (let [key, val] of Object.entries(obj)) {
            if (key.startsWith("on")) {
              el.addEventListener(
                key.substring(2).toLowerCase(),
                ...[].concat(val)
              );
            } else if (val != null) {
              el[key] = val;
            }
          }
        }

        el.append(...args);

        return el;
      };
    },
  }
);

customElements.define(
  "page-app",
  class extends HTMLElement {
    refs = {};

    open = false;

    toggleOpen = () => {
      this.open = !this.open;

      this.updateLayout();
    };

    updateLayout = () => {
      this.toggleAttribute("open", this.open);

      for (let input of this.refs.colorSchemeOptions) {
        input.tabIndex = this.open ? "0" : "-1";
      }

      this.refs.toggle.ariaExpanded = this.open ? "true" : "false";

      this.refs.toggleIcon.name = this.open ? "close" : "open";

      let tabs = {
        nav: this.open,
        panel: !this.open,
      };

      for (let [tab, active] of Object.entries(tabs)) {
        let el = this.refs[tab];

        el.ariaHidden = active ? "false" : "true";

        for (let anchor of this.querySelectorAll(`[slot="${tab}"] a`)) {
          anchor.tabIndex = active ? "0" : "-1";
        }
      }
    };

    prefersColorSchemeDark = window.matchMedia("(prefers-color-scheme: dark)");

    initColorScheme = () =>
      window.localStorage.getItem("color-scheme") ??
      (this.prefersColorSchemeDark.matches ? "dark" : "light");

    colorScheme = this.initColorScheme();

    changeColorScheme = (value) => {
      this.colorScheme = value;

      window.localStorage.setItem("color-scheme", this.colorScheme);

      this.updateColorScheme();
    };

    updateColorScheme = () => {
      this.setAttribute("color-scheme", this.colorScheme);

      for (let input of this.refs.colorSchemeOptions) {
        input.checked = this.colorScheme === input.value;
      }
    };

    connectedCallback() {
      this.attachShadow({ mode: "open" });

      let { button, div, form, h6, input, label, li, nav, slot, style, ul } =
        html;

      this.refs.colorSchemeOptions = [];

      this.shadowRoot.append(
        style('@import "/site.css";'),
        nav(
          (this.refs.toggle = button(
            {
              ariaExpanded: "false",
              ariaLabel: "Toggle nav",
              className: "toggle",
              onClick: this.toggleOpen,
              type: "button",
            },
            (this.refs.toggleIcon = slot({
              ariaHidden: "true",
              className: "icon",
              name: "open",
            }))
          )),
          (this.refs.nav = div(
            {
              ariaHidden: "true",
              className: "nav",
            },
            slot({ name: "nav" }),
            form(
              {
                className: "color-scheme-selector",
                onChange: (e) => {
                  this.changeColorScheme(e.target.value);
                },
              },
              h6("Color Scheme"),
              ul(
                ["Light", "Dark"].map((scheme, i) => [
                  li(
                    (this.refs.colorSchemeOptions[i] = input({
                      id: `color-scheme-option-${i}`,
                      tabIndex: "-1",
                      type: "radio",
                      value: scheme.toLowerCase(),
                    })),
                    label({ htmlFor: `color-scheme-option-${i}` }, scheme)
                  ),
                ])
              )
            )
          ))
        ),
        (this.refs.panel = div(
          {
            className: "panel",
            onClick: () => {
              if (this.open) {
                this.toggleOpen();
              }
            },
          },
          slot()
        ))
      );

      this.prefersColorSchemeDark.addEventListener("change", () => {
        this.colorScheme = this.initColorScheme();

        this.updateColorScheme();
      });

      this.updateLayout();

      this.updateColorScheme();
    }
  }
);

customElements.define(
  "code-block",
  class extends HTMLElement {
    connectedCallback() {
      let lines = this.textContent.trim().split("\n");

      this.attachShadow({ mode: "open" });

      let { style, pre, code, span } = html;

      this.shadowRoot.append(
        style('@import "/site.css";'),
        pre(
          { className: "code-block" },
          code(
            lines.map((ln) => [
              span({ className: "number" }),
              span({ className: "line" }, ln || " "),
            ])
          )
        )
      );
    }
  }
);
