export class Element extends HTMLElement {
  constructor() {
    super();

    let template = this.firstElementChild;

    if (!this.shadowRoot && template?.nodeName === "TEMPLATE") {
      let mode = template.getAttribute("shadowroot");

      if (mode) {
        let templateContent = template.content;
        let shadowRoot = this.attachShadow({
          mode,
        });

        shadowRoot.appendChild(templateContent.cloneNode(true));
      }
    }
  }

  static #scheduled = false;
  static #writes = new Set();
  static #reads = new Map();
  static #current = null;

  static watch(state) {
    let symbols = {};

    return new Proxy(state, {
      set: (state, key, value) => {
        if (state[key] !== value) {
          symbols[key] ??= Symbol("");

          state[key] = value;

          for (let formula of this.#reads.get(symbols[key]) ?? []) {
            this.#writes.add(formula);
          }

          this.#reads.set(symbols[key], new Set());

          this.#schedule();
        }

        return true;
      },
      get: (state, key) => {
        symbols[key] ??= Symbol("");

        if (this.#current) {
          let r = this.#reads.get(symbols[key]);

          if (!r) {
            r = new Set();

            this.#reads.set(symbols[key], r);
          }

          r.add(this.#current);
        }

        return state[key];
      },
    });
  }

  static #schedule() {
    if (!this.#scheduled) {
      this.#scheduled = true;

      window.requestAnimationFrame(() => {
        this.#scheduled = false;

        this.update(...this.#writes.values());
      });
    }
  }

  static update(...formulae) {
    for (let formula of formulae) {
      let prev = this.#current;

      this.#current = formula;

      formula();

      this.#current = prev;
    }

    this.#writes.clear();
  }
}
