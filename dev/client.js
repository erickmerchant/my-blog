customElements.define(
  "dev-stylesheet",
  class DevStylesheet extends HTMLLinkElement {
    static #nodes = new Map();

    static {
      const esrc = new EventSource("/dev/_changes");

      esrc.onmessage = (event) => {
        let data = JSON.parse(event.data);

        for (let href of data.hrefs) {
          this.#nodes
            .get(href)
            ?.deref()
            ?.updateStyles(`${href}?v=${Date.now()}`);
        }
      };
    }

    #sheet;

    constructor() {
      super();

      let href = this.getAttribute("href");

      DevStylesheet.#nodes.set(href, new WeakRef(this));

      this.updateStyles(href, true);
    }

    updateStyles(href, init = false) {
      let root = this.getRootNode();

      fetch(href)
        .then((res) => res.text())
        .then((css) => {
          this.#sheet = this.#sheet ?? new CSSStyleSheet();

          this.#sheet.replaceSync(css);

          if (init) {
            root.adoptedStyleSheets = [...root.adoptedStyleSheets, this.#sheet];
          }
        });
    }
  },
  {extends: "link"}
);
