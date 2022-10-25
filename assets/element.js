export class Element extends HTMLElement {
  /**
   * @type {Array<Element>}
   */
  static #stack = [];

  static fragment = Symbol("fragment");

  static #appendChildren(node, children) {
    for (let value of children) {
      if (typeof value === "symbol") {
        let [start, end] = ["", ""].map((v) => document.createComment(v));

        this.#stack[0].#addFormula({start, end, value});

        value = [start, end];
      } else {
        value = [value];
      }

      node.append(...value);
    }
  }

  static #setAttribute(node, key, val) {
    if (val != null && val !== false) {
      node.setAttribute(key, val === true ? "" : val);
    } else {
      node.removeAttribute(key);
    }
  }

  static h(tag, props, ...children) {
    children = children.flat(Infinity);

    if (tag === this.fragment) return children;

    let node = props?.xmlns
      ? document.createElementNS(props.xmlns, tag)
      : document.createElement(tag);

    for (let [key, value] of Object.entries(props ?? {})) {
      if (typeof value === "symbol") {
        this.#stack[0].#addFormula({node, key, value});
      } else if (key.substring(0, 2) === "on") {
        node.addEventListener(key.substring(2), ...[].concat(value));
      } else {
        this.#setAttribute(node, key, value);
      }
    }

    this.#appendChildren(node, children);

    return node;
  }

  #callbacks = new Map();

  #dirtyFormulas = [];

  #cleanFormulas = [];

  #reads = [];

  #updating = false;

  #scheduled = false;

  #addFormula(formula) {
    this.#dirtyFormulas.push(formula);
  }

  #update() {
    this.#updating = true;

    for (let formula of this.#dirtyFormulas) {
      this.#reads = [];

      let callback = this.#callbacks.get(formula.value);

      let result = callback();

      formula.reads = this.#reads;

      if (formula.node && formula.key) {
        if (formula.key.substring(0, 2) === "on") {
          let key = formula.key.substring(2);

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

            formula.node.addEventListener(key, handler, options);
          }
        } else {
          Element.#setAttribute(formula.node, formula.key, result);
        }
      }

      if (formula.start && formula.end) {
        while (formula.start.nextSibling !== formula.end) {
          formula.start.nextSibling.remove();
        }

        formula.start.after(...[].concat(result ?? "").flat());
      }
    }

    this.#updating = false;

    this.#cleanFormulas = this.#cleanFormulas.concat(
      this.#dirtyFormulas.splice(0, Infinity)
    );
  }

  connectedCallback() {
    this.attachShadow({mode: "open"});

    Element.#stack.unshift(this);

    Element.#appendChildren(this.shadowRoot, this.render?.() ?? [""]);

    if (this.effect) {
      this.#dirtyFormulas.unshift({value: this.formula(this.effect)});
    }

    this.#update();

    Element.#stack.shift();
  }

  formula(callback) {
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

        for (let i = this.#cleanFormulas.length - 1; i >= 0; i--) {
          if (this.#cleanFormulas[i].reads.includes(symbols[key])) {
            this.#dirtyFormulas.push(...this.#cleanFormulas.splice(i, 1));
          }
        }

        if (!this.#scheduled) {
          this.#scheduled = true;

          setTimeout(() => {
            this.#scheduled = false;

            Element.#stack.unshift(this);

            this.#update();

            Element.#stack.shift();
          }, 0);
        }

        return true;
      },
      get: (state, key) => {
        symbols[key] ??= Symbol(key);

        if (!~this.#reads.indexOf(symbols[key])) {
          this.#reads.push(symbols[key]);
        }

        return state[key];
      },
    });
  }
}
