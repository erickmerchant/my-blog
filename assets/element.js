export class Element extends HTMLElement {
  static fragment = Symbol("fragment");

  static h(tag, props, ...children) {
    children = children.flat(Infinity);

    if (tag === Element.fragment) return children;

    let el = document.createElement(tag);

    for (let [key, val] of Object.entries(props ?? {})) {
      if (key.startsWith("on")) {
        el.addEventListener(key.substring(2).toLowerCase(), ...[].concat(val));
      } else {
        el[key] = val;
      }
    }

    el.append(...children);

    return el;
  }

  refs = {};

  connectedCallback() {
    this.attachShadow({mode: "open"});

    this.shadowRoot.append(...this.render());

    if (this.effect) {
      this.effect();
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
