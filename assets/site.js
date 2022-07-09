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
  "page-layout",
  class extends HTMLElement {
    refs = {};

    open = false;

    toggleOpen() {
      this.open = !this.open;

      this.update();
    }

    update() {
      this.toggleAttribute("open", this.open);

      this.refs.toggle.ariaExpanded = this.open ? "true" : "false";

      this.refs.toggleIcon.name = this.open ? "close" : "open";

      let active = this.open;

      for (let tab of ["nav", "panel"]) {
        let el = this.refs[tab];

        el.ariaHidden = active ? "false" : "true";

        el.inert = !active;

        active = !active;
      }
    }

    connectedCallback() {
      this.attachShadow({mode: "open"});

      let {button, div, nav, slot, style} = html;

      this.shadowRoot.append(
        style('@import "/site.css";'),
        nav(
          (this.refs.toggle = button(
            {
              ariaExpanded: "false",
              ariaLabel: "Toggle nav",
              className: "page-layout toggle",
              onClick: () => this.toggleOpen(),
              type: "button",
            },
            (this.refs.toggleIcon = slot({
              ariaHidden: "true",
              className: "page-layout icon",
              name: "open",
            }))
          )),
          (this.refs.nav = div(
            {
              ariaHidden: "true",
              className: "page-layout nav",
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
              className: "page-layout panel",
              ariaHidden: "false",
            },
            slot({name: "panel"})
          ))
        )
      );

      this.update();
    }
  }
);

customElements.define(
  "color-scheme-form",
  class extends HTMLElement {
    refs = {};

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
      let body = this.closest("body");

      for (let scheme of ["light", "dark"]) {
        body.classList.toggle(
          `color-scheme-${scheme}`,
          scheme === this.colorScheme
        );
      }

      for (let input of this.refs.colorSchemeOptions) {
        input.checked = this.colorScheme === input.value;
      }
    }

    connectedCallback() {
      this.attachShadow({mode: "open"});

      let {form, h6, input, label, style} = html;

      this.refs.colorSchemeOptions = [];

      this.shadowRoot.append(
        style('@import "/site.css";'),
        form(
          {
            className: "color-scheme-form root",
          },
          h6(
            {
              className: "color-scheme-form heading",
            },
            "Color Scheme"
          ),
          ["Light", "Dark"].map((scheme, i) => {
            let value = scheme.toLowerCase();

            return label(
              {
                className: "color-scheme-form label",
              },
              (this.refs.colorSchemeOptions[i] = input({
                className: "color-scheme-form input",
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
          {
            className: "code-block root",
          },
          code(
            {
              className: "code-block code",
            },
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
