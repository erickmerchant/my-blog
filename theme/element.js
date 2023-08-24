export class Element extends HTMLElement {
	static get observedAttributes() {
		return Object.keys(this.observedAttributeDefaults ?? {});
	}

	static #current;
	static #queue = [];

	static #update(updates) {
		let length = this.#queue.length;

		this.#queue.push(...updates);

		if (length === 0) {
			setTimeout(() => {
				let prev = this.#current;

				for (let u of this.#queue.splice(0, Infinity)) {
					this.#current = u;
					u();
				}

				this.#current = prev;
			}, 0);
		}
	}

	#values = {};
	#reads = {};

	watch(object, defaults = object, set = () => {}) {
		for (let [k, initial] of Object.entries(defaults)) {
			let symbol = Symbol(k);

			this.#reads[symbol] = [];

			Object.defineProperty(object, k, {
				get: () => {
					if (Element.#current) {
						this.#reads[symbol].push(Element.#current);
					}

					return this.#values[symbol];
				},
				set: (v) => {
					if (this.#values[symbol] !== v) {
						this.#values[symbol] = v;
						set?.(k, v);
						Element.#update([
							...new Set(this.#reads[symbol]?.splice(0, Infinity)),
						]);
					}
				},
			});

			object[k] = initial;
		}

		return object;
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
		Element.#update(this.setupCallback?.() ?? []);
	}

	disconnectedCallback() {
		this.teardownCallback?.();
	}
}
