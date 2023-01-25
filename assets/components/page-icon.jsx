import {h, render} from "../component.js";

let icons = {
  close: {
    d: "M1 4 l3 -3 l11 11 l-3 3 z m11 -3 l3 3 l-11 11 l-3 -3 z",
    width: 16,
  },
  menu: {
    d: "M1 1 l14 0 l0 3.5 l-14 0 z m0 5.25 l14 0 l0 3.5 l-14 0 z m0 5.25 l14 0 l0 3.5 l-14 0 z",
    width: 16,
  },
  arrowLeft: {
    d: "M1 8 l7 -7 l2 2 l-5 5 l5 5 l-2 2 z",
    width: 11,
  },
  arrowRight: {
    d: "M10 8 l-7 -7 l-2 2 l5 5 l-5 5 l2 2 z",
    width: 11,
  },
};

let Svg = (props) => (
  <svg
    class={() => props.class ?? ""}
    aria-hidden="true"
    viewBox={() => "0 0 " + props.icon.width + " 16"}
  >
    <path d={() => props.icon.d ?? ""} />
  </svg>
);

export let PageIcon = (props) => () => {
  let icon = icons[props.name];

  return icon ? <Svg icon={icon} class={props.class} /> : "";
};

customElements.define(
  "page-icon",
  class extends HTMLElement {
    connectedCallback() {
      this.attachShadow({mode: "open"});

      render(<PageIcon name={this.getAttribute("name")} />, this.shadowRoot);
    }
  }
);
