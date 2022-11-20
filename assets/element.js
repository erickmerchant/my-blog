export class Element extends HTMLElement {
  static #Fragment = class {};

  static #Listener = class {};

  static #Attribute = class {};

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

  #observed = new WeakMap();

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

  #mutationObserver = null;

  #reads = null;

  #updating = false;

  #appendChildren(node, children) {
    for (let value of children) {
      if (typeof value === "symbol") {
        if (value.description === "compute") {
          let bounds = ["", ""].map((v) => document.createComment(v));

          this.#active.add(
            Object.assign(new Element.#Fragment(), {
              bounds: bounds.map((b) => new WeakRef(b)),
              value,
            })
          );

          value = bounds;
        }
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

  #handleMutations = (mutations) => {
    for (let mutation of mutations) {
      let callback = this.#observed.get(mutation.target)?.[
        mutation.attributeName
      ];

      if (callback) {
        this.#callbacks.get(callback)?.(
          this.getAttribute(mutation.attributeName)
        );
      }
    }
  };

  #setAttribute(node, key, val) {
    if (val != null && val !== false) {
      node.setAttribute(key, val === true ? "" : val);
    } else {
      node.removeAttribute(key);
    }
  }

  #setAttributes(node, attrs) {
    for (let [key, value] of Object.entries(attrs)) {
      let isListener = key.substring(0, 2) === "on";

      key = isListener ? key.substring(2) : key;

      if (typeof value === "symbol") {
        if (value.description === "compute") {
          this.#active.add(
            Object.assign(
              isListener ? new Element.#Listener() : new Element.#Attribute(),
              {
                node: new WeakRef(node),
                key,
                value,
              }
            )
          );
        } else if (value.description === "observe") {
          let observed = this.#observed.get(node);

          if (!observed) {
            observed = {};

            this.#observed.set(node, observed);
          }

          observed[key] = value;

          this.#mutationObserver ??= new MutationObserver(
            this.#handleMutations
          );

          this.#mutationObserver.observe(node, {attributeFilter: [key]});

          this.#callbacks.get(value)?.(this.getAttribute(key));
        }
      } else if (isListener) {
        node.addEventListener(key, ...[].concat(value));
      } else {
        this.#setAttribute(node, key, value);
      }
    }
  }

  #update = () => {
    this.#updating = true;

    for (let formula of this.#active) {
      this.#reads = new Set();

      let callback = this.#callbacks.get(formula.value);

      let result = callback();

      formula.reads = this.#reads;

      if (formula instanceof Element.#Listener) {
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

          formula.node.deref()?.addEventListener(formula.key, handler, options);
        }
      }

      if (formula instanceof Element.#Attribute) {
        let node = formula.node.deref();

        if (node) {
          this.#setAttribute(node, formula.key, result);
        }
      }

      if (formula instanceof Element.#Fragment) {
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

  observe(value) {
    if (this.#updating) {
      return;
    }

    let symbol = Symbol("observe");

    this.#callbacks.set(symbol, value);

    return symbol;
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

  compute(value) {
    if (this.#updating) {
      return value();
    }

    let symbol = Symbol("compute");

    this.#callbacks.set(symbol, value);

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
