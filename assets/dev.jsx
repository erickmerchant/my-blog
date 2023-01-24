import {h, watch, render} from "./component.js";

let getRandomInt = (max) => {
  return Math.floor(Math.random() * max);
};

let Item = (props) => {
  return (
    <>
      <li>0</li>
      {() =>
        props.value ? (
          <li>
            <b>1</b>
          </li>
        ) : (
          ""
        )
      }
    </>
  );
};

let DevComponent = (props) => {
  let state = watch({items: Array.from({length: 20}, () => getRandomInt(2))});

  return (
    <>
      <button
        on:click={() => {
          state.items = state.items.map(() => getRandomInt(2));
        }}
        type="button"
      >
        run
      </button>
      <ul>{() => state.items.map((value) => <Item value={() => value} />)}</ul>
    </>
  );
};

customElements.define(
  "dev-component",
  class extends HTMLElement {
    connectedCallback() {
      this.attachShadow({mode: "open"});

      render(<DevComponent />, this.shadowRoot);
    }
  }
);
