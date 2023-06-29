export class Element extends HTMLElement {
	#observed = {};
	#reads = new Map();
	#current = null;

	constructor() {
		super();

		for (let [k, initial] of Object.entries(
			this.constructor.observedAttributeDefaults
		)) {
			let isBool = typeof initial === "boolean";

			Object.defineProperty(this, k, {
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

						isBool ? this.toggleAttribute(k, v) : this.setAttribute(k, v);

						this.#update(new Set(this.#reads.get(k)?.splice(0, Infinity)));
					}
				},
			});

			this[k] = isBool ? this.hasAttribute(k) : this.getAttribute(k) ?? initial;
		}

		let firstChild = this.firstElementChild;
		let mode = firstChild?.getAttribute("shadowrootmode");

		if (!this.shadowRoot && firstChild?.nodeName === "TEMPLATE" && mode) {
			this.attachShadow({mode}).appendChild(firstChild.content.cloneNode(true));
			firstChild.remove();
		}
	}

	attributeChangedCallback(name, oldValue, newValue) {
		if (oldValue !== newValue) {
			let isBool = typeof this[name] === "boolean";

			this[name] = isBool ? newValue === "" : newValue;
		}
	}

	connectedCallback() {
		this.#update(this.setupCallback?.() ?? []);
	}

	disconnectedCallback() {
		this.teardownCallback?.();
	}

	#update(updates) {
		let prev = this.#current;

		for (let u of updates) {
			this.#current = u;
			u();
		}

		this.#current = prev;
	}

	static get observedAttributes() {
		return Object.keys(this.observedAttributeDefaults);
	}
}
