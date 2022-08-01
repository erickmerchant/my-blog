export class Element extends HTMLElement {
  static #_callbacks = [];

  static h(tag, props, ...children) {
    children = children.flat(Infinity);

    if (typeof tag === "function") return tag({...props, children});

    let node = document.createElement(tag);
    let pairs = [];

    for (let [key, val] of Object.entries(props ?? {})) {
      if (key.startsWith("on")) {
        node.addEventListener(key.substring(2), ...[].concat(val));
      } else {
        if (typeof val === "function") {
          pairs.push([key, val]);

          val = val();
        }

        this.#setAttribute(node, key, val);
      }
    }

    if (pairs.length) {
      this.#_callbacks.push(
        this.#getUpdateForAttributes(new WeakRef(node), pairs)
      );
    }

    node.append(...children);

    return node;
  }

  static Fragment({children}) {
    return children;
  }

  static #record(cb) {
    let count = this.#_callbacks.length;

    cb();

    return this.#_callbacks.splice(count, this.#_callbacks.length - count);
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

  static #getUpdateForAttributes(node, pairs) {
    return () => {
      let n = node.deref();

      if (!n) return;

      let results = new Map();

      for (let [key, val] of pairs) {
        let result = results.get(val);

        if (!result) {
          result = val();

          results.set(val, result);
        }

        this.#setAttribute(n, key, result);
      }
    };
  }

  #callbacks = [];

  connectedCallback() {
    this.effect?.();

    this.attachShadow({mode: "open"});

    this.#callbacks = Element.#record(() => {
      this.shadowRoot.append(
        <link
          rel="stylesheet"
          href={new URL("./common.css", import.meta.url).pathname}
        />,
        ...this.render()
      );
    });
  }

  update() {
    this.effect?.();

    for (let callback of this.#callbacks) {
      callback();
    }
  }

  render() {
    return "";
  }
}
