const weakMap = new WeakMap();

const throwAssertionError = (actual, expected) => {
  throw Error(`Expected ${expected}. Found ${actual}.`);
};

const TYPE = 'type';
const VALUE = 'value';
const NAME = 'name';
const DYNAMIC = 'dynamic';
const ATTRIBUTES = 'attributes';
const CHILDREN = 'children';
const END = 'end';
const TAG = 'tag';
const ENDTAG = 'endtag';
const TEXT = 'text';
const NODE = 'node';
const VARIABLE = 'variable';
const CONSTANT = 'constant';
const KEY = 'key';
const SVG = 'svg';
const OFFSET = 'offset';
const VARIABLES = 'variables';
const VIEW = 'view';
const VIEWS = 'views';

const TRUE_TOKEN = {
  [TYPE]: VALUE,
  [VALUE]: true,
};

const END_TOKEN = {
  [TYPE]: END,
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

      let name = acc[NAME];

      while (char) {
        if (!name) {
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
              [TYPE]: !end ? TAG : ENDTAG,
              [VALUE]: value,
            };

            name = value;
          } else {
            while (char && char !== '<') {
              value += char;

              nextChar();
            }

            if (value.trim()) {
              yield {
                [TYPE]: TEXT,
                [VALUE]: value,
              };
            }
          }
        } else if (isSpaceChar(char)) {
          nextChar();
        } else if (char === '/') {
          nextChar();

          if (char === '>') {
            yield* [
              END_TOKEN,
              {
                [TYPE]: ENDTAG,
                [VALUE]: name,
              },
            ];

            name = false;

            nextChar();
          }
        } else if (char === '>') {
          yield END_TOKEN;

          name = false;

          nextChar();
        } else if (isNameChar(char)) {
          let value = '';

          do {
            value += char;

            nextChar();
          } while (isNameChar(char));

          yield {
            [TYPE]: KEY,
            [VALUE]: value,
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

                  nextChar();
                } else {
                  throwAssertionError('', terminator);
                }
              }

              if (terminator !== ' ') {
                nextChar();
              }

              yield {
                [TYPE]: VALUE,
                [VALUE]: value,
              };
            }
          } else {
            yield TRUE_TOKEN;
          }
        } else {
          yield {
            [TYPE]: TAG,
            [VALUE]: name,
          };
        }
      }

      acc[NAME] = name;

      if (index < vlength) {
        yield {
          [TYPE]: VARIABLE,
          [VALUE]: index,
        };
      }
    }
  },
};

const parse = (read, parent, name, variables) => {
  const child = {
    [NAME]: name,
    [DYNAMIC]: false,
    [TYPE]: NODE,
    [ATTRIBUTES]: [],
    [CHILDREN]: [],
  };

  let token;

  while ((token = read())) {
    if (token === END_TOKEN) break;

    if (token[TYPE] === KEY) {
      const key = token[VALUE];

      token = read();

      const value = token[VALUE];

      if (token[TYPE] === VALUE) {
        child[ATTRIBUTES].push({
          [TYPE]: CONSTANT,
          [KEY]: key,
          [VALUE]: value,
        });
      } else {
        child[DYNAMIC] = true;

        child[ATTRIBUTES].unshift({
          [TYPE]: VARIABLE,
          [KEY]: key,
          [VALUE]: value,
        });
      }
    } else {
      throwAssertionError(token[TYPE], END);
    }
  }

  while ((token = read())) {
    if (token[TYPE] === ENDTAG && token[VALUE] === child[NAME]) {
      break;
    }

    if (token[TYPE] === TAG) {
      const dynamic = parse(read, child, token[VALUE], variables);

      child[DYNAMIC] ||= dynamic;
    } else if (token[TYPE] === TEXT) {
      child[CHILDREN].push({
        [TYPE]: TEXT,
        [VALUE]: token[VALUE],
      });
    } else if (token[TYPE] === VARIABLE) {
      child[DYNAMIC] = true;

      child[OFFSET] ??= child[CHILDREN].length;

      child[CHILDREN].push({
        [TYPE]: VARIABLE,
        [VALUE]: token[VALUE],
      });
    }
  }

  if (child[DYNAMIC]) {
    parent[OFFSET] ??= parent[CHILDREN].length;
  }

  parent[CHILDREN].push(child);

  child[OFFSET] ??= child[CHILDREN].length;

  return child[DYNAMIC];
};

let id = 1;

