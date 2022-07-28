export class Element extends HTMLElement {
  static fragment = Symbol("fragment");

  static h(tag, props, ...children) {
    children = children.flat(Infinity);

    if (tag === Element.fragment) return children;

    let node = document.createElement(tag);
    let computed = [];

    for (let [key, val] of Object.entries(props ?? {})) {
      if (key.startsWith("on")) {
        node.addEventListener(
          key.substring(2).toLowerCase(),
          ...[].concat(val)
        );
      } else if (typeof val === "function") {
        let cb = () => {
          node[key] = val();
        };

        computed.push(cb);

        cb();
      } else {
        node[key] = val;
      }
    }

    for (let child of children) {
      if (child.computed) {
        computed.push(...child.computed);
      }

      node.append(child.node ?? child);
    }

    return {computed, node};
  }

  computed = [];

  connectedCallback() {
    this.attachShadow({mode: "open"});

    let children = this.render();

    for (let child of children) {
      if (child.computed) {
        this.computed.push(...child.computed);
      }

      this.shadowRoot.append(child.node ?? child);
    }

    if (this.effect) {
      this.effect();
    }
  }

  update() {
    if (this.effect) {
      this.effect();
    }

    for (let computed of this.computed) {
      computed();
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
