export let h = (tag, attrs = {}, ...children) => {
  return {tag, attrs, children};
};

h.Fragment = (_, children) => children;

export let watch = (state) => {
  let symbols = {};

  return new Proxy(state, {
    set: (state, key, value) => {
      if (state[key] !== value) {
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
  node,
  {useAfter = false, isSvg = false, initialize = true} = {}
) => {
  for (let value of [].concat(children ?? []).flat(Infinity)) {
    if (typeof value === "function") {
      let bounds = ["", ""].map((v) => document.createComment(v));

      writes.add({
        callback: value,
        type: 2,
        bounds: bounds.map((b) => new WeakRef(b)),
        isSvg,
      });

      value = bounds;
    } else {
      let {tag, attrs, children} = value;

      if (typeof tag === "function") {
        let target = document.createDocumentFragment();
        let props = {};
        let proxy = watch(props);

        for (let [key, val] of Object.entries(attrs ?? {})) {
          if (typeof val === "function") {
            let f = {
              callback: () => {
                proxy[key] = val();
              },
              type: 0,
            };

            writes.add(f);

            run(f);
          } else {
            props[key] = val;
          }
        }

        render(tag(proxy, children), target, {
          initialize: false,
          isSvg,
        });

        value = [target];
      } else {
        let node =
          tag === "svg" || isSvg
            ? document.createElementNS("http://www.w3.org/2000/svg", tag)
            : document.createElement(tag);

        for (let [key, val] of Object.entries(attrs ?? {})) {
          if (key.startsWith("on:")) {
            node.addEventListener(key.substring(3), ...[].concat(val));
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
          isSvg: tag === "svg" || isSvg,
          initialize: false,
        });

        value = [node];
      }
    }

    node[useAfter ? "after" : "append"](...value);
  }

  if (initialize) update(false);
};

export let classes = (...args) => {
  let result = [];

  for (let arg of args.flat(Infinity)) {
    if (typeof arg === "object") {
      for (let [k, v] of Object.entries(arg)) {
        if (v) {
          result.push(k);
        }
      }
    } else {
      result.push(arg);
    }
  }

  return result.join(" ");
};

let setAttribute = (node, key, val) => {
  if (node) {
    if (val != null && val !== false) {
      node.setAttribute(key, val === true ? "" : val);
    } else {
      node.removeAttribute(key);
    }
  }
};

let scheduled = false;

let writes = new Set();

let reads = new Map();

let current = null;

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

let update = (zeros = true) => {
  for (let formula of writes) {
    if (formula.type === 0 && !zeros) continue;

    let result = run(formula);

    if (formula.type === 1) {
      let {node, key} = formula;

      setAttribute(node.deref(), key, result);
    }

    if (formula.type === 2) {
      let {bounds, isSvg} = formula;
      let [start, end] = bounds.map((f) => f.deref());

      while (start && end && start.nextSibling !== end) {
        start.nextSibling.remove();
      }

      render(result, start, {
        useAfter: true,
        initialize: false,
        isSvg,
      });
    }
  }

  writes.clear();
};
