export let html = new Proxy(
  {},
  {
    get(_, tag) {
      return (...args) => {
        args = args.flat(Infinity);

        let el = document.createElement(tag);

        if (typeof args[0] === "object" && !(args[0] instanceof Element)) {
          let obj = args.shift();

          for (let [key, val] of Object.entries(obj)) {
            if (key.startsWith("on")) {
              el.addEventListener(
                key.substring(2).toLowerCase(),
                ...[].concat(val)
              );
            } else {
              el[key] = val;
            }
          }
        }

        el.append(...args);

        return el;
      };
    },
  }
);
