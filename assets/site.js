let attrs =
  (obj = {}) =>
  (el) => {
    for (let [key, val] of Object.entries(obj)) {
      if (val === true) {
        val = "";
      }

      el.setAttribute(key, val);
    }
  };

let attr = (key, val) => (el) => el.setAttribute(key, val);

let on =
  (...args) =>
  (el) => {
    el.addEventListener(...args);
  };

let html = new Proxy(
  {},
  {
    get(_, tag) {
      return (...args) => {
        let el = document.createElement(tag);
        let children = [];

        for (let arg of args) {
          if (typeof arg === "function") {
            arg(el);
          } else {
            children.push(arg);
          }
        }

        el.append(...children);

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
        input.setAttribute("tabindex", !this.open ? "-1" : "0");
      }

      this.refs.toggle.setAttribute(
        "aria-expanded",
        this.open ? "true" : "false"
      );

      this.refs.toggleIcon.setAttribute("name", this.open ? "close" : "open");

      let tabs = {
        nav: this.open,
        panel: !this.open,
      };

      for (let [tab, active] of Object.entries(tabs)) {
        let el = this.refs[tab];

        el.setAttribute("aria-hidden", active ? "false" : "true");

        for (let anchor of this.querySelectorAll(`[slot="${tab}"] a`)) {
          anchor.setAttribute("tabindex", active ? "0" : "-1");
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

      let shadow = this.shadowRoot;

      let {
        ["slot-match"]: slotMatch,
        button,
        div,
        form,
        h6,
        input,
        label,
        li,
        nav,
        slot,
        style,
        ul,
      } = html;

      this.refs.colorSchemeOptions = [];

      shadow.append(
        style('@import "/site.css"'),
        nav(
          (this.refs.toggle = button(
            attrs({
              class: "toggle",
              type: "button",
              "aria-expanded": "false",
              "aria-label": "Toggle nav",
            }),
            on("click", this.toggleOpen),
            (this.refs.toggleIcon = slotMatch(
              attrs({
                name: "open",
                class: "icon",
                "aria-hidden": "true",
              }),
              slot(attrs({ name: "open", slot: "open" })),
              slot(attrs({ name: "close", slot: "close" }))
            ))
          )),
          (this.refs.nav = div(
            attrs({
              class: "nav",
              "aria-hidden": "true",
            }),
            div(
              attr("class", "nav-inner"),
              slot(attr("name", "nav")),
              form(
                attr("class", "color-scheme-selector"),
                on("change", (e) => {
                  if (this.refs.colorSchemeOptions.includes(e.target)) {
                    this.changeColorScheme(e.target.value);
                  }
                }),
                h6("Color Scheme"),
                ul(
                  ...["Light", "Dark"]
                    .map((scheme, i) => [
                      li(
                        (this.refs.colorSchemeOptions[i] = input(
                          attrs({
                            type: "radio",
                            id: `color-scheme-option-${i}`,
                            value: scheme.toLowerCase(),
                            tabindex: "-1",
                          })
                        )),
                        label(attr("for", `color-scheme-option-${i}`), scheme)
                      ),
                    ])
                    .flat()
                )
              )
            )
          ))
        ),
        (this.refs.panel = div(
          attr("class", "panel"),
          on("click", () => {
            if (this.open) {
              this.toggleOpen();
            }
          }),
          slot(attr("name", "panel"))
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

      let shadow = this.shadowRoot;

      let { style, pre, code, span } = html;

      shadow.append(
        style('@import "/site.css";'),
        pre(
          attr("class", "code-block"),
          code(
            ...lines
              .map((ln) => [
                span(attr("class", "number")),
                span(attr("class", "line"), ln || " "),
              ])
              .flat()
          )
        )
      );
    }
  }
);

customElements.define(
  "slot-match",
  class extends HTMLElement {
    refs = {};

    static get observedAttributes() {
      return ["name"];
    }

    attributeChangedCallback(name, _, newValue) {
      this.refs.slot?.setAttribute(name, newValue);
    }

    connectedCallback() {
      this.attachShadow({ mode: "open" });

      let shadow = this.shadowRoot;

      let { slot } = html;

      this.refs.slot = slot(attr("name", this.getAttribute("name")));

      shadow.append(this.refs.slot);
    }
  }
);
