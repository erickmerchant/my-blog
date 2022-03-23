let fragment_symbol = Symbol("fragment");
let ref_symbol = Symbol("ref");
let hookMap = new WeakMap();

export { fragment_symbol as fragment };

let addHook = (pathes, payload) => {
  for (let i = 0; i < pathes.length; i++) {
    let [obj, prop] = pathes[i];

    let map = hookMap.get(obj);

    if (!map) {
      map = {};
      hookMap.set(obj, map);
    }

    map[prop] = map[prop] ?? [];
    map[prop].push(payload);
  }
};

let setAttr = (element, key, value) => {
  if (value === true || value === false) {
    element.toggleAttribute(key, value);
  } else {
    element.setAttribute(key, value);
  }
};

let toArray = (val) => {
  if (Array.isArray(val)) return val;

  return [val];
};

let buildElement = (element, attrs, isSvg, ...children) => {
  if (attrs != null) {
    attrs = Object.entries(attrs);

    for (let i = 0; i < attrs.length; i++) {
      let [key, value] = attrs[i];
      let isRef = value[ref_symbol] != null;
      let initial = value;

      if (isRef) {
        initial = value[ref_symbol].initial;
      }

      if (key.startsWith("on")) {
        isRef = false;
        element.addEventListener(key.substring(2), ...toArray(initial));
      } else {
        setAttr(element, key, initial);
      }

      if (isRef) {
        addHook(value[ref_symbol].pathes, [
          1,
          new WeakRef(element),
          key,
          null,
          value[ref_symbol].callback,
        ]);
      }
    }
  }

  element.replaceChildren(
    ...children.flatMap((value) => {
      let isRef = value[ref_symbol] != null;

      if (!isRef) return toNodes(isSvg, toArray(value));

      let [nodes, refs] = toNodesAndRefs(
        isSvg,
        toArray(value[ref_symbol].initial)
      );

      addHook(value[ref_symbol].pathes, [
        2,
        refs,
        null,
        isSvg,
        value[ref_symbol].callback,
      ]);

      return nodes;
    })
  );

  return element;
};

let toNode = (isSvg, node) => {
  if (typeof node !== "object") {
    return document.createTextNode(node);
  }

  let { tag, attrs, children } = node;

  isSvg = tag === "svg" ? true : isSvg;

  let element = !isSvg
    ? document.createElement(tag)
    : document.createElementNS("http://www.w3.org/2000/svg", tag);

  return buildElement(element, attrs, isSvg, ...children);
};

let toNodes = (isSvg, list) => {
  let nodes = [];

  for (let i = 0; i < list.length; i++) {
    nodes.push(toNode(isSvg, list[i]));
  }

  return nodes;
};

let toNodesAndRefs = (isSvg, list) => {
  let nodes = [];
  let refs = [];

  for (let i = 0; i < list.length; i++) {
    let node = toNode(isSvg, list[i]);

    nodes.push(node);
    refs.push(new WeakRef(node));
  }

  return [nodes, refs];
};

export let h = (tag, attrs, ...children) => {
  if (tag === fragment_symbol) return children;

  return { tag, attrs, children };
};

export let render = (args, element) => {
  let attrs = null,
    children;

  if (Array.isArray(args)) {
    children = args;
  } else {
    attrs = args.attrs;
    children = args.children;
  }

  return buildElement(element, attrs, element.nodeName === "svg", ...children);
};

let pathes = [];
let recordPathes = false;

export let select = (callback) => {
  recordPathes = true;

  let initial = callback();

  recordPathes = false;

  return {
    [ref_symbol]: {
      initial,
      callback,
      pathes: pathes.splice(0, pathes.length),
    },
  };
};

let changes = [];
let changesScheduled = false;

let runChanges = () => {
  let itemSet = new Set();

  while (changes.length) {
    let [obj, prop, val, proxy] = changes.shift();
    let map = hookMap.get(proxy);

    if (map && map[prop] && !itemSet.has(map[prop])) {
      let item = map[prop];

      itemSet.add(item);

      for (let i = 0; i < item.length; i++) {
        let [type, ref, key, isSvg, callback] = item[i];

        if (type === 1) {
          let element = ref.deref();

          if (element) {
            setAttr(element, key, callback != null ? callback(val) : val);
          }
        }

        if (type === 2) {
          let [nodes, refs] = toNodesAndRefs(
              isSvg,
              toArray(callback != null ? callback(val) : val)
            ),
            node;

          item[i][1] = refs;

          for (let i = 0; i < ref.length; i++) {
            let element = ref[i].deref();

            node = nodes.shift();

            if (!element) continue;

            if (node) {
              element.replaceWith(node);
            } else {
              element.remove();
            }
          }

          if (nodes.length) {
            node.after(...nodes);
          }
        }
      }
    }

    obj[prop] = val;
  }

  changesScheduled = false;
};

export let proxy = (state) =>
  new Proxy(state, {
    get(obj, key, proxy) {
      if (recordPathes) {
        pathes.push([proxy, key]);
      }

      return Reflect.get(obj, key, proxy);
    },
    set(obj, key, val, proxy) {
      changes.push([obj, key, val, proxy]);

      if (!changesScheduled) {
        changesScheduled = true;

        Promise.resolve().then(runChanges);
      }

      return Reflect.set(obj, key, val, proxy);
    },
  });
