export class Element extends HTMLElement {
  static fragment = Symbol("fragment");

  static h(tag, props, ...children) {
    children = children.flat(Infinity);

    if (tag === Element.fragment) return children;

    if (typeof tag === "function") return tag({...props, children});

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

    this.shadowRoot.append(...[this.render()].flat(Infinity));

    if (this.effect) {
      this.effect();
    }
  }

  render() {
    return "";
  }
}
