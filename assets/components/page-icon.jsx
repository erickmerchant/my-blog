import {h} from "../component.js";

let paths = {
  close: "M1 4 l3 -3 l11 11 l-3 3 z m11 -3 l3 3 l-11 11 l-3 -3 z",
  menu: "M1 1 l14 0 l0 3.5 l-14 0 z m0 5.25 l14 0 l0 3.5 l-14 0 z m0 5.25 l14 0 l0 3.5 l-14 0 z",
};

export let PageIcon = (props) => {
  return (
    <svg class={() => props.class} aria-hidden="true" viewBox="0 0 16 16">
      <path d={() => paths?.[props.name] ?? ""} />
    </svg>
  );
};
