export class Element extends HTMLElement {
  static #elementProxies = ["1999/xhtml", "2000/svg"].map((namespace) => {
    return new Proxy(
      {},
      {
        get: (_, tag) => {
          return (props, ...children) => {
            let node = document.createElementNS(
              `http://www.w3.org/${namespace}`,
              tag
            );

            for (let [key, value] of Object.entries(props)) {
              if (key.substring(0, 2) === "on") {
                node.addEventListener(key.substring(2), ...[].concat(value));
              } else if (typeof value === "function") {
                this.#_computeds.push({node, key, value});
              } else {
                this.#setAttribute(node, key, value);
              }
            }

            this.#appendChildren(node, children);

            return node;
          };
        },
      }
    );
  });

  static #_computeds = [];

  static #setAttribute(node, key, val) {
    if (val != null && val !== false) {
      node.setAttribute(key, val === true ? "" : val);
    } else {
      node.removeAttribute(key);
    }
  }

  static #appendChildren(node, children) {
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
  }

  #computeds = null;

  #scheduled = false;

  #reads = [];

  #writes = [];

  connectedCallback() {
    this.attachShadow({mode: "open"});

    let cachedComputed = Element.#_computeds.splice(
      0,
      Element.#_computeds.length
    );

    Element.#appendChildren(
      this.shadowRoot,
      this.render?.(...Element.#elementProxies) ?? [""]
    );

    this.#computeds = Element.#_computeds;

    if (this.effect) {
      this.#computeds.unshift({value: this.effect});
    }

    Element.#_computeds = cachedComputed;

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

        computed.start.after(...(result ?? [""]));
      }
    }

    this.#writes = [];
  }
}
