// 0 constant
// 1 variable
// 2 tag
// 3 endtag
// 4 key
// 5 value
// 6 node
// 7 text
// 8 root

const weakMap = new WeakMap();

const TRUE = {
  type: 5,
  value: true,
};

const createIsChar = (regex) => (char) => char && regex.test(char);

const isNameChar = createIsChar(/[:@a-zA-Z0-9-]/);

const isQuoteChar = createIsChar(/["']/);

const concatArray = (entry) => {
  if (!Array.isArray(entry)) {
    entry = [entry];
  }

  return entry;
};

const tokenizer = {
  *tokenize(strs, variables) {
    let str, i, char;
    let opened = false;

    const nextChar = () => {
      char = str.charAt(i++);
    };

    const advance = (index) => {
      str = strs[index];
      i = 0;
    };

    for (let index = 0; index < strs.length; index++) {
      advance(index);

      nextChar();

      while (char) {
        if (!opened) {
          let value = '';

          if (char === '<') {
            let type = 2;

            nextChar();

            if (char === '/') {
              type = 3;

              do {
                nextChar();
              } while (isNameChar(char));

              yield {
                type,
              };
            } else {
              while (isNameChar(char)) {
                value += char;

                nextChar();
              }

              yield {
                type,
                value,
              };
            }

            opened = true;
          } else {
            while (char && char !== '<') {
              value += char;

              nextChar();
            }

            if (value.trim()) {
              yield {
                type: 7,
                value,
              };
            }
          }
        } else if (char.trim() === '') {
          nextChar();
        } else if (char === '/') {
          nextChar();

          if (char === '>') {
            yield {
              type: 3,
            };

            opened = false;

            nextChar();
          }
        } else if (char === '>') {
          opened = false;

          nextChar();
        } else if (isNameChar(char)) {
          let value = '';

          do {
            value += char;

            nextChar();
          } while (isNameChar(char));

          yield {
            type: 4,
            value,
          };

          if (char === '=') {
            nextChar();

            if (char) {
              let terminator = ' ';
              let value = '';

              if (isQuoteChar(char)) {
                terminator = char;

                nextChar();
              }

              while (char !== terminator) {
                if (char) {
                  value += char;
                } else {
                  value += variables[index];

                  index++;
                  advance(index);
                }

                nextChar();
              }

              if (terminator !== ' ') {
                nextChar();
              }

              yield {
                type: 5,
                value,
              };
            }
          } else {
            yield TRUE;
          }
        } else {
          throw new Error('end');
        }
      }

      if (index < variables.length) {
        yield {
          type: 1,
          value: index,
        };
      }
    }
  },
};

const parse = (read, parent, name, variables) => {
  const child = {
    name,
    dynamic: false,
    type: 6,
    attributes: [],
    children: [],
  };

  let token;

  while ((token = read())) {
    if (token.type !== 4) break;

    const key = token.value;

    token = read();

    const value = token.value;

    if (token.type === 5) {
      child.attributes.push({
        type: 0,
        key,
        value,
      });
    } else {
      child.dynamic = true;

      child.attributes.unshift({
        type: 1,
        key,
        value,
      });
    }
  }

  do {
    if (token.type === 3) break;

    if (token.type === 2) {
      const dynamic = parse(read, child, token.value, variables);

      child.dynamic ||= dynamic;
    } else if (token.type === 7 || token.type === 1) {
      if (token.type === 1) {
        child.dynamic = true;

        child.offset ??= child.children.length;
      }

      child.children.push(token);
    }
  } while ((token = read()));

  if (child.dynamic) {
    parent.offset ??= parent.children.length;
  }

  parent.children.push(child);

  child.offset ??= child.children.length;

  return child.dynamic;
};

let id = 1;

export const html = (strs, ...variables) => {
  let children = weakMap.get(strs);

  if (!children) {
    children = [];

    const tokens = tokenizer.tokenize(strs, variables);
    const read = () => tokens.next().value;

    let token;

    while ((token = read())) {
      if (token.type === 2) {
        parse(read, {children}, token.value, variables);
      } else if (token.type === 7 || token.type === 1) {
        children.push(token);
      }
    }

    for (let i = 0; i < children.length; i++) {
      children[i].view = id++;
    }

    weakMap.set(strs, children);
  }

  return {
    type: 8,
    dynamic: true,
    children,
    variables,
  };
};

export const cache = (result) => {
  if (result.children) {
    for (let i = 0; i < result.children.length; i++) {
      result.children[i].dynamic = false;
    }
  }

  result.dynamic = false;

  return result;
};

const svgNamespace = 'http://www.w3.org/2000/svg';

const readMeta = (target) => {
  if (!target) return {};

  let result = weakMap.get(target);

  if (!result) {
    result = {};

    weakMap.set(target, result);
  }

  return result;
};

const subRender = (view, variables, target, childNode, prevSvg) => {
  let result;

  if (view.type === 1) {
    view = variables[view.value];
  }

  view = concatArray(view);

  for (let i = 0; i < view.length; i++) {
    const current = view[i] ?? '';

    if (current.type === 8) {
      result = render(current, target, childNode, false);

      continue;
    }

    variables = current.variables ?? variables;

    let mode = 0;

    if (childNode != null) {
      const meta = readMeta(childNode);

      if (current.view !== meta.view) {
        mode = 1;
      }
    } else {
      mode = 2;
    }

    const svg =
      prevSvg || current.name === 'svg' || target.namespaceURI === svgNamespace;

    const ownerDocument = target.ownerDocument;

    let currentChildNode = childNode;

    if (!current.type || current.type === 7) {
      const value = current.value ?? current ?? '';

      if (mode) {
        currentChildNode = ownerDocument.createTextNode(value);
      } else if (childNode.data !== value) {
        childNode.data = value;
      }
    } else {
      if (mode) {
        currentChildNode =
          svg || current.name === 'svg'
            ? ownerDocument.createElementNS(svgNamespace, current.name)
            : ownerDocument.createElement(current.name);
      }

      if (mode || current.dynamic) {
        if (current.attributes) {
          for (
            let attributeIndex = 0;
            attributeIndex < current.attributes.length;
            attributeIndex++
          ) {
            const attribute = current.attributes[attributeIndex];

            if (!mode && attribute.type !== 1) {
              break;
            }

            let value = attribute.value;

            if (attribute.type === 1) {
              value = variables[value];
            }

            let key = attribute.key;

            const firstChar = key.charAt(0);

            if (firstChar === ':' || firstChar === '@') {
              key = key.substring(1);
            }

            if (firstChar === ':') {
              if (currentChildNode[key] !== value) {
                currentChildNode[key] = value;
              }
            } else if (firstChar === '@') {
              const meta = readMeta(currentChildNode);

              if (meta[key] != null && meta[key] !== value) {
                currentChildNode.removeEventListener(key, ...meta[key]);
              }

              if (value != null) {
                value = concatArray(value);

                currentChildNode.addEventListener(key, ...value);
              }

              meta[key] = value;
            } else if (value == null || value === false) {
              currentChildNode.removeAttribute(key);
            } else if (currentChildNode.getAttribute(key) !== value) {
              currentChildNode.setAttribute(key, value === true ? '' : value);
            }
          }
        }

        let currentGrandChildNode;

        let childIndex = 0;

        if (mode) {
          currentGrandChildNode = currentChildNode.firstChild;
        } else {
          childIndex = current.offset;

          currentGrandChildNode = currentChildNode.childNodes[childIndex];
        }

        if (current.children) {
          for (; childIndex < current.children.length; childIndex++) {
            let grandChildView = current.children[childIndex];

            if (grandChildView.type === 1) {
              grandChildView = variables[grandChildView.value];
            }

            grandChildView = concatArray(grandChildView);

            for (let i = 0; i < grandChildView.length; i++) {
              const currentGrandChildView = grandChildView[i] ?? '';

              currentGrandChildNode = subRender(
                currentGrandChildView,
                currentGrandChildView.variables ?? variables,
                currentChildNode,
                currentGrandChildNode,
                svg
              );
            }
          }
        }

        cleanUpChildren(currentGrandChildNode, currentChildNode);
      }
    }

    if (mode && current.view) {
      const meta = readMeta(currentChildNode);

      meta.view = current.view;
    }

    if (mode === 2) {
      target.appendChild(currentChildNode);
    }

    if (mode === 1) {
      target.replaceChild(currentChildNode, childNode);
    }

    result = currentChildNode.nextSibling;
  }

  return result;
};

export const render = (
  next,
  target,
  childNode = target.firstChild,
  cleanUp = true
) => {
  for (let i = 0; i < next.children.length; i++) {
    let view = next.children[i];

    if (view.type === 1) {
      view = next.variables[view.value];
    }

    view = concatArray(view);

    for (let j = 0; j < view.length; j++) {
      const currentView = view[j] ?? '';

      childNode = subRender(
        currentView,
        currentView.variables ?? next.variables,
        target,
        childNode
      );
    }
  }

  if (cleanUp) {
    cleanUpChildren(childNode, target);
  }

  return childNode;
};

const cleanUpChildren = (childNode, target) => {
  let nextChild;

  while (childNode) {
    nextChild = childNode.nextSibling;

    target.removeChild(childNode);

    childNode = nextChild;
  }
};
