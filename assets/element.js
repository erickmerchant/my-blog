export class Element extends HTMLElement {
  /* mutation observation */

  static #observed = new WeakMap();

  static #mutationObserver = new window.MutationObserver((mutations) => {
    for (let {target, attributeName} of mutations) {
      let o = this.#observed.get(target)?.[attributeName];

      if (o) {
        o.callback(target.getAttribute(attributeName));
      }
    }
  });

  static #addObserved(node, key, value) {
    let o = this.#observed.get(node);

    if (!o) {
      o = {};

      this.#observed.set(node, o);
    }

    o[key] = value;

    this.#mutationObserver.observe(node, {attributeFilter: [key]});

    value.callback(node.getAttribute(key));
  }

  /* */

  /* scheduling */

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

  /* */

  /* formula registry */

  #active = new Set();

  #inactive = new Set();

  #reads = null;

  #writes = new Set();

  /* */

  #updating = false;

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
      if (typeof value === "object" && value?.type === "computed") {
        let bounds = ["", ""].map((v) => document.createComment(v));

        this.#active.add({
          ...value,
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
    if (val != null && val !== false) {
      node.setAttribute(key, val === true ? "" : val);
    } else {
      node.removeAttribute(key);
    }
  }

  #setAttributes(node, attrs) {
    for (let [key, value] of Object.entries(attrs)) {
      let isObject = typeof value === "object";
      let isListener = key.substring(0, 2) === "on";

      if (isListener) {
        key = key.substring(2);
      }

      if (isObject && value?.type === "computed") {
        this.#active.add({
          ...value,
          type: isListener ? "listener" : "attribute",
          node: new WeakRef(node),
          key,
        });
      } else if (isObject && value?.type === "observed") {
        Element.#addObserved(node, key, value);
      } else if (isListener) {
        node.addEventListener(key, ...[].concat(value));
      } else {
        this.#setAttribute(node, key, value);
      }
    }
  }

  #update = () => {
    this.#updating = true;

    this.#writes = new Set();

    for (let formula of this.#active) {
      this.#reads = new Set();

      let result = formula.callback();

      formula.reads = this.#reads;

      if (formula.type === "attribute") {
        let node = formula.node.deref();

        if (node) {
          this.#setAttribute(node, formula.key, result);
        }
      }

      if (formula.type === "listener") {
        let node = formula.node.deref();

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

          if (node) {
            node.addEventListener(formula.key, handler, options);
          }
        }
      }

      if (formula.type === "fragment") {
        let [start, end] = formula.bounds.map((b) => b.deref());

        while (start && end && start.nextSibling !== end) {
          start.nextSibling.remove();
        }

        start.after(...[].concat(result ?? ""));
      }

      this.#active.delete(formula);

      this.#inactive.add(formula);
    }

    this.#updating = false;
  };

  observe(callback) {
    return {type: "observed", callback};
  }

  connectedCallback() {
    this.attachShadow({mode: "open"});

    let children = [].concat(this.render?.(this.#createElementProxy) ?? "");

    if (typeof children[0] === "object" && children[0].constructor === Object) {
      this.#setAttributes(this, children.shift());
    }

    this.#appendChildren(this.shadowRoot, children);

    this.#update();
  }

  compute(callback) {
    if (this.#updating) {
      return callback();
    }

    return {type: "computed", callback};
  }

  watch(state) {
    let symbols = {};

    return new Proxy(state, {
      set: (state, key, value) => {
        state[key] = value;

        symbols[key] ??= Symbol(key);

        if (!this.#writes.has(symbols[key])) {
          for (let formula of this.#inactive) {
            if (formula.reads.has(symbols[key])) {
              this.#inactive.delete(formula);

              this.#active.add(formula);
            }
          }

          this.#writes.add(symbols[key]);
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
