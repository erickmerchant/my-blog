export class Formula {
  #callback = null;

  constructor(callback) {
    this.#callback = callback;
  }

  call() {
    return this.#callback();
  }
}

export class Element extends HTMLElement {
  static #formulas = [];

  static fragment = Symbol("fragment");

  static #addEventListener(node, key, args) {
    node.addEventListener(key, ...[].concat(args));
  }

  static #appendChildren(node, children) {
    for (let value of children) {
      if (typeof value === "object" && value instanceof Formula) {
        let [start, end] = ["", ""].map((v) => document.createComment(v));

        this.#formulas.push({start, end, value});

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
      if (typeof value === "object" && value instanceof Formula) {
        this.#formulas.push({node, key, value});
      } else if (key.substring(0, 2) === "on") {
        this.#addEventListener(node, key.substring(2), value);
      } else {
        this.#setAttribute(node, key, value);
      }
    }

    this.#appendChildren(node, children);

    return node;
  }

  #cleanFormulas = [];

  #dirtyFormulaIndexes = [];

  #reads = [];

  #scheduled = false;

  #update() {
    for (let index of this.#dirtyFormulaIndexes) {
      let formula = this.#cleanFormulas[index];

      this.#reads = [];

      let result = formula.value.call();

      formula.reads = this.#reads;

      if (formula.node && formula.key) {
        if (formula.key.substring(0, 2) === "on") {
          let key = formula.key.substring(2);

          if (formula.previous != null) {
            formula.node.removeEventListener(
              key,
              ...[].concat(formula.previous)
            );
          }

          if (result != null) {
            Element.#addEventListener(formula.node, key, result);
          }

          formula.previous = result;
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

    this.#dirtyFormulaIndexes = [];
  }

  connectedCallback() {
    this.attachShadow({mode: "open"});

    let cachedLength = Element.#formulas.length;

    Element.#appendChildren(this.shadowRoot, this.render?.() ?? [""]);

    this.#cleanFormulas = Element.#formulas.splice(cachedLength, Infinity);

    if (this.effect) {
      this.#cleanFormulas.unshift({value: new Formula(this.effect)});
    }

    this.#dirtyFormulaIndexes = this.#cleanFormulas.keys();

    this.#update();
  }

  watch(state) {
    let symbols = {};

    return new Proxy(state, {
      set: (state, key, value) => {
        state[key] = value;

        symbols[key] ??= Symbol(key);

        for (let i = 0; i < this.#cleanFormulas.length; i++) {
          if (this.#cleanFormulas[i].reads.includes(symbols[key])) {
            this.#dirtyFormulaIndexes.push(i);
          }
        }

        if (!this.#scheduled) {
          this.#scheduled = true;

          setTimeout(() => {
            this.#scheduled = false;

            this.#update();
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
