let getCallback = (node, key, val) => () => {
  node[key] = val();
};

export class Element extends HTMLElement {
  static fragment = Symbol("fragment");

  static h(tag, props, ...children) {
    children = children.flat(Infinity);

    if (tag === Element.fragment) return children;

    let node = document.createElement(tag);
    let callbacks = [];

    for (let [key, val] of Object.entries(props ?? {})) {
      if (key.startsWith("on")) {
        node.addEventListener(
          key.substring(2).toLowerCase(),
          ...[].concat(val)
        );
      } else if (typeof val === "function") {
        let cb = getCallback(node, key, val);

        callbacks.push(cb);

        cb();
      } else {
        node[key] = val;
      }
    }

    for (let child of children) {
      if (child.callbacks) {
        callbacks.push(...child.callbacks);
      }

      node.append(child.node ?? child);
    }

    return {callbacks, node};
  }

  #callbacks = [];

  connectedCallback() {
    this.effect?.();

    this.attachShadow({mode: "open"});

    let children = this.render();

    for (let child of children) {
      if (child.callbacks) {
        this.#callbacks.push(...child.callbacks);
      }

      this.shadowRoot.append(child.node ?? child);
    }
  }

  update() {
    this.effect?.();

    for (let callback of this.#callbacks) {
      callback();
    }
  }

  render() {
    return (
      <link
        rel="stylesheet"
        href={new URL("./common.css", import.meta.url).pathname}
      />
    );
  }
}
