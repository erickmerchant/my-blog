let ref_symbol = Symbol("ref_symbol");
export let fragment = Symbol("fragment");
let hookMap = new WeakMap();

let addHook = (obj, prop, payload) => {
  let map = hookMap.get(obj) ?? {};

  map[prop] = map[prop] ?? [];

  map[prop].push(payload);

  hookMap.set(obj, map);
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

      let isRef = value[ref_symbol] != null,
        prop,
        obj,
        cb;

      if (isRef) {
        [obj, prop, cb] = value[ref_symbol];

        value = cb != null ? cb(obj[prop]) : obj[prop];
      }

      if (key.startsWith("on")) {
        isRef = false;

        element.addEventListener(key.substring(2), ...toArray(value));
      } else {
        setAttr(element, key, value);
      }

      if (isRef) {
        addHook(obj, prop, [1, new WeakRef(element), key, cb, null]);
      }
    }
  }

  element.replaceChildren(
    ...children.flatMap((value) => {
      let isRef = value[ref_symbol] != null;

      if (!isRef) return toNodes(isSvg, toArray(value));

      let [obj, prop, cb] = value[ref_symbol];

      let [nodes, refs] = toNodesAndRefs(
        isSvg,
        toArray(cb != null ? cb(obj[prop]) : obj[prop])
      );

      addHook(obj, prop, [2, refs, null, cb, isSvg]);

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
  if (tag === fragment) return children;

  return { tag, attrs, children };
};

export let morph = (element, attrs, ...children) =>
  buildElement(element, attrs, element.nodeName === "svg", ...children);

export let ref = (...args) => {
  return {
    [ref_symbol]: args,
  };
};

let changes = [];

let changesScheduled = false;

let runChanges = () => {
  while (changes.length) {
    let [obj, prop, val, proxy] = changes.shift();

    let map = hookMap.get(proxy);

    if (map && map[prop]) {
      let item = map[prop];

      for (let i = 0; i < item.length; i++) {
        let [type, ref, key, cb, isSvg] = item[i];

        if (type === 1) {
          let element = ref.deref();

          if (element) {
            setAttr(element, key, cb != null ? cb(val) : val);
          }
        }

        if (type === 2) {
          let [nodes, refs] = toNodesAndRefs(
              isSvg,
              toArray(cb != null ? cb(val) : val)
            ),
            node;

          item[i][1] = refs;

          for (let i = 0; i < ref.length; i++) {
            let element = ref[i].deref();

            node = nodes.shift();

            if (!element) continue;

            element.replaceWith(node);
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
    set(obj, key, val, proxy) {
      changes.push([obj, key, val, proxy]);

      if (!changesScheduled) {
        changesScheduled = true;

        Promise.resolve().then(runChanges);
      }

      obj[key] = val;

      return true;
    },
  });
