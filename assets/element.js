export class Element extends HTMLElement {
  connectedCallback() {
    this.attachShadow({mode: "open"});

    let children = [].concat(this.render?.(this.#createElementProxy) ?? "");

    if (typeof children[0] === "object" && children[0].constructor === Object) {
      this.#setAttributes(this, children.shift());
    }

    this.#appendChildren(this.shadowRoot, children);

    this.#update();
  }

  /* dom */

  #createElementProxy = new Proxy(
    {},
    {
      get:
        (_, tag) =>
        (...args) =>
          this.#h(tag, ...args),
    }
  );

  #appendChildren(node, children) {
    for (let value of children) {
      if (typeof value === "function") {
        let bounds = ["", ""].map((v) => document.createComment(v));

        this.#writes.add({
          callback: value,
          type: "fragment",
          bounds: bounds.map((b) => new WeakRef(b)),
        });

        value = bounds;
      } else {
        value = [value];
      }

      node.append(...value);
    }
  }

  #h(tag, attrs = {}, ...children) {
    if (typeof attrs !== "object" || attrs.constructor !== Object) {
      children.unshift(attrs);
      attrs = {};
    }

    let node = attrs?.xmlns
      ? document.createElementNS(attrs.xmlns, tag)
      : document.createElement(tag);

    this.#setAttributes(node, attrs ?? {});

    this.#appendChildren(node, children);

    return node;
  }

  #setAttribute(node, key, val) {
    if (node) {
      if (val != null && val !== false) {
        node.setAttribute(key, val === true ? "" : val);
      } else {
        node.removeAttribute(key);
      }
    }
  }

  #setAttributes(node, attrs) {
    for (let [key, value] of Object.entries(attrs)) {
      if (typeof value === "symbol" && this.#observers.has(value)) {
        Element.#addObserved(node, key, this.#observers.get(value));
      } else if (key.substring(0, 2) === "on") {
        node.addEventListener(key.substring(2), ...[].concat(value));
      } else if (typeof value === "function") {
        this.#writes.add({
          callback: value,
          type: "attribute",
          node: new WeakRef(node),
          key,
        });
      } else {
        this.#setAttribute(node, key, value);
      }
    }
  }

  /* */

  /* reactivity */

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

  #writes = new Set();

  #reads = new Map();

  #current = null;

  #updating = false;

  #update = () => {
    this.#updating = true;

    for (let formula of this.#writes) {
      this.#current = formula;

      let result = formula.callback();
      let node = formula.node?.deref();

      this.#current = null;

      if (formula.type === "attribute") {
        this.#setAttribute(node, formula.key, result);
      }

      if (formula.type === "fragment") {
        let [start, end] = formula.bounds.map((b) => b.deref());

        while (start && end && start.nextSibling !== end) {
          start.nextSibling.remove();
        }

        start.after(...[].concat(result ?? ""));
      }

      this.#writes.delete(formula);
    }

    this.#updating = false;
  };

  watch(state) {
    let symbols = {};

    return new Proxy(state, {
      set: (state, key, value) => {
        if (this.#updating) {
          return false;
        }

        state[key] = value;

        symbols[key] ??= Symbol(key);

        let reads = this.#reads.get(symbols[key]);

        if (reads) {
          for (let formula of reads) {
            this.#writes.add(formula);
          }
        }

        this.#reads.set(symbols[key], new Set());

        Element.#schedule(this.#update);

        return true;
      },
      get: (state, key) => {
        symbols[key] ??= Symbol(key);

        if (this.#current) {
          let reads = this.#reads.get(symbols[key]);

          if (!reads) {
            reads = new Set();

            this.#reads.set(symbols[key], reads);
          }

          reads.add(this.#current);
        }

        return state[key];
      },
    });
  }

  /* */

  /* mutation observation */

  static #observed = new WeakMap();

  #observers = new Map();

  static #mutationObserver = new window.MutationObserver((mutations) => {
    for (let {target, attributeName} of mutations) {
      let observed = this.#observed.get(target)?.[attributeName];

      if (observed) {
        observed(target.getAttribute(attributeName));
      }
    }
  });

  static #addObserved(node, key, value) {
    let observed = this.#observed.get(node);

    if (!observed) {
      observed = {};

      this.#observed.set(node, observed);
    }

    observed[key] = value;

    this.#mutationObserver.observe(node, {attributeFilter: [key]});

    value(node.getAttribute(key));
  }

  observe(callback) {
    let symbol = Symbol("observe");

    this.#observers.set(symbol, callback);

    return symbol;
  }

  /* */
}
