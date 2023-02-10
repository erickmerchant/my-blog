let refs = new WeakMap();
let scheduled = false;
let writes = new Set();
let reads = new Map();
let current = null;

export let h = new Proxy(
  {},
  {
    get:
      (_, tag) =>
      (attrs = {}, ...children) => {
        return {tag, attrs, children};
      },
  }
);

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
    if (typeof value === "function") {
      let bounds = ["", ""].map((v) => document.createComment(v));

      writes.add({
        callback: value,
        type: 0,
        bounds: bounds.map((b) => new WeakRef(b)),
        svg,
      });

      insert(...bounds);
    } else if (typeof value === "object") {
      let {tag, attrs, children} = value;

      if (attrs && attrs.ref && currentChild) {
        if (refs.get(currentChild) === attrs.ref) {
          advance();

          continue;
        }
      }

      let node =
        tag === "svg" || svg
          ? document.createElementNS("http://www.w3.org/2000/svg", tag)
          : document.createElement(tag);

      for (let [key, val] of Object.entries(attrs ?? {})) {
        if (key.startsWith("on")) {
          node.addEventListener(
            key.substring(2).toLowerCase(),
            ...[].concat(val)
          );
        } else if (typeof val === "function") {
          writes.add({
            callback: val,
            type: 1,
            node: new WeakRef(node),
            key,
          });
        } else {
          setAttribute(node, key, val);
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

let setAttribute = (node, key, val) => {
  if (node) {
    if (key === "ref") {
      refs.set(node, val);
    } else if (val != null && val !== false) {
      node.setAttribute(key, val === true ? "" : val);
    } else {
      node.removeAttribute(key);
    }
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

  let result = formula.callback();

  current = prev;

  return result;
};

let update = () => {
  for (let formula of writes) {
    let result = run(formula);

    if (formula.type === 0) {
      let {bounds, svg} = formula;
      let [start, end] = bounds.map((f) => f.deref());

      render(result, start, {
        end,
        initialize: false,
        svg,
      });
    }

    if (formula.type === 1) {
      let {node, key} = formula;

      setAttribute(node.deref(), key, result);
    }
  }

  writes.clear();
};
