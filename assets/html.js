let fragment_symbol = Symbol("fragment");
let ref_symbol = Symbol("ref");
let hookMap = new WeakMap();

export { fragment_symbol as fragment };

let toArray = (value) => {
  if (Array.isArray(value)) return value;

  return [value];
};

let addHook = (paths, payload) => {
  for (let i = 0; i < paths.length; i++) {
    let [object, property] = paths[i];

    let map = hookMap.get(object);

    if (!map) {
      map = {};
      hookMap.set(object, map);
    }

    map[property] = map[property] ?? [];
    map[property].push(payload);
  }
};

let setAttr = (element, key, value) => {
  if (value === true || value === false) {
    element.toggleAttribute(key, value);
  } else {
    element.setAttribute(key, value);
  }
};

let buildElement = (element, attributes, svg, ...children) => {
  if (attributes != null) {
    attributes = Object.entries(attributes);

    for (let i = 0; i < attributes.length; i++) {
      let [key, value] = attributes[i];
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
        addHook(value[ref_symbol].paths, {
          type: 1,
          refs: new WeakRef(element),
          key,
          callback: value[ref_symbol].callback,
        });
      }
    }
  }

  element.append(
    ...children.flatMap((value) => {
      let isRef = value[ref_symbol] != null;

      if (!isRef) return toNodes(svg, toArray(value));

      let [nodes, refs] = toNodesAndRefs(
        svg,
        toArray(value[ref_symbol].initial)
      );

      addHook(value[ref_symbol].paths, {
        type: 2,
        refs,
        svg,
        callback: value[ref_symbol].callback,
      });

      return nodes;
    })
  );

  return element;
};

let toNode = (svg, node) => {
  if (typeof node !== "object") {
    return document.createTextNode(node);
  }

  let { tag, attributes, children } = node;

  svg = tag === "svg" ? true : svg;

  let element = !svg
    ? document.createElement(tag)
    : document.createElementNS("http://www.w3.org/2000/svg", tag);

  return buildElement(element, attributes, svg, ...children);
};

let toNodes = (svg, list) => {
  let nodes = [];

  for (let i = 0; i < list.length; i++) {
    nodes.push(toNode(svg, list[i]));
  }

  return nodes;
};

let toNodesAndRefs = (svg, list) => {
  let nodes = [];
  let refs = [];

  for (let i = 0; i < list.length; i++) {
    let node = toNode(svg, list[i]);

    nodes.push(node);
    refs.push(new WeakRef(node));
  }

  return [nodes, refs];
};

export let h = (tag, attributes, ...children) => {
  if (tag === fragment_symbol) return children;

  return { tag, attributes, children };
};

export let render = (args, element) => {
  let attributes = null,
    children;

  if (Array.isArray(args)) {
    children = args;
  } else {
    attributes = args.attributes;
    children = args.children;
  }

  return buildElement(
    element,
    attributes,
    element.nodeName === "svg",
    ...children
  );
};

let paths = [];
let recordPaths = false;

export let compute = (callback) => {
  recordPaths = true;

  let initial = callback();

  recordPaths = false;

  return {
    [ref_symbol]: {
      initial,
      callback,
      paths: paths.splice(0, paths.length),
    },
  };
};

let changes = [];
let changesScheduled = false;

let runChanges = () => {
  let itemSet = new Set();

  while (changes.length) {
    let { property, value, proxy } = changes.shift();
    let map = hookMap.get(proxy);

    if (map && map[property] && !itemSet.has(map[property])) {
      let item = map[property];

      itemSet.add(item);

      for (let i = 0; i < item.length; i++) {
        let { type, refs, key, svg, callback } = item[i];

        if (type === 1) {
          let element = refs.deref();

          if (element) {
            setAttr(element, key, callback(value));
          }
        }

        if (type === 2) {
          let [nodes, additions] = toNodesAndRefs(
              svg,
              toArray(callback(value))
            ),
            node;

          item[i].refs = additions;

          for (let i = 0; i < refs.length; i++) {
            let element = refs[i].deref();

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
  }

  changesScheduled = false;
};

let proxy_symbol = Symbol("proxy");

export let proxy = (state) => {
  state[proxy_symbol] = true;

  return new Proxy(state, {
    get(object, property, self) {
      let value = Reflect.get(object, property, self);

      if (recordPaths) {
        paths.push([self, property]);

        if (
          value != null &&
          typeof value === "object" &&
          !value[proxy_symbol]
        ) {
          value = proxy(value);

          Reflect.set(object, property, value, self);
        }
      }

      return value;
    },
    set(object, property, value, self) {
      changes.push({ property, value, proxy: self });

      if (!changesScheduled) {
        changesScheduled = true;

        Promise.resolve().then(runChanges);
      }

      return Reflect.set(object, property, value, self);
    },
  });
};
