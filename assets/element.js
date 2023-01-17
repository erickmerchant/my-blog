export class Element extends HTMLElement {
  connectedCallback() {
    this.attachShadow({mode: "open"});

    let children = [].concat(this.render?.() ?? "");

    Element.appendChildren(this.shadowRoot, children);
  }

  /* dom */

  static h(tag, attrs = {}, ...children) {
    if (tag === this.fragment) {
      return children;
    }

    let node = attrs?.xmlns
      ? document.createElementNS(attrs.xmlns, tag)
      : document.createElement(tag);

    for (let [key, value] of Object.entries(attrs ?? {})) {
      if (key.startsWith("on:")) {
        node.addEventListener(key.substring(3), ...[].concat(value));
      } else if (typeof value === "function") {
        this.#writes.add({
          callback: value,
          type: "attribute",
          args: [new WeakRef(node), key],
        });
      } else {
        this.#setAttribute(node, key, value);
      }
    }

    this.appendChildren(node, children, false);

    return node;
  }

  static fragment = Symbol("fragment");

  static classNames(...args) {
    let result = [];

    for (let arg of args.flat(Infinity)) {
      if (typeof arg === "object") {
        for (let [k, v] of Object.entries(arg)) {
          if (v) {
            result.push(k);
          }
        }
      } else {
        result.push(arg);
      }
    }

    return result.join(" ");
  }

  static appendChildren(node, children, initalize = true) {
    for (let value of children.flat(Infinity)) {
      if (typeof value === "function") {
        let args = ["", ""].map((v) => document.createComment(v));

        this.#writes.add({
          callback: value,
          type: "fragment",
          args: args.map((b) => new WeakRef(b)),
        });

        value = args;
      } else {
        value = [value];
      }

      node.append(...value);
    }

    if (initalize) this.#update();
  }

  static #setAttribute(node, key, val) {
    if (node) {
      if (val != null && val !== false) {
        node.setAttribute(key, val === true ? "" : val);
      } else {
        node.removeAttribute(key);
      }
    }
  }

  /* */

  /* reactivity */

  static #scheduled = false;

  static #schedule() {
    if (!this.#scheduled) {
      this.#scheduled = true;

      window.requestAnimationFrame(() => {
        this.#scheduled = false;

        this.#update();
      });
    }
  }

  static #writes = new Set();

  static #reads = new Map();

  static #current = null;

  static #update() {
    for (let formula of this.#writes) {
      let prev = this.#current;

      this.#current = formula;

      let result = formula.callback();

      this.#current = prev;

      if (formula.type === "attribute") {
        let [node, key] = formula.args;

        this.#setAttribute(node.deref(), key, result);
      }

      if (formula.type === "fragment") {
        let [start, end] = formula.args.map((b) => b.deref());

        while (start && end && start.nextSibling !== end) {
          start.nextSibling.remove();
        }

        start.after(...[].concat(result ?? "").flat(Infinity));
      }
    }

    this.#writes.clear();
  }

  static watch(state) {
    let symbols = {};

    return new Proxy(state, {
      set: (state, key, value) => {
        if (state[key] !== value) {
          state[key] = value;

          symbols[key] ??= Symbol("");

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
          let reads = this.#reads.get(symbols[key]) ?? new Set();

          this.#reads.set(symbols[key], reads);

          reads.add(this.#current);
        }

        return state[key];
      },
    });
  }
}
