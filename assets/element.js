export class Element extends HTMLElement {
  /* mutation observation */

  static #observed = new WeakMap();

  static #mutationObserver = new window.MutationObserver((mutations) => {
    for (let {target, attributeName} of mutations) {
      let observed = this.#observed.get(target)?.[attributeName];

      if (observed) {
        observed.callback(target.getAttribute(attributeName));
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

  #writes = new Set();

  #reads = new Map();

  #current = null;

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

        this.#writes.add({
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
        this.#writes.add({
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

    for (let formula of this.#writes) {
      this.#current = formula;

      let result = formula.callback();

      this.#current = null;

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

      this.#writes.delete(formula);
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
}
