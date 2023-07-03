export class Element extends HTMLElement {
	static get observedAttributes() {
		return Object.keys(this.observedAttributeDefaults ?? {});
	}

	static keys = {};

	#observed = {};
	#reads = new Map();
	#current;

	watch(object, set, defaults = object) {
		for (let [k, initial] of Object.entries(defaults)) {
			Object.defineProperty(object, k, {
				get: () => {
					if (this.#current) {
						let r = this.#reads.get(k);

						if (!r) {
							r = [];
							this.#reads.set(k, r);
						}

						r.push(this.#current);
					}

					return this.#observed[k];
				},
				set: (v) => {
					if (this.#observed[k] !== v) {
						this.#observed[k] = v;
						set?.(
							(Element.keys[k] ??= k.replaceAll(
								/[A-Z]/g,
								(m) => "-" + m[0].toLowerCase()
							)),
							v
						);
						this.#update(new Set(this.#reads.get(k)?.splice(0, Infinity)));
					}
				},
			});

			object[k] = initial;
		}

		return object;
	}

	#update(updates) {
		let prev = this.#current;

		for (let u of updates) {
			this.#current = u;
			u();
		}

		this.#current = prev;
	}

	constructor() {
		super();

		this.watch(
			this,
			(name, v) => {
				typeof v === "boolean"
					? this.toggleAttribute(name, v)
					: this.setAttribute(name, v);
			},
			this.constructor?.observedAttributeDefaults ?? {}
		);

		let firstChild = this.firstElementChild;
		let mode = firstChild?.getAttribute("shadowrootmode");

		if (!this.shadowRoot && firstChild?.nodeName === "TEMPLATE" && mode) {
			this.attachShadow({mode}).appendChild(firstChild.content.cloneNode(true));
			firstChild.remove();
		}
	}

	attributeChangedCallback(name, oldValue, newValue) {
		if (oldValue !== newValue) {
			let k = (Element.keys[name] ??= name.replaceAll(/-([a-z])/g, (m) =>
				m[1].toUpperCase()
			));

			this[k] = typeof this[k] === "boolean" ? newValue === "" : newValue;
		}
	}

	connectedCallback() {
		this.#update(this.setupCallback?.() ?? []);
	}

	disconnectedCallback() {
		this.teardownCallback?.();
	}
}
