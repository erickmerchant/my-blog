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
            } else {
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

    toggleOpen() {
      this.open = !this.open;

      this.update();
    }

    prefersColorSchemeDark = window.matchMedia("(prefers-color-scheme: dark)");

    colorScheme =
      window.localStorage.getItem("color-scheme") ??
      (this.prefersColorSchemeDark.matches ? "dark" : "light");

    changeColorScheme(value) {
      this.colorScheme = value;

      window.localStorage.setItem("color-scheme", value);

      this.update();
    }

    update() {
      this.toggleAttribute("open", this.open);

      this.setAttribute("color-scheme", this.colorScheme);

      for (let input of this.refs.colorSchemeOptions) {
        input.tabIndex = this.open ? "0" : "-1";

        input.checked = this.colorScheme === input.value;
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
    }

    connectedCallback() {
      this.attachShadow({mode: "open"});

      let {button, div, form, h6, input, label, nav, slot, style} = html;

      this.refs.colorSchemeOptions = [];

      this.shadowRoot.append(
        style('@import "/site.css";'),
        nav(
          (this.refs.toggle = button(
            {
              ariaExpanded: "false",
              ariaLabel: "Toggle nav",
              className: "page-app toggle",
              onClick: () => this.toggleOpen(),
              type: "button",
            },
            (this.refs.toggleIcon = slot({
              ariaHidden: "true",
              className: "page-app icon",
              name: "open",
            }))
          )),
          (this.refs.nav = div(
            {
              ariaHidden: "true",
              className: "page-app nav",
            },
            slot({name: "nav"}),
            form(
              {
                className: "page-app color-scheme-form",
              },
              h6("Color Scheme"),
              ["Light", "Dark"].map((scheme, i) => {
                let value = scheme.toLowerCase();

                return label(
                  (this.refs.colorSchemeOptions[i] = input({
                    tabIndex: "-1",
                    type: "radio",
                    checked: this.colorScheme === value,
                    value,
                    onChange: () => {
                      this.changeColorScheme(value);
                    },
                  })),
                  scheme
                );
              })
            )
          ))
        ),
        (this.refs.panel = div(
          {
            className: "page-app panel",
            ariaHidden: "false",
            onClick: () => {
              if (this.open) {
                this.toggleOpen();
              }
            },
          },
          slot({name: "panel"})
        ))
      );

      this.prefersColorSchemeDark.addEventListener("change", (e) => {
        this.changeColorScheme(e.matches ? "dark" : "light");
      });

      this.update();
    }
  }
);

customElements.define(
  "code-block",
  class extends HTMLElement {
    connectedCallback() {
      let lines = this.textContent.trim().split("\n");

      this.attachShadow({mode: "open"});

      let {style, pre, code, span} = html;

      this.shadowRoot.append(
        style('@import "/site.css";'),
        pre(
          {className: "code-block root"},
          code(
            {className: "code-block code"},
            lines.map((ln) => [
              span({className: "code-block number"}),
              span({className: "code-block line"}, ln || " "),
            ])
          )
        )
      );
    }
  }
);
