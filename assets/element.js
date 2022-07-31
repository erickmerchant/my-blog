let setAttribute = (node, key, val) => {
  if (val === true || val === false) {
    node.toggleAttribute(key, val);
  } else if (val != null) {
    node.setAttribute(key, val);
  } else {
    node.removeAttribute(key);
  }
};

let getOnUpdateAttributes = (node, pairs) => () => {
  let n = node.deref();

  if (!n) return;

  let results = new Map();

  for (let [key, val] of pairs) {
    let result = results.get(val);

    if (!result) {
      result = val();

      results.set(val, result);
    }

    setAttribute(n, key, result);
  }
};

let callbacks = [];

export class Element extends HTMLElement {
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

        setAttribute(node, key, val);
      }
    }

    if (pairs.length) {
      callbacks.push(getOnUpdateAttributes(new WeakRef(node), pairs));
    }

    node.append(...children);

    return node;
  }

  static Fragment({children}) {
    return children;
  }

  static Stylesheet({href}) {
    return <link rel="stylesheet" href={href} />;
  }

  #callbacks = [];

  connectedCallback() {
    this.effect?.();

    this.attachShadow({mode: "open"});

    let count = callbacks.length;

    this.shadowRoot.append(
      <Element.Stylesheet
        href={new URL("./common.css", import.meta.url).pathname}
      />,
      ...this.render()
    );

    this.#callbacks = callbacks.splice(count, callbacks.length - count);
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