export const html = (strs, ...variables) => {
  let views = weakMap.get(strs);

  if (!views) {
    const acc = {
      [NAME]: false,
    };

    const tokens = tokenizer.tokenize(acc, strs, variables.length);
    const read = () => tokens.next()[VALUE];

    const children = [];
    let token;

    while ((token = read())) {
      if (token[TYPE] === TAG) {
        parse(read, {[CHILDREN]: children}, token[VALUE], variables);
      } else if (token[TYPE] === TEXT && token[VALUE].trim()) {
        children.push({
          [TYPE]: TEXT,
          [VALUE]: token[VALUE].trim(),
        });
      } else if (token[TYPE] === VARIABLE) {
        children.push({
          [TYPE]: VARIABLE,
          [VALUE]: token[VALUE],
        });
      }
    }

    for (let i = 0; i < children.length; i++) {
      children[i][VIEW] = id++;
    }

    views = children;

    weakMap.set(strs, views);
  }

  return {
    [DYNAMIC]: true,
    [VIEWS]: views,
    [VARIABLES]: variables,
  };
};

export const cache = (result) => {
  if (result[VIEWS]) {
    for (let i = 0; i < result[VIEWS].length; i++) {
      result[VIEWS][i][DYNAMIC] = false;
    }
  }

  result[DYNAMIC] = false;

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

  if (view[TYPE] === VARIABLE) {
    view = variables[view[VALUE]];
  }

  if (!Array.isArray(view)) {
    view = [view];
  }

  for (let i = 0; i < view.length; i++) {
    const current = view[i] ?? '';

    if (current[VIEWS]) {
      result = render(current, target, childNode, false);

      continue;
    }

    variables = current[VARIABLES] ?? variables;

    let mode = 0;

    if (childNode != null) {
      const meta = readMeta(childNode);

      if (current[VIEW] !== meta[VIEW]) {
        mode = 1;
      }
    } else {
      mode = 2;
    }

    const svg =
      prevSvg || current[NAME] === SVG || target.namespaceURI === svgNamespace;

    const ownerDocument = target.ownerDocument;

    let currentChildNode = childNode;

    if (!current?.[TYPE] || current[TYPE] === TEXT) {
      const value = current?.[VALUE] ?? current ?? '';

      if (mode) {
        currentChildNode = ownerDocument.createTextNode(value);
      } else if (childNode.data !== value) {
        childNode.data = value;
      }
    } else {
      if (mode) {
        currentChildNode =
          svg || current[NAME] === SVG
            ? ownerDocument.createElementNS(svgNamespace, current[NAME])
            : ownerDocument.createElement(current[NAME]);
      }

      if (mode || current[DYNAMIC]) {
        if (current[ATTRIBUTES]) {
          for (
            let attributeIndex = 0;
            attributeIndex < current[ATTRIBUTES].length;
            attributeIndex++
          ) {
            const attribute = current[ATTRIBUTES][attributeIndex];

            if (!mode && attribute[TYPE] !== VARIABLE) {
              break;
            }

            let value = attribute[VALUE];

            if (attribute[TYPE] === VARIABLE) {
              value = variables[value];
            }

            let key = attribute[KEY];

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
                if (!Array.isArray(value)) {
                  value = [value];
                }

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
          childIndex = current[OFFSET];

          currentGrandChildNode = currentChildNode.childNodes[childIndex];
        }

        if (current[CHILDREN]) {
          for (; childIndex < current[CHILDREN].length; childIndex++) {
            let grandChildView = current[CHILDREN][childIndex];

            if (grandChildView[TYPE] === VARIABLE) {
              grandChildView = variables[grandChildView[VALUE]];
            }

            if (!Array.isArray(grandChildView)) {
              grandChildView = [grandChildView];
            }

            for (let i = 0; i < grandChildView.length; i++) {
              const currentGrandChildView = grandChildView[i] ?? '';

              currentGrandChildNode = subRender(
                currentGrandChildView,
                currentGrandChildView[VARIABLES] ?? variables,
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

    if (mode && current[VIEW]) {
      const meta = readMeta(currentChildNode);

      meta[VIEW] = current[VIEW];
    }

    if (mode === 2) {
      target.appendChild(currentChildNode);
    }

    if (mode === 1) {
      target.replaceChild(currentChildNode, childNode);
    }

    result = currentChildNode?.nextSibling;
  }

  return result;
};

export const render = (
  next,
  target,
  childNode = target.firstChild,
  cleanUp = true
) => {
  for (let i = 0; i < next[VIEWS].length; i++) {
    let view = next[VIEWS][i];

    if (view[TYPE] === VARIABLE) {
      view = next[VARIABLES][view[VALUE]];
    }

    if (!Array.isArray(view)) {
      view = [view];
    }

    for (let j = 0; j < view.length; j++) {
      const currentView = view[j] ?? '';

      childNode = subRender(
        currentView,
        currentView[VARIABLES] ?? next[VARIABLES],
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
    nextChild = childNode?.nextSibling;

    target.removeChild(childNode);

    childNode = nextChild;
  }
};
