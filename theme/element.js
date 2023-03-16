export class Element extends HTMLElement {
  constructor() {
    super();

    let template = this.firstElementChild;

    if (
      !this.shadowRoot &&
      template?.nodeName === "TEMPLATE" &&
      template?.hasAttribute("shadowroot")
    ) {
      let templateContent = template.content;
      let shadowRoot = this.attachShadow({
        mode: template.getAttribute("shadowroot") ?? "open",
      });

      shadowRoot.appendChild(templateContent.cloneNode(true));
    }
  }
}

let scheduled = false;
let writes = new Set();
let reads = new Map();
let current = null;

export let watch = (state) => {
  let symbols = {};

  return new Proxy(state, {
    set: (state, key, value) => {
      if (typeof value === "object" || state[key] !== value) {
        state[key] = value;

        symbols[key] ??= Symbol("");

        for (let formula of reads.get(symbols[key]) ?? []) {
          writes.add(formula);
        }

        reads.set(symbols[key], new Set());

        schedule();
      }

      return true;
    },
    get: (state, key) => {
      symbols[key] ??= Symbol("");

      if (current) {
        let r = reads.get(symbols[key]) ?? new Set();

        reads.set(symbols[key], r);

        r.add(current);
      }

      return state[key];
    },
  });
};

export let run = (...formulae) => {
  update(new Set(formulae));
};

let schedule = () => {
  if (!scheduled) {
    scheduled = true;

    window.requestAnimationFrame(() => {
      scheduled = false;

      update();
    });
  }
};

let update = (formulae = writes) => {
  for (let formula of formulae) {
    let prev = current;

    current = formula;

    formula();

    current = prev;
  }

  writes.clear();
};
