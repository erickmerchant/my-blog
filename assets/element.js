export class Element extends HTMLElement {
  connectedCallback() {
    this.attachShadow({mode: "open"});

    let props = {};

    for (let {name, value} of this.attributes) {
      props[name] = value;
    }

    this.props = this.watch(props);

    let mutationObserver = new window.MutationObserver((mutations) => {
      for (let {target, attributeName} of mutations) {
        this.props[attributeName] = target.getAttribute(attributeName);
      }
    });

    mutationObserver.observe(this, {attributes: true});

    let children = [].concat(this.render?.(this.#createElementProxy) ?? "");

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
      if (key.substring(0, 2) === "on") {
        node.addEventListener(key.substring(2), ...[].concat(value));
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
  }

  /* */

  /* reactivity */

  #scheduled = false;

  #schedule() {
    if (!this.#scheduled) {
      this.#scheduled = true;

      window.requestAnimationFrame(() => {
        this.#scheduled = false;

        this.#update();
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

      this.#current = null;

      if (formula.type === "attribute") {
        let [node, key] = formula.args;

        this.#setAttribute(node.deref(), key, result);
      }

      if (formula.type === "fragment") {
        let [start, end] = formula.args.map((b) => b.deref());

        while (start && end && start.nextSibling !== end) {
          start.nextSibling.remove();
        }

        start.after(...[].concat(result ?? ""));
      }
    }

    this.#writes.clear();

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

        symbols[key] ??= Symbol("");

        let reads = this.#reads.get(symbols[key]);

        if (reads) {
          for (let formula of reads) {
            this.#writes.add(formula);
          }
        }

        this.#reads.set(symbols[key], new Set());

        this.#schedule();

        return true;
      },
      get: (state, key) => {
        symbols[key] ??= Symbol("");

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
}
