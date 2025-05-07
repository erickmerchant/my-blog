/* wip and partial future handcraft dom api */

function create(tag, namespace) {
	const element = new WeakRef(document.createElementNS(namespace, tag));

	const p = new Proxy(function () {}, {
		apply(_, __, args) {
			const el = element.deref();

			if (el) {
				for (const a of args.flat(Infinity)) {
					if (a == null) continue;

					if (a.self) {
						el.append(a.self);
					} else {
						el.append(a);
					}
				}
			}

			return p;
		},
		get(_, key) {
			if (key === "self") {
				return element.deref();
			}

			return function (val, ...args) {
				const el = element.deref();

				if (el) {
					if (args.length) {
						el.setAttribute(key, [val].concat(args).join(" "));
					} else if (val === true || val === false) {
						el.toggleAttribute(key, true);
					} else {
						el.setAttribute(key, val);
					}
				}

				return p;
			};
		},
	});

	return p;
}

function factory(namespace) {
	return new Proxy(
		{},
		{
			get(_, tag) {
				return new Proxy(function () {}, {
					apply(_, __, args) {
						const el = create(tag, namespace);

						return el(...args);
					},
					get(_, key) {
						const el = create(tag, namespace);

						return el[key];
					},
				});
			},
		}
	);
}

export const h = {
	html: factory("http://www.w3.org/1999/xhtml"),
	svg: factory("http://www.w3.org/2000/svg"),
	math: factory("http://www.w3.org/1998/Math/MathML"),
};

export function unsafe(content) {
	const div = document.createElement("div");
	const shadow = div.attachShadow({mode: "open"});

	shadow.setHTMLUnsafe(content);

	return [...shadow.children];
}
