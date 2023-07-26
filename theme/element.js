export class Element extends HTMLElement {
	static get observedAttributes() {
		return Object.keys(this.observedAttributeDefaults ?? {});
	}

	#observed = {};
	#reads = {};
	#current;

	watch(object, set, defaults = object) {
		for (let [k, initial] of Object.entries(defaults)) {
			Object.defineProperty(object, k, {
				get: () => {
					if (this.#current) {
						this.#reads[k] ??= [];
						this.#reads[k].push(this.#current);
					}

					return this.#observed[k];
				},
				set: (v) => {
					if (this.#observed[k] !== v) {
						this.#observed[k] = v;
						set?.(k, v);
						this.#update(new Set(this.#reads[k]?.splice(0, Infinity)));
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

	attributeChangedCallback(k, oldValue, newValue) {
		if (oldValue !== newValue) {
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
