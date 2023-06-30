export class Element extends HTMLElement {
	#observed = {};
	#reads = new Map();
	#current = null;

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
						set(k, v);
						this.#update(new Set(this.#reads.get(k)?.splice(0, Infinity)));
					}
				},
			});

			object[k] = initial;
		}
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
			(k, v) => {
				let bool = typeof v === "boolean";
				bool ? this.toggleAttribute(k, v) : this.setAttribute(k, v);
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
			let bool = typeof this[name] === "boolean";

			this[name] = bool ? newValue === "" : newValue;
		}
	}

	connectedCallback() {
		this.#update(this.setupCallback?.() ?? []);
	}

	disconnectedCallback() {
		this.teardownCallback?.();
	}

	static get observedAttributes() {
		return Object.keys(this.observedAttributeDefaults ?? {});
	}
}
