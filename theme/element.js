export class Element extends HTMLElement {
	#observedAttributes = new Map();
	#observer;

	refs = new Proxy(
		{},
		{
			get: (refs, key) => {
				let ref = refs[key]?.deref();

				if (!ref) {
					ref = this.shadowRoot?.getElementById(key);

					refs[key] = ref ? new WeakRef(ref) : null;
				}

				return ref;
			},
		}
	);

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

		this.#observer = new MutationObserver((mutationList, _observer) => {
			for (const mutation of mutationList) {
				this.#observedAttributes.get(mutation.attributeName)?.(
					this.getAttribute(mutation.attributeName)
				);
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
		let watched = Element.watch(state);

		for (let [key, value] of Object.entries(state)) {
			let isBool = typeof value === "boolean";

			watched[key] =
				(isBool ? this.hasAttribute(key) : this.getAttribute(key)) ?? value;

			formulas.push(() => {
				if (isBool) {
					this.toggleAttribute(key, watched[key]);
				} else {
					this.setAttribute(key, watched[key]);
				}
			});

			this.#observedAttributes.set(key, (value) => {
				watched[key] = isBool ? value === "" : value;
			});
		}

		Element.#update(formulas);

		return watched;
	}

	static #reads = new Map();
	static #current = null;
	static #frameRequested = false;

	static throttle(callback) {
		return () => {
			if (!this.#frameRequested) {
				this.#frameRequested = true;

				window.requestAnimationFrame(() => {
					this.#frameRequested = false;

					callback();
				});
			}
		};
	}

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
