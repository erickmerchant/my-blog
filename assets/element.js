export class Computed {
  #callback = null;

  constructor(callback) {
    this.#callback = callback;
  }

  call() {
    return this.#callback();
  }
}

export class Element extends HTMLElement {
  static #computeds = [];

  static fragment = Symbol("fragment");

  static #addEventListener(node, key, args) {
    node.addEventListener(key, ...[].concat(args));
  }

  static #appendChildren(node, children) {
    for (let value of children) {
      if (typeof value === "object" && value instanceof Computed) {
        let [start, end] = ["", ""].map((v) => document.createComment(v));

        this.#computeds.push({start, end, value});

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
      if (typeof value === "object" && value instanceof Computed) {
        this.#computeds.push({node, key, value});
      } else if (key.substring(0, 2) === "on") {
        this.#addEventListener(node, key.substring(2), value);
      } else {
        this.#setAttribute(node, key, value);
      }
    }

    this.#appendChildren(node, children);

    return node;
  }

  #instanceComputeds = null;

  #reads = [];

  #scheduled = false;

  #writes = [];

  #update(init = false) {
    for (let computed of this.#instanceComputeds) {
      if (!init) {
        if (!this.#writes.some((g) => computed.reads.includes(g))) {
          continue;
        }
      }

      this.#reads = [];

      let result = computed.value.call();

      computed.reads = this.#reads;

      if (computed.node && computed.key) {
        if (computed.key.substring(0, 2) === "on") {
          let key = computed.key.substring(2);

          if (computed.previous != null) {
            computed.node.removeEventListener(
              key,
              ...[].concat(computed.previous)
            );
          }

          if (result != null) {
            Element.#addEventListener(computed.node, key, result);
          }

          computed.previous = result;
        } else {
          Element.#setAttribute(computed.node, computed.key, result);
        }
      }

      if (computed.start && computed.end) {
        while (computed.start.nextSibling !== computed.end) {
          computed.start.nextSibling.remove();
        }

        computed.start.after(...[].concat(result ?? "").flat());
      }
    }

    this.#writes = [];
  }

  connectedCallback() {
    this.attachShadow({mode: "open"});

    let cachedComputed = Element.#computeds.splice(
      0,
      Element.#computeds.length
    );

    Element.#appendChildren(this.shadowRoot, this.render?.() ?? [""]);

    this.#instanceComputeds = Element.#computeds;

    if (this.effect) {
      this.#instanceComputeds.unshift({value: new Computed(this.effect)});
    }

    Element.#computeds = cachedComputed;

    this.#update(true);
  }

  watch(state) {
    let symbols = {};

    return new Proxy(state, {
      set: (state, key, value) => {
        state[key] = value;

        symbols[key] ??= Symbol(key);

        if (!~this.#writes.indexOf(symbols[key])) {
          this.#writes.push(symbols[key]);
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
