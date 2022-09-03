export class Element extends HTMLElement {
  static fragment = Symbol("fragment");

  static #_nodes = [];

  static #updates = new WeakMap();

  static h(tag, props, ...children) {
    children = children.flat(Infinity);

    if (tag === this.fragment) return children;

    let node = document.createElement(tag);
    let operations = [];

    for (let [key, value] of Object.entries(props ?? {})) {
      if (key.substring(0, 2) === "on") {
        node.addEventListener(key.substring(2), ...[].concat(value));
      } else {
        if (typeof value === "function") {
          operations.push({key, value});
        } else {
          this.#setAttribute(node, key, value);
        }
      }
    }

    for (let value of children) {
      if (typeof value === "function") {
        let [start, end] = ["", ""].map((v) => document.createComment(v));

        operations.push({start, end, value});

        node.append(start, end);
      } else {
        node.append(value ?? "");
      }
    }

    if (operations.length) {
      this.#_nodes.push(node);

      this.#updates.set(node, operations);
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

  #nodes = [];

  connectedCallback() {
    this.attachShadow({mode: "open"});

    this.shadowRoot.replaceChildren(...[this.render?.() ?? ""].flat());

    this.#nodes = Element.#_nodes;

    Element.#_nodes = [];

    this.#update();
  }

  watch(state) {
    return new Proxy(state, {
      set: (state, key, value) => {
        state[key] = value;

        this.#update();

        return true;
      },
    });
  }

  #update() {
    this.effect?.();

    for (let node of this.#nodes) {
      let operations = Element.#updates.get(node);

      if (!operations) return;

      for (let {key, value, start, end} of operations) {
        if (key) {
          Element.#setAttribute(node, key, value());
        } else {
          while (start.nextSibling !== end) {
            start.nextSibling.remove();
          }

          start.after(...[value()].flat());
        }
      }
    }
  }
}
