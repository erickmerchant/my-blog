export class Element extends HTMLElement {
	#observed = new Map();
	#observer;

	constructor() {
		super();

		let firstChild = this.firstElementChild;
		let mode = firstChild?.getAttribute("shadowrootmode");

		if (!this.shadowRoot && firstChild?.nodeName === "TEMPLATE" && mode) {
			this.attachShadow({mode}).appendChild(firstChild.content.cloneNode(true));
			firstChild.remove();
		}

		this.#observer = new MutationObserver((mutations) => {
			for (const {attributeName} of mutations) {
				this.#observed.get(attributeName)?.(this.getAttribute(attributeName));
			}
		});

		this.#observer.observe(this, {
			attributes: true,
		});
	}

	connectedCallback() {
		Element.#update(this.setupCallback?.() ?? []);
	}

	disconnectedCallback() {
		this.#observer.disconnect();
		this.teardownCallback?.();
	}

	attributes(state) {
		let updates = [];

		state = Element.watch(state);

		for (let [k, v] of Object.entries(state)) {
			let isBool = typeof v === "boolean";

			state[k] = (isBool ? this.hasAttribute(k) : this.getAttribute(k)) ?? v;

			updates.push(() => {
				isBool
					? this.toggleAttribute(k, state[k])
					: this.setAttribute(k, state[k]);
			});

			this.#observed.set(k, (v) => {
				state[k] = isBool ? v === "" : v;
			});
		}

		Element.#update(updates);

		return state;
	}

	static #reads = new Map();
	static #current = null;
	static #scheduled = false;

	static watch(state) {
		let symbols = {};

		return new Proxy(state, {
			set: (state, k, v) => {
				if (state[k] !== v) {
					symbols[k] ??= Symbol("");
					state[k] = v;

					let updates = this.#reads.get(symbols[k]);

					if (updates) {
						this.#reads.delete(symbols[k]);

						if (!this.#scheduled) {
							setTimeout(() => {
								this.#update(updates);
								this.#scheduled = false;
							}, 0);

							this.#scheduled = true;
						}
					}
				}

				return true;
			},
			get: (state, k) => {
				symbols[k] ??= Symbol("");

				if (this.#current) {
					let r = this.#reads.get(symbols[k]);

					if (!r) {
						r = new Set();
						this.#reads.set(symbols[k], r);
					}

					r.add(this.#current);
				}

				return state[k];
			},
		});
	}

	static #update(updates) {
		let prev = this.#current;

		for (let u of updates) {
			this.#current = u;
			u();
		}

		this.#current = prev;
	}
}
