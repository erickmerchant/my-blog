class Base {
  constructor(args) {
    Object.assign(this, args);
  }
}

class Fragment extends Base {}

class Attribute extends Base {}

class Listener extends Base {}

class Compute extends Base {}

class Observe extends Base {}

class MutationObserver {
  #observed = new WeakMap();

  mutationObserver = new window.MutationObserver((mutations) => {
    for (let mutation of mutations) {
      let o = this.#observed.get(mutation.target)?.[mutation.attributeName];

      if (o) {
        o.callback(mutation.target.getAttribute(mutation.attributeName));
      }
    }
  });

  add(node, key, value) {
    let o = this.#observed.get(node);

    if (!o) {
      o = {};

      this.#observed.set(node, o);
    }

    o[key] = value;

    this.mutationObserver.observe(node, {attributeFilter: [key]});

    value.callback(node.getAttribute(key));
  }
}

class Scheduler {
  #queue = new Set();

  #scheduled = false;

  schedule(update) {
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
}

class Formulae {
  #active = new Set();

  #inactive = new Set();

  #reads = null;

  #writes = new Set();

  add(formula) {
    this.#active.add(formula);
  }

  resolve(callback) {
    this.#writes = new Set();

    for (let formula of this.#active) {
      this.#reads = new Set();

      let result = formula.callback();

      formula.reads = this.#reads;

      callback(result, formula);

      this.#active.delete(formula);

      this.#inactive.add(formula);
    }
  }

  filter(symbol) {
    if (!this.#writes.has(symbol)) {
      for (let formula of this.#inactive) {
        if (formula.reads.has(symbol)) {
          this.#inactive.delete(formula);

          this.#active.add(formula);
        }
      }

      this.#writes.add(symbol);
    }
  }

  mark(symbol) {
    this.#reads.add(symbol);
  }
}

export class Element extends HTMLElement {
  static scheduler = new Scheduler();

  static mutationObserver = new MutationObserver();

  #formulae = new Formulae();

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
      if (typeof value === "object" && value instanceof Compute) {
        let bounds = ["", ""].map((v) => document.createComment(v));

        this.#formulae.add(
          new Fragment({
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
      let isListener = key.substring(0, 2) === "on";

      if (isListener) {
        key = key.substring(2);
      }

      if (isObject && value instanceof Compute) {
        this.#formulae.add(
          new (isListener ? Listener : Attribute)({
            node: new WeakRef(node),
            key,
            ...value,
          })
        );
      } else if (isObject && value instanceof Observe) {
        Element.mutationObserver.add(node, key, value);
      } else if (isListener) {
        node.addEventListener(key, ...[].concat(value));
      } else {
        this.#setAttribute(node, key, value);
      }
    }
  }

  #update = () => {
    this.#updating = true;

    this.#formulae.resolve((result, formula) => {
      if (formula instanceof Attribute) {
        let node = formula.node.deref();

        if (node) {
          this.#setAttribute(node, formula.key, result);
        }
      }

      if (formula instanceof Listener) {
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

      if (formula instanceof Fragment) {
        let [start, end] = formula.bounds.map((b) => b.deref());

        while (start && end && start.nextSibling !== end) {
          start.nextSibling.remove();
        }

        start.after(...[].concat(result ?? ""));
      }
    });

    this.#updating = false;
  };

  observe(callback) {
    if (this.#updating) {
      return;
    }

    return new Observe({callback});
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

    return new Compute({callback});
  }

  watch(state) {
    let symbols = {};

    return new Proxy(state, {
      set: (state, key, value) => {
        state[key] = value;

        symbols[key] ??= Symbol(key);

        this.#formulae.filter(symbols[key]);

        Element.scheduler.schedule(this.#update);

        return true;
      },
      get: (state, key) => {
        symbols[key] ??= Symbol(key);

        this.#formulae.mark(symbols[key]);

        return state[key];
      },
    });
  }
}
