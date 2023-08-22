export class Element extends HTMLElement {
	static get observedAttributes() {
		return Object.keys(this.observedAttributeDefaults ?? {});
	}

	#current;

	watch(object, defaults = object, set = () => {}) {
		let values = {};
		let reads = {};

		for (let [k, initial] of Object.entries(defaults)) {
			reads[k] = [];

			Object.defineProperty(object, k, {
				get: () => {
					if (this.#current) {
						reads[k].push(this.#current);
					}

					return values[k];
				},
				set: (v) => {
					if (values[k] !== v) {
						values[k] = v;
						set?.(k, v);
						this.#update(new Set(reads[k]?.splice(0, Infinity)));
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
			this.constructor?.observedAttributeDefaults ?? {},
			(k, v) => {
				typeof v === "boolean"
					? this.toggleAttribute(k, v)
					: this.setAttribute(k, v);
			}
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
