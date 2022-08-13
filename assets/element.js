export class Element extends HTMLElement {
  static fragment = Symbol("fragment");

  static #_callbacks = [];

  static h(tag, props, ...children) {
    children = children.flat(Infinity);

    if (tag === this.fragment) return children;

    let node = document.createElement(tag);

    let attributeOps = [];

    for (let [key, val] of Object.entries(props ?? {})) {
      if (key.startsWith("on")) {
        node.addEventListener(key.substring(2), ...this.#concat(val));
      } else {
        if (typeof val === "function") {
          attributeOps.push([key, val]);

          val = val();
        }

        this.#setAttribute(node, key, val);
      }
    }

    if (attributeOps.length) {
      this.#_callbacks.push(
        this.#getUpdateForAttributes(new WeakRef(node), attributeOps)
      );
    }

    let childOps = [];

    for (let child of children) {
      if (typeof child === "function") {
        let beginning = this.#comment();

        let ending = this.#comment();

        childOps.push([new WeakRef(beginning), new WeakRef(ending), child]);

        child = child() ?? "";

        node.append(beginning, ...this.#concat(child), ending);
      } else {
        node.append(child ?? "");
      }
    }

    if (childOps.length) {
      this.#_callbacks.push(this.#getUpdateForChildren(childOps));
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

  static #getUpdateForAttributes(node, operations) {
    return () => {
      let ref = node.deref();

      if (!ref) return;

      for (let [key, val] of operations) {
        this.#setAttribute(ref, key, val());
      }
    };
  }

  static #getUpdateForChildren(operations) {
    return () => {
      for (let [beginning, ending, child] of operations) {
        beginning = beginning.deref();

        ending = ending.deref();

        if (!beginning || !ending) return;

        while (beginning.nextSibling !== ending) {
          beginning.nextSibling.remove();
        }

        beginning.after(...this.#concat(child()));
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
