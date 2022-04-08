const weakMap = new WeakMap();

const throwAssertionError = (actual, expected) => {
  throw Error(`Expected ${expected}. Found ${actual}.`);
};

const TRUE = {
  type: 'value',
  value: true,
};

const END = {
  type: 'end',
};

const attrToProp = {
  class: 'className',
  for: 'htmlFor',
};

const createIsChar = (regex) => (char) => char && regex.test(char);

const isSpaceChar = createIsChar(/\s/);
const isNameChar = createIsChar(/[:@a-zA-Z0-9-]/);
const isQuoteChar = createIsChar(/["']/);

const tokenizer = {
  *tokenize(acc, strs, vlength) {
    let str, i, char;

    const nextChar = () => {
      char = str.charAt(i++);
    };

    for (let index = 0; index < strs.length; index++) {
      str = strs[index];
      i = 0;

      nextChar();

      let tag = acc.tag;

      while (char) {
        if (!tag) {
          let value = '';

          if (char === '<') {
            let end = false;

            nextChar();

            if (char === '/') {
              end = true;

              nextChar();
            }

            while (isNameChar(char)) {
              value += char;

              nextChar();
            }

            yield {
              type: !end ? 'tag' : 'endtag',
              value,
            };

            tag = value;
          } else {
            while (char && char !== '<') {
              value += char;

              nextChar();
            }

            if (value.trim()) {
              yield {
                type: 'text',
                value,
              };
            }
          }
        } else if (isSpaceChar(char)) {
          nextChar();
        } else if (char === '/') {
          nextChar();

          if (char === '>') {
            yield* [
              END,
              {
                type: 'endtag',
                value: tag,
              },
            ];

            tag = false;

            nextChar();
          }
        } else if (char === '>') {
          yield END;

          tag = false;

          nextChar();
        } else if (isNameChar(char)) {
          let value = '';

          do {
            value += char;

            nextChar();
          } while (isNameChar(char));

          yield {
            type: 'key',
            value,
          };

          if (char === '=') {
            nextChar();

            let quote = '';
            let value = '';

            if (isQuoteChar(char)) {
              quote = char;

              nextChar();

              while (char !== quote) {
                if (char) {
                  value += char;

                  nextChar();
                } else {
                  throwAssertionError('', quote);
                }
              }

              nextChar();

              yield {
                type: 'value',
                value,
              };
            } else if (char) {
              throwAssertionError(char, '"');
            }
          } else {
            yield TRUE;
          }
        } else {
          yield {
            type: 'tag',
            value: tag,
          };
        }
      }

      acc.tag = tag;

      if (index < vlength) {
        yield {
          type: 'variable',
          value: index,
        };
      }
    }
  },
};

const parse = (read, parent, tag, variables) => {
  const child = {
    tag,
    dynamic: false,
    type: 'node',
    attributes: [],
    children: [],
  };

  let token;

  while ((token = read())) {
    if (token === END) break;

    if (token.type === 'key') {
      const key = token.value;

      token = read();

      const value = token.value;

      if (token.type === 'value') {
        child.attributes.push({
          type: 'constant',
          key,
          value,
        });
      } else {
        child.dynamic = true;

        child.attributes.unshift({
          type: 'variable',
          key,
          value,
        });
      }
    } else {
      throwAssertionError(token.type, 'end');
    }
  }

  while ((token = read())) {
    if (token.type === 'endtag' && token.value === child.tag) {
      break;
    } else if (token.type === 'tag') {
      const dynamic = parse(read, child, token.value, variables);

      child.dynamic ||= dynamic;
    } else if (token.type === 'text') {
      child.children.push({
        type: 'text',
        value: token.value,
      });
    } else if (token.type === 'variable') {
      child.dynamic = true;

      child.offset ??= child.children.length;

      child.children.push({
        type: 'variable',
        value: token.value,
      });
    }
  }

  if (child.dynamic) {
    parent.offset ??= parent.children.length;
  }

  parent.children.push(child);

  child.offset ??= child.children.length;

  return child.dynamic;
};

let id = 1;

export const html = (strs, ...variables) => {
  let views = weakMap.get(strs);

  if (!views) {
    const acc = {
      tag: false,
    };

    const tokens = tokenizer.tokenize(acc, strs, variables.length);
    const read = () => tokens.next().value;

    const children = [];
    let token;

    while ((token = read())) {
      if (token.type === 'tag') {
        parse(read, {children}, token.value, variables);
      } else if (token.type === 'text' && token.value.trim()) {
        children.push({
          type: 'text',
          value: token.value.trim(),
        });
      } else if (token.type === 'variable') {
        children.push({
          type: 'variable',
          value: token.value,
        });
      }
    }

    for (let i = 0; i < children.length; i++) {
      children[i].view = id++;
    }

    views = children;

    weakMap.set(strs, views);
  }

  return {
    dynamic: true,
    views,
    variables,
  };
};

export const cache = (result) => {
  if (result.views) {
    for (let i = 0; i < result.views.length; i++) {
      result.views[i].dynamic = false;
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

const subRender = (view, variables, target, childNode, prevMeta = {}) => {
  let mode = 0;

  if (childNode != null) {
    const meta = readMeta(childNode);

    if (view.view !== meta.view) {
      mode = 1;
    }
  } else {
    mode = 2;
  }

  const svg =
    prevMeta.svg || view.tag === 'svg' || target.namespaceURI === svgNamespace;

  const ownerDocument = target.ownerDocument;

  let currentChildNode = childNode;

  if (!view?.type || view.type === 'text') {
    const value = view?.value ?? view ?? '';

    if (mode) {
      currentChildNode = ownerDocument.createTextNode(value);
    } else if (childNode.data !== value) {
      childNode.data = value;
    }
  } else {
    if (mode) {
      currentChildNode =
        svg || view.tag === 'svg'
          ? ownerDocument.createElementNS(svgNamespace, view.tag)
          : ownerDocument.createElement(view.tag);
    }

    if (mode || view.dynamic) {
      if (view.attributes) {
        for (
          let attributeIndex = 0;
          attributeIndex < view.attributes.length;
          attributeIndex++
        ) {
          const attribute = view.attributes[attributeIndex];

          if (!mode && attribute.type !== 'variable') {
            break;
          }

          let value = attribute.value;

          if (attribute.type === 'variable') {
            value = variables[value];
          }

          let key = attribute.key;

          const firstChar = key.charAt(0);

          if (firstChar === ':' || firstChar === '@') {
            key = key.substring(1);
          }

          if (firstChar === ':') {
            if (currentChildNode[key] !== value) {
              currentChildNode[attrToProp[key] ?? key] = value;
            }
          } else if (firstChar === '@') {
            const meta = readMeta(currentChildNode);

            if (meta[key] != null && meta[key] !== value) {
              currentChildNode.removeEventListener(key, ...meta[key]);
            }

            if (value != null) {
              value = [].concat(value);

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

      if (!mode) {
        childIndex = view.offset;

        currentGrandChildNode = currentChildNode.childNodes[childIndex];
      } else {
        currentGrandChildNode = currentChildNode.firstChild;
      }

      if (view.children) {
        for (; childIndex < view.children.length; childIndex++) {
          let grandChildView = view.children[childIndex];

          if (grandChildView.type === 'variable') {
            grandChildView = variables[grandChildView.value];
          }

          if (!Array.isArray(grandChildView)) {
            grandChildView = [grandChildView];
          }

          for (let i = 0; i < grandChildView.length; i++) {
            const currentGrandChildView = grandChildView[i] ?? '';

            if (currentGrandChildView.views) {
              currentGrandChildNode = render(
                currentGrandChildView,
                currentChildNode,
                currentGrandChildNode,
                false
              );
            } else {
              currentGrandChildNode = subRender(
                currentGrandChildView,
                currentGrandChildView.variables ?? variables,
                currentChildNode,
                currentGrandChildNode,
                {
                  mode,
                  svg,
                }
              );
            }
          }
        }
      }

      cleanUpChildren(currentGrandChildNode, currentChildNode);
    }
  }

  if (mode && view.view) {
    const meta = readMeta(currentChildNode);

    meta.view = view.view;
  }

  if (mode === 2) {
    target.appendChild(currentChildNode);
  }

  if (mode === 1) {
    target.replaceChild(currentChildNode, childNode);
  }

  return currentChildNode?.nextSibling;
};

const cleanUpChildren = (childNode, target) => {
  let nextChild;

  while (childNode) {
    nextChild = childNode?.nextSibling;

    target.removeChild(childNode);

    childNode = nextChild;
  }
};

export const render = (
  next,
  target,
  childNode = target.firstChild,
  cleanUp = true
) => {
  for (let i = 0; i < next.views.length; i++) {
    let view = next.views[i];

    if (view.type === 'variable') {
      view = next.variables[view.value];
    }

    if (!Array.isArray(view)) {
      view = [view];
    }

    for (let j = 0; j < view.length; j++) {
      const currentView = view[j] ?? '';

      if (currentView.views) {
        childNode = render(currentView, target, childNode, false);
      } else {
        childNode = subRender(
          currentView,
          currentView.variables ?? next.variables,
          target,
          childNode
        );
      }
    }
  }

  if (cleanUp) {
    cleanUpChildren(childNode, target);
  }

  return childNode;
};
