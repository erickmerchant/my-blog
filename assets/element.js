export class Element extends HTMLElement {
  static fragment = Symbol("fragment");

  static #_computeds = [];

  static h(tag, props, ...children) {
    children = children.flat(Infinity).map((v) => v ?? "");

    if (tag === this.fragment) return children;

    let node = document.createElement(tag);

    for (let [key, value] of Object.entries(props ?? {})) {
      if (key.substring(0, 2) === "on") {
        node.addEventListener(key.substring(2), ...[].concat(value));
      } else if (typeof value === "function") {
        this.#_computeds.push({node, key, value});
      } else {
        this.#setAttribute(node, key, value);
      }
    }

    for (let value of children) {
      if (typeof value === "function") {
        let [start, end] = ["", ""].map((v) => document.createComment(v));

        this.#_computeds.push({start, end, value});

        value = [start, end];
      } else {
        value = [value];
      }

      node.append(...value);
    }

    return node;
  }

  static #setAttribute(node, key, val) {
    if (val != null && val !== false) {
      node.setAttribute(key, val === true ? "" : val);
    } else {
      node.removeAttribute(key);
    }
  }

  #computeds = null;

  #scheduled = false;

  #reads = [];

  #writes = [];

  connectedCallback() {
    this.attachShadow({mode: "open"});

    this.shadowRoot.append(...[this.render?.() ?? ""].flat());

    this.#computeds = Element.#_computeds;

    if (this.effect) {
      this.#computeds.unshift({value: this.effect});
    }

    Element.#_computeds = [];

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

  #update(init = false) {
    for (let computed of this.#computeds) {
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

        computed.start.after(...[result ?? ""].flat());
      }
    }

    this.#writes = [];
  }
}
