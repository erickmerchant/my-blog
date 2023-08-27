let current;
let queue = [];
let values = {};
let reads = {};

export let update = (updates) => {
	let length = queue.length;

	queue.push(...updates);

	if (length === 0) {
		setTimeout(() => {
			let prev = current;

			for (let u of queue.splice(0, Infinity)) {
				current = u;
				u();
			}

			current = prev;
		}, 0);
	}
};

export let watch = (object, defaults = object, set = () => {}) => {
	for (let [k, initial] of Object.entries(defaults)) {
		let symbol = Symbol(k);

		reads[symbol] = [];

		Object.defineProperty(object, k, {
			get: () => {
				if (current) {
					reads[symbol].push(current);
				}

				return values[symbol];
			},
			set: (v) => {
				if (values[symbol] !== v) {
					values[symbol] = v;
					set?.(k, v);
					update([...new Set(reads[symbol].splice(0, Infinity))]);
				}
			},
		});

		object[k] = initial;
	}

	return object;
};

let isBoolean = (v) => typeof v === "boolean";

export class Element extends HTMLElement {
	static get observedAttributes() {
		return Object.keys(this.observedAttributeDefaults ?? {});
	}

	constructor() {
		super();

		let defaults = this.constructor.observedAttributeDefaults ?? {};

		for (let [k, v] of Object.entries(defaults)) {
			defaults[k] = isBoolean(v)
				? this.hasAttribute(k)
				: this.getAttribute(k) ?? v;
		}

		watch(this, defaults, (k, v) => {
			isBoolean(v) ? this.toggleAttribute(k, v) : this.setAttribute(k, v);
		});

		let firstChild = this.firstElementChild;
		let mode = firstChild?.getAttribute("shadowrootmode");

		if (!this.shadowRoot && firstChild?.nodeName === "TEMPLATE" && mode) {
			this.attachShadow({mode}).appendChild(firstChild.content.cloneNode(true));
			firstChild.remove();
		}
	}

	attributeChangedCallback(k, oldValue, newValue) {
		if (oldValue !== newValue) {
			this[k] = isBoolean(this[k]) ? newValue === "" : newValue;
		}
	}

	connectedCallback() {
		update(this.setupCallback?.() ?? []);
	}

	disconnectedCallback() {
		this.teardownCallback?.();
	}
}
