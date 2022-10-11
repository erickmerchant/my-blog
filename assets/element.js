export class Element extends HTMLElement {
  static #appendChildren(node, children) {
    for (let value of children) {
      if (typeof value === "function") {
        let [start, end] = ["", ""].map((v) => document.createComment(v));

        this.#computeds.push({start, end, value});

        value = [start, end];
      } else {
        value = [value];
      }

      node.append(...value);
    }
  }

  static #computeds = [];

  static #setAttribute(node, key, val) {
    if (val != null && val !== false) {
      node.setAttribute(key, val === true ? "" : val);
    } else {
      node.removeAttribute(key);
    }
  }

  static fragment = Symbol("fragment");

  static h(tag, props, ...children) {
    children = children.flat(Infinity);

    if (tag === this.fragment) return children;

    let node = props?.xmlns
      ? document.createElementNS(props.xmlns, tag)
      : document.createElement(tag);

    for (let [key, value] of Object.entries(props ?? {})) {
      if (key.substring(0, 2) === "on") {
        node.addEventListener(key.substring(2), ...[].concat(value));
      } else if (typeof value === "function") {
        this.#computeds.push({node, key, value});
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

  #update(init = false) {
    for (let computed of this.#instanceComputeds) {
      if (!init) {
        if (!this.#writes.some((g) => computed.reads.includes(g))) {
          continue;
        }
      }

      this.#reads = [];

      let result = computed.value();

      computed.reads = this.#reads;

      if (computed.node && computed.key) {
        Element.#setAttribute(computed.node, computed.key, result);
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

  #writes = [];

  connectedCallback() {
    this.attachShadow({mode: "open"});

    let cachedComputed = Element.#computeds.splice(
      0,
      Element.#computeds.length
    );

    Element.#appendChildren(this.shadowRoot, this.render?.() ?? [""]);

    this.#instanceComputeds = Element.#computeds;

    if (this.effect) {
      this.#instanceComputeds.unshift({value: this.effect});
    }

    Element.#computeds = cachedComputed;

    this.#update(true);
  }

  watch(state) {
    return new Proxy(state, {
      set: (state, key, value) => {
        state[key] = value;

        if (!~this.#writes.indexOf(key)) {
          this.#writes.push(key);
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
        if (!~this.#reads.indexOf(key)) {
          this.#reads.push(key);
        }

        return state[key];
      },
    });
  }
}
