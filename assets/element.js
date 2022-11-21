export class Element extends HTMLElement {
  static #Base = class {
    constructor(args) {
      Object.assign(this, args);
    }
  };

  static #Fragment = class extends Element.#Base {};

  static #Attribute = class extends Element.#Base {};

  static #Compute = class extends Element.#Base {};

  static #Observe = class extends Element.#Base {};

  static #observed = new WeakMap();

  static #queue = new Set();

  static #scheduled = false;

  static #handleMutations = (mutations) => {
    for (let mutation of mutations) {
      let observed = this.#observed.get(mutation.target)?.[
        mutation.attributeName
      ];

      if (observed) {
        observed.callback(mutation.target.getAttribute(mutation.attributeName));
      }
    }
  };

  static #mutationObserver = new MutationObserver(Element.#handleMutations);

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

  #inactive = new Set();

  #reads = null;

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
      if (typeof value === "object" && value instanceof Element.#Compute) {
        let bounds = ["", ""].map((v) => document.createComment(v));

        this.#active.add(
          new Element.#Fragment({
            bounds: bounds.map((b) => new WeakRef(b)),
            ...value,
          })
        );

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

      if (isObject && value instanceof Element.#Compute) {
        this.#active.add(
          new Element.#Attribute({
            node: new WeakRef(node),
            key,
            ...value,
          })
        );
      } else if (isObject && value instanceof Element.#Observe) {
        let observed = Element.#observed.get(node);

        if (!observed) {
          observed = {};

          Element.#observed.set(node, observed);
        }

        observed[key] = value;

        Element.#mutationObserver.observe(node, {attributeFilter: [key]});

        value.callback(this.getAttribute(key));
      } else if (key.substring(0, 2) === "on") {
        node.addEventListener(key.substring(2), ...[].concat(value));
      } else {
        this.#setAttribute(node, key, value);
      }
    }
  }

  #update = () => {
    this.#updating = true;

    for (let formula of this.#active) {
      this.#reads = new Set();

      let result = formula.callback();

      formula.reads = this.#reads;

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

  observe(callback) {
    if (this.#updating) {
      return;
    }

    return new Element.#Observe({callback});
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

    return new Element.#Compute({callback});
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
