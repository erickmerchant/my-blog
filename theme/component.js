let symbols = new WeakMap();
let scheduled = false;
let writes = new Set();
let reads = new Map();
let current = null;

export let h = new Proxy(
  {},
  {
    get:
      (_, tag) =>
      (...args) => {
        let children = args.pop();

        args = args.flat(Infinity);

        return {tag, args, children};
      },
  }
);

let makeArgFactory =
  (callback) =>
  (...args) => {
    if (args.length === 1 && typeof args[0] == "object") {
      let results = [];

      for (let [key, value] of Object.entries(args[0])) {
        results.push(callback(key, ...[].concat(value)));
      }

      return results;
    }

    return callback(...args);
  };

export let attr = makeArgFactory((attr, value) => {
  return {attr, value};
});

export let prop = makeArgFactory((prop, value) => {
  return {prop, value};
});

export let on = makeArgFactory((on, handler, options) => {
  return {on, handler, options};
});

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

export let render = (
  children,
  start,
  {end = null, svg = false, initialize = true} = {}
) => {
  let currentChild = end ? start : null;

  let advance = () => {
    currentChild = currentChild?.nextSibling;

    currentChild = currentChild !== end ? currentChild : null;
  };

  let insert = (...nodes) => {
    for (let node of nodes) {
      if (currentChild) {
        let cached = currentChild;

        advance();

        cached.replaceWith(node);
      } else if (end) {
        end.before(node);
      } else {
        start.append(node);
      }
    }
  };

  advance();

  for (let value of [].concat(children ?? []).flat(Infinity)) {
    if (value == null) continue;

    if (typeof value === "function") {
      let bounds = ["", ""].map((v) => document.createComment(v));

      writes.add({
        value,
        bounds: bounds.map((b) => new WeakRef(b)),
        svg,
      });

      insert(...bounds);
    } else if (typeof value === "object") {
      let {tag, args, children} = value;

      let symbol = args.find((val) => typeof val === "symbol");

      if (symbol && currentChild) {
        if (symbols.get(currentChild) === symbol) {
          advance();

          continue;
        }
      }

      let node =
        tag === "svg" || svg
          ? document.createElementNS("http://www.w3.org/2000/svg", tag)
          : document.createElement(tag);

      if (symbol) {
        symbols.set(node, symbol);
      }

      for (let arg of args) {
        if (typeof arg === "object") {
          if (arg.on) {
            node.addEventListener(arg.on, arg.handler, arg.options);
          } else if (typeof arg.value === "function") {
            writes.add({
              node: new WeakRef(node),
              ...arg,
            });
          } else if (arg.attr) {
            setAttr(node, arg.attr, arg.value);
          } else if (arg.prop) {
            setProp(node, arg.prop, arg.value);
          }
        }
      }

      render(children, node, {
        svg: tag === "svg" || svg,
        initialize: false,
      });

      insert(node);
    } else {
      insert(value);
    }
  }

  if (initialize) {
    update();
  }
};

let setAttr = (node, key, value) => {
  if (node) {
    if (value != null && value !== false) {
      node.setAttribute(key, value === true ? "" : value);
    } else {
      node.removeAttribute(key);
    }
  }
};

let setProp = (node, key, value) => {
  if (node) {
    node[key] = value;
  }
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

let run = (formula) => {
  let prev = current;

  current = formula;

  let result = formula.value();

  current = prev;

  return result;
};

let update = () => {
  for (let formula of writes) {
    let value = run(formula);

    if (formula.bounds) {
      let {bounds, svg} = formula;
      let [start, end] = bounds.map((f) => f.deref());

      render(value, start, {
        end,
        initialize: false,
        svg,
      });
    } else if (formula.attr) {
      let {node, attr} = formula;

      setAttr(node.deref(), attr, value);
    } else if (formula.prop) {
      let {node, prop} = formula;

      setProp(node.deref(), prop, value);
    }
  }

  writes.clear();
};
