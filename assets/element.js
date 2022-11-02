export class Element extends HTMLElement {
  static #queue = new Set();

  static #scheduled = false;

  static #schedule(update) {
    this.#queue.add(update);

    if (!this.#scheduled) {
      this.#scheduled = true;

      window.requestAnimationFrame(() => {
        this.#scheduled = false;

        for (let update of this.#queue) {
          update();

          this.#queue.delete(update);
        }
      });
    }
  }

  #active = new Set();

  #callbacks = new Map();

  #createElementProxy = new Proxy(
    {},
    {
      get:
        (_, tag) =>
        (...args) =>
          this.#h(tag, ...args),
    }
  );

  #inactive = new Set();

  #reads = null;

  #updating = false;

  #appendChildren(node, children) {
    for (let value of children) {
      if (typeof value === "symbol" && this.#callbacks.has(value)) {
        let [start, end] = ["", ""].map((v) => document.createComment(v));

        this.#active.add({type: "fragment", start, end, value});

        value = [start, end];
      } else {
        value = [value];
      }

      node.append(...value);
    }
  }

  #h(tag, attrs = {}, ...children) {
    if (attrs.constructor !== Object) {
      children.unshift(attrs);
      attrs = {};
    }

    let node = attrs?.xmlns
      ? document.createElementNS(attrs.xmlns, tag)
      : document.createElement(tag);

    for (let [key, value] of Object.entries(attrs ?? {})) {
      let isListener = key.substring(0, 2) === "on";

      key = isListener ? key.substring(2) : key;

      if (typeof value === "symbol" && this.#callbacks.has(value)) {
        this.#active.add({
          type: isListener ? "listener" : "attribute",
          node,
          key,
          value,
        });
      } else if (isListener) {
        node.addEventListener(key, ...[].concat(value));
      } else {
        this.#setAttribute(node, key, value);
      }
    }

    this.#appendChildren(node, children);

    return node;
  }

  #setAttribute(node, key, val) {
    if (val != null && val !== false) {
      node.setAttribute(key, val === true ? "" : val);
    } else {
      node.removeAttribute(key);
    }
  }

  #update = () => {
    this.#updating = true;

    for (let formula of this.#active) {
      this.#reads = new Set();

      let callback = this.#callbacks.get(formula.value);

      let result = callback();

      formula.reads = this.#reads;

      if (formula.type === "listener") {
        if (formula.conroller != null) {
          formula.conroller.abort();
        }

        if (result != null) {
          let [handler = () => {}, options = {}] = [].concat(result);

          if (options === true || options === false) {
            options = {useCapture: options};
          }

          formula.conroller = new AbortController();

          options.signal = formula.conroller.signal;

          formula.node.addEventListener(formula.key, handler, options);
        }
      }

      if (formula.type === "attribute") {
        this.#setAttribute(formula.node, formula.key, result);
      }

      if (formula.type === "fragment") {
        while (formula.start.nextSibling !== formula.end) {
          formula.start.nextSibling.remove();
        }

        formula.start.after(...[].concat(result ?? ""));
      }

      this.#active.delete(formula);

      this.#inactive.add(formula);
    }

    this.#updating = false;
  };

  connectedCallback() {
    this.attachShadow({mode: "open"});

    if (this.effect) {
      this.#active.add({
        type: "effect",
        value: this.compute(this.effect),
      });
    }

    this.#appendChildren(
      this.shadowRoot,
      [].concat(this.render?.(this.#createElementProxy) ?? "")
    );

    this.#update();
  }

  compute(callback) {
    if (this.#updating) {
      return callback();
    }

    let symbol = Symbol("formula");

    this.#callbacks.set(symbol, callback);

    return symbol;
  }

  watch(state) {
    let symbols = {};

    return new Proxy(state, {
      set: (state, key, value) => {
        state[key] = value;

        symbols[key] ??= Symbol(key);

        for (let formula of this.#inactive) {
          if (formula.reads.has(symbols[key])) {
            this.#inactive.delete(formula);

            this.#active.add(formula);
          }
        }

        Element.#schedule(this.#update);

        return true;
      },
      get: (state, key) => {
        symbols[key] ??= Symbol(key);

        this.#reads.add(symbols[key]);

        return state[key];
      },
    });
  }
}
