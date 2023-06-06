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
			childList: false,
			subtree: false,
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
		let formulas = [];

		state = Element.watch(state);

		for (let [key, value] of Object.entries(state)) {
			let isBool = typeof value === "boolean";

			state[key] =
				(isBool ? this.hasAttribute(key) : this.getAttribute(key)) ?? value;

			formulas.push(() => {
				isBool
					? this.toggleAttribute(key, state[key])
					: this.setAttribute(key, state[key]);
			});

			this.#observed.set(key, (value) => {
				state[key] = isBool ? value === "" : value;
			});
		}

		Element.#update(formulas);

		return state;
	}

	static #reads = new Map();
	static #current = null;

	static watch(state) {
		let symbols = {};

		return new Proxy(state, {
			set: (state, key, value) => {
				if (state[key] !== value) {
					symbols[key] ??= Symbol("");

					state[key] = value;

					let formulas = this.#reads.get(symbols[key]);

					if (formulas) {
						this.#reads.delete(symbols[key]);

						this.#update(formulas);
					}
				}

				return true;
			},
			get: (state, key) => {
				symbols[key] ??= Symbol("");

				if (this.#current) {
					let r = this.#reads.get(symbols[key]);

					if (!r) {
						r = new Set();

						this.#reads.set(symbols[key], r);
					}

					r.add(this.#current);
				}

				return state[key];
			},
		});
	}

	static #update(formulas) {
		let prev = this.#current;

		for (let formula of formulas) {
			this.#current = formula;

			formula();
		}

		this.#current = prev;
	}
}
