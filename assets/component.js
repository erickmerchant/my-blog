let registry = new WeakMap();

let scheduled = false;

let writes = new Set();

let reads = new Map();

let current = null;

export let h = (tag, attrs = {}, ...children) => {
  return {tag, attrs, children};
};

h.Fragment = (_, children) => children;

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
    if (currentChild?.nextSibling != end) {
      currentChild = currentChild?.nextSibling;
    } else {
      currentChild = null;
    }
  };
  let insert = (...nodes) => {
    for (let node of nodes) {
      if (currentChild) {
        currentChild.replaceWith(node);
        currentChild = node;
      } else if (end) {
        end.before(node);
      } else {
        start.append(node);
      }

      advance();
    }
  };

  advance();

  for (let value of [].concat(children ?? []).flat(Infinity)) {
    if (typeof value === "function") {
      let bounds = ["", ""].map((v) => document.createComment(v));

      writes.add({
        callback: value,
        type: 2,
        bounds: bounds.map((b) => new WeakRef(b)),
        svg,
      });

      insert(...bounds);
    } else if (typeof value === "object") {
      let {tag, attrs, children} = value;

      if (typeof tag === "function") {
        let previousRender = currentChild ? registry.get(currentChild) : null;

        let endRef = previousRender?.end.deref();

        if (previousRender && previousRender.tag === tag && endRef) {
          for (let [key, val] of Object.entries(attrs ?? {})) {
            if (typeof val === "function") {
              val = val();
            }

            previousRender.proxy[key] = val;
          }

          for (let key of Object.keys(previousRender.proxy)) {
            if (!(key in attrs)) {
              delete previousRender.proxy[key];
            }
          }

          currentChild = endRef;

          advance();
        } else {
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

          let target = document.createDocumentFragment();

          let [start, end] = ["", ""].map((v) => document.createComment(v));

          target.append(start, end);

          render(tag(proxy, children), start, {
            end,
            initialize: false,
            svg,
          });

          registry.set(target.firstChild, {tag, proxy, end: new WeakRef(end)});

          insert(...target.childNodes);
        }
      } else {
        let node =
          tag === "svg" || svg
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
          svg: tag === "svg" || svg,
          initialize: false,
        });

        insert(node);
      }
    } else {
      insert(value);
    }
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
      let {bounds, svg} = formula;
      let [start, end] = bounds.map((f) => f.deref());

      render(result, start, {
        end,
        initialize: false,
        svg,
      });
    }
  }

  writes.clear();
};
