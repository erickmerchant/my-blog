export class Element extends HTMLElement {
	#reads = new Map();
	#current = null;

	constructor() {
		super();

		let firstChild = this.firstElementChild;
		let mode =
			firstChild?.nodeName === "TEMPLATE"
				? firstChild?.getAttribute("shadowrootmode")
				: null;

		if (!this.shadowRoot && mode) {
			this.attachShadow({mode}).appendChild(firstChild.content.cloneNode(true));

			firstChild.remove();
		}
	}

	connectedCallback() {
		this.#update(this.hydrate?.() ?? []);
	}

	watch(state) {
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

	#update(formulas) {
		let prev = this.#current;

		for (let formula of formulas) {
			this.#current = formula;

			formula();
		}

		this.#current = prev;
	}
}
