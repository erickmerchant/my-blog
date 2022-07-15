let {button, code, div, form, h6, input, label, nav, pre, slot, span, style} =
  new Proxy(
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

let getClassName = (base) => (name) => ({className: `${base} ${name}`});

customElements.define(
  "page-layout",
  class extends HTMLElement {
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

      let className = getClassName("page-layout");

      this.shadowRoot.append(
        style('@import "/site.css";'),
        nav(
          (this.refs.toggle = button(
            {
              ...className("toggle"),
              ariaExpanded: "false",
              ariaLabel: "Toggle nav",
              onClick: () => this.toggleOpen(),
              type: "button",
            },
            (this.refs.toggleIcon = slot({
              ...className("icon"),
              ariaHidden: "true",
              name: "open",
            }))
          )),
          (this.refs.nav = div(
            {
              ...className("nav"),
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
              ...className("panel"),
              ariaHidden: "false",
            },
            slot({name: "panel"})
          ))
        )
      );

      this.update(true);
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

    update(initial = false) {
      let body = this.closest("body");

      for (let scheme of ["light", "dark"]) {
        body.classList.toggle(
          `color-scheme-${scheme}`,
          scheme === this.colorScheme
        );
      }

      if (initial) return;

      for (let input of this.refs.colorSchemeOptions) {
        input.checked = this.colorScheme === input.value;
      }
    }

    connectedCallback() {
      this.attachShadow({mode: "open"});

      this.refs.colorSchemeOptions = [];

      let className = getClassName("color-scheme-form");

      this.shadowRoot.append(
        style('@import "/site.css";'),
        form(
          className("root"),
          h6(className("heading"), "Color Scheme"),
          ["Light", "Dark"].map((scheme, i) => {
            let value = scheme.toLowerCase();

            return label(
              className("label"),
              (this.refs.colorSchemeOptions[i] = input({
                ...className("input"),
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

      this.update(true);
    }
  }
);

customElements.define(
  "code-block",
  class extends HTMLElement {
    connectedCallback() {
      let lines = this.textContent.trim().split("\n");

      this.attachShadow({mode: "open"});

      let className = getClassName("code-block");

      this.shadowRoot.append(
        style('@import "/site.css";'),
        pre(
          className("root"),
          code(
            className("code"),
            lines.map((ln) => [span(className("line"), span(ln || " "))])
          )
        )
      );
    }
  }
);
