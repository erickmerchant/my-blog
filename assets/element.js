export class Element extends HTMLElement {
  static fragment = Symbol("fragment");

  static #_callbacks = [];

  static h(tag, props, ...children) {
    children = children.flat(Infinity);

    if (tag === this.fragment) return children;

    let node = document.createElement(tag);

    let operations = [];

    for (let [key, value] of Object.entries(props ?? {})) {
      if (key.startsWith("on")) {
        node.addEventListener(key.substring(2), ...this.#concat(value));
      } else {
        if (typeof value === "function") {
          operations.push([1, key, value]);

          value = value();
        }

        this.#setAttribute(node, key, value);
      }
    }

    for (let value of children) {
      if (typeof value === "function") {
        let beginning = this.#comment();

        let ending = this.#comment();

        operations.push([
          2,
          new WeakRef(beginning),
          new WeakRef(ending),
          value,
        ]);

        value = value() ?? "";

        node.append(beginning, ...this.#concat(value), ending);
      } else {
        node.append(value ?? "");
      }
    }

    if (operations.length) {
      this.#_callbacks.push(this.#getUpdate(new WeakRef(node), operations));
    }

    return node;
  }

  static #comment() {
    return document.createComment("");
  }

  static #concat(arr) {
    return [].concat(arr);
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

  static #getUpdate(node, operations) {
    return () => {
      let ref = node.deref();

      if (!ref) return;

      for (let [type, ...operation] of operations) {
        if (type === 1) {
          let [key, value] = operation;

          this.#setAttribute(ref, key, value());
        }

        if (type === 2) {
          let [beginning, ending, value] = operation;

          beginning = beginning.deref();

          ending = ending.deref();

          if (!beginning || !ending) return;

          while (beginning.nextSibling !== ending) {
            beginning.nextSibling.remove();
          }

          beginning.after(...this.#concat(value()));
        }
      }
    };
  }

  #callbacks = [];

  connectedCallback() {
    this.attachShadow({mode: "open"});

    this.setup();
  }

  setup() {
    this.effect?.();

    this.#callbacks = Element.#record(() => {
      this.shadowRoot.replaceChildren(
        <link
          rel="stylesheet"
          href={new URL("./common.css", import.meta.url).pathname}
        />,
        ...Element.#concat(this.render())
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
