import {h, watch, render, on, attr} from "./component.js";

let getRandomInt = (max) => {
  return Math.floor(Math.random() * max);
};

let items = watch(Array.from({length: 20}, () => getRandomInt(2)));

let itemRef = Symbol("item"),
  subItemRef = Symbol("sub-item");

let {button, ul, li, b} = h;

render(
  [
    button(
      on("click", () => {
        for (let i = 0; i < items.length; i++) {
          items[i] = getRandomInt(2);
        }
      }),
      attr("type", "button"),
      "run"
    ),
    ul(
      Object.keys(items).map((i) => () => [
        li(itemRef, attr("class", "item"), () => (items[i] ? i : "-")),
        items[i] ? li(subItemRef, b("-")) : "",
      ])
    ),
  ],
  document.querySelector("div")
);
