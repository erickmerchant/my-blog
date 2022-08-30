export class Element extends HTMLElement {
  static fragment = Symbol("fragment");

  static #_nodes = [];

  static #updates = new WeakMap();

  static h(tag, props, ...children) {
    children = children.flat(Infinity);

    if (tag === this.fragment) return children;

    let node = document.createElement(tag);
    let operations = [];

    {
      let attribute = true;

      for (let [key, value] of Object.entries(props ?? {})) {
        if (key.startsWith("on")) {
          node.addEventListener(key.substring(2), ...[].concat(value));
        } else {
          if (typeof value === "function") {
            operations.push({attribute, key, value});
          } else {
            this.#setAttribute(node, key, value);
          }
        }
      }
    }

    {
      let attribute = false;

      for (let value of children) {
        if (typeof value === "function") {
          let start = this.#comment();
          let end = this.#comment();

          operations.push({attribute, start, end, value});

          node.append(start, end);
        } else {
          node.append(value ?? "");
        }
      }
    }

    if (operations.length) {
      this.#_nodes.push(node);

      this.#updates.set(node, operations);
    }

    return node;
  }

  static #comment() {
    return document.createComment("");
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

      for (let {attribute, key, value, start, end} of operations) {
        if (attribute) {
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
