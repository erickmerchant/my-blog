export class Element extends HTMLElement {
  connectedCallback() {
    this.attachShadow({mode: "open"});

    Element.#insertChildren(this.shadowRoot, this.render?.());
  }

  /* dom */

  static h(tag, attrs = {}, ...children) {
    if (tag === this.fragment) {
      return children;
    }

    return {tag, attrs, children};
  }

  static fragment = Symbol("fragment");

  static classNames(...args) {
    let result = [];

    for (let arg of args.flat(Infinity)) {
      if (typeof arg === "object") {
        for (let [k, v] of Object.entries(arg)) {
          if (v) {
            result.push(k);
          }
        }
      } else {
        result.push(arg);
      }
    }

    return result.join(" ");
  }

  static #insertChildren(
    node,
    children,
    {useAfter = false, isSvg = false, initialize = true} = {}
  ) {
    for (let value of [].concat(children ?? []).flat(Infinity)) {
      if (typeof value === "function") {
        let bounds = ["", ""].map((v) => document.createComment(v));

        this.#writes.add({
          callback: value,
          type: 2,
          bounds: bounds.map((b) => new WeakRef(b)),
          isSvg,
        });

        value = bounds;
      } else {
        let {tag, attrs, children} = value;

        if (typeof tag === "function") {
          let target = document.createDocumentFragment();
          let props = {};
          let proxy = this.watch(props);

          for (let [key, val] of Object.entries(attrs)) {
            if (typeof val === "function") {
              let f = {
                callback: () => {
                  proxy[key] = val();
                },
                type: 0,
              };

              this.#writes.add(f);

              let prev = this.#current;

              this.#current = f;

              f.callback();

              this.#current = prev;
            } else {
              props[key] = val;
            }
          }

          this.#insertChildren(target, tag(proxy, children), {
            initialize: false,
            isSvg,
          });

          value = [target];
        } else {
          let node =
            tag === "svg" || isSvg
              ? document.createElementNS("http://www.w3.org/2000/svg", tag)
              : document.createElement(tag);

          for (let [key, val] of Object.entries(attrs ?? {})) {
            if (key.startsWith("on:")) {
              node.addEventListener(key.substring(3), ...[].concat(val));
            } else if (typeof val === "function") {
              this.#writes.add({
                callback: val,
                type: 1,
                node: new WeakRef(node),
                key,
              });
            } else {
              this.#setAttribute(node, key, val);
            }
          }

          this.#insertChildren(node, children, {
            isSvg: tag === "svg" || isSvg,
            initialize: false,
          });

          value = [node];
        }
      }

      node[useAfter ? "after" : "append"](...value);
    }

    if (initialize) this.#update(false);
  }

  static #setAttribute(node, key, val) {
    if (node) {
      if (val != null && val !== false) {
        node.setAttribute(key, val === true ? "" : val);
      } else {
        node.removeAttribute(key);
      }
    }
  }

  /* */

  /* reactivity */

  static #scheduled = false;

  static #schedule() {
    if (!this.#scheduled) {
      this.#scheduled = true;

      window.requestAnimationFrame(() => {
        this.#scheduled = false;

        this.#update();
      });
    }
  }

  static #writes = new Set();

  static #reads = new Map();

  static #current = null;

  static #update(zeros = true) {
    for (let formula of this.#writes) {
      if (formula.type === 0 && !zeros) continue;

      let prev = this.#current;

      this.#current = formula;

      let result = formula.callback();

      this.#current = prev;

      if (formula.type === 1) {
        let {node, key} = formula;

        this.#setAttribute(node.deref(), key, result);
      }

      if (formula.type === 2) {
        let {bounds, isSvg} = formula;
        let [start, end] = bounds.map((f) => f.deref());

        while (start && end && start.nextSibling !== end) {
          start.nextSibling.remove();
        }

        this.#insertChildren(start, result, {
          useAfter: true,
          initialize: false,
          isSvg,
        });
      }
    }

    this.#writes.clear();
  }

  static watch(state) {
    let symbols = {};

    return new Proxy(state, {
      set: (state, key, value) => {
        if (state[key] !== value) {
          state[key] = value;

          symbols[key] ??= Symbol("");

          for (let formula of this.#reads.get(symbols[key]) ?? []) {
            this.#writes.add(formula);
          }

          this.#reads.set(symbols[key], new Set());

          this.#schedule();
        }

        return true;
      },
      get: (state, key) => {
        symbols[key] ??= Symbol("");

        if (this.#current) {
          let reads = this.#reads.get(symbols[key]) ?? new Set();

          this.#reads.set(symbols[key], reads);

          reads.add(this.#current);
        }

        return state[key];
      },
    });
  }
}
