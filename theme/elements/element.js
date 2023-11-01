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
		get: (target, key, r) => {
			if (current) {
				reads[key].push(current);
			}

			return Reflect.get(target, key, r);
		},
		set: (target, key, value, r) => {
			update([...new Set(reads[key].splice(0, Infinity))]);

			return Reflect.set(target, key, value, r);
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
