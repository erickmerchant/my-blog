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
      if (key.startsWith("on")) {
        node.addEventListener(key.substring(2), ...[].concat(value));
      } else {
        if (typeof value === "function") {
          operations.push({attribute: true, key, value});

          value = value();
        }

        this.#setAttribute(node, key, value);
      }
    }

    for (let child of children) {
      if (typeof child === "function") {
        let start = this.#comment();
        let end = this.#comment();

        operations.push({attribute: false, start, end, child});

        node.append(start, ...[].concat(child()), end);
      } else {
        node.append(child ?? "");
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

  static #record(cb) {
    let count = this.#_nodes.length;

    cb();

    return this.#_nodes.splice(count, this.#_nodes.length - count);
  }

  static #setAttribute(node, key, val) {
    if (val === true || val === false) {
      node.toggleAttribute(key, val);
    } else if (val != null) {
      node.setAttribute(key, val);
    } else {
      node.removeAttribute(key);
    }
  }

  #nodes = [];

  connectedCallback() {
    this.attachShadow({mode: "open"});

    this.setup();
  }

  setup() {
    this.effect?.();

    this.#nodes = Element.#record(() => {
      this.shadowRoot.replaceChildren(...[].concat(this.render()));
    });
  }

  update() {
    this.effect?.();

    for (let node of this.#nodes) {
      let operations = Element.#updates.get(node);

      if (!operations) return;

      for (let {attribute, key, value, start, end, child} of operations) {
        if (attribute) {
          Element.#setAttribute(node, key, value());
        } else {
          if (!start || !end) return;

          while (start.nextSibling !== end) {
            start.nextSibling.remove();
          }

          start.after(...[].concat(child()));
        }
      }
    }
  }

  render() {
    return "";
  }
}
