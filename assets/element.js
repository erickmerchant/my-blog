let getCallback = (node, pairs) => () => {
  let n = node.deref();

  if (!n) return;

  for (let [key, val] of pairs) {
    n[key] = val();
  }
};

let callbacks = [];

export class Element extends HTMLElement {
  static fragment = Symbol("fragment");

  static h(tag, props, ...children) {
    children = children.flat(Infinity);

    if (tag === Element.fragment) return children;

    let node = document.createElement(tag);
    let pairs = [];

    for (let [key, val] of Object.entries(props ?? {})) {
      if (key.startsWith("on")) {
        node.addEventListener(
          key.substring(2).toLowerCase(),
          ...[].concat(val)
        );
      } else {
        if (typeof val === "function") {
          pairs.push([key, val]);

          val = val();
        }

        node[key] = val;
      }
    }

    if (pairs.length) {
      callbacks.push(getCallback(new WeakRef(node), pairs));
    }

    for (let child of children) {
      node.append(child);
    }

    return node;
  }

  #callbacks = [];

  connectedCallback() {
    this.effect?.();

    this.attachShadow({mode: "open"});

    let count = callbacks.length;

    this.shadowRoot.append(...this.render());

    this.#callbacks = callbacks.splice(count, callbacks.length - count);
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
