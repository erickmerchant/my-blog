let current;
let queue = [];

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

export let watch = (object) => {
	let reads = {};

	for (let key of Object.keys(object)) {
		reads[key] = [];
	}

	return new Proxy(object, {
		get: (target, key) => {
			if (current) {
				reads[key].push(current);
			}

			return target[key];
		},
		set: (target, key, value) => {
			if (target[key] !== value) {
				target[key] = value;

				update([...new Set(reads[key].splice(0, Infinity))]);
			}

			return true;
		},
	});
};

export class Element extends HTMLElement {
	constructor() {
		super();

		let firstChild = this.firstElementChild;
		let mode = firstChild?.getAttribute("shadowrootmode");

		if (!this.shadowRoot && firstChild?.nodeName === "TEMPLATE" && mode) {
			this.attachShadow({mode}).appendChild(firstChild.content.cloneNode(true));
			firstChild.remove();
		}
	}

	connectedCallback() {
		update(this.setupCallback?.() ?? []);
	}

	disconnectedCallback() {
		this.teardownCallback?.();
	}
}
