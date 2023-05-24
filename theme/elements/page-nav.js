import {Element} from "../element.js";

export class PageNav extends Element {
	#state = this.watch({
		open: this.hasAttribute("open"),
		minified: this.hasAttribute("minified"),
	});

	#toggle = this.shadowRoot.getElementById("toggle");

	#icon = this.shadowRoot.getElementById("icon");

	#previousY = 0;

	#handleScroll = this.throttle(() => {
		let currentY = document.body.scrollTop;

		if (currentY !== this.#previousY) {
			this.#state.minified = currentY >= this.#previousY;
		}

		this.#previousY = currentY;
	});

	*hydrate() {
		this.#toggle?.addEventListener("click", () => {
			this.#state.open = !this.#state.open;
		});

		document.body.addEventListener("scroll", this.#handleScroll);

		this.addEventListener("mouseenter", () => {
			this.#state.minified = false;
		});

		yield () => {
			this.toggleAttribute("minified", this.#state.minified);
		};

		yield () => {
			this.toggleAttribute("open", this.#state.open);
		};

		yield () => {
			this.#toggle?.setAttribute("aria-pressed", `${this.#state.open}`);
		};

		yield () => {
			this.#icon?.setAttribute(
				"d",
				this.#state.open
					? "M1 4 l3 -3 l11 11 l-3 3 z m11 -3 l3 3 l-11 11 l-3 -3 z"
					: "M1 1 l14 0 l0 3.5 l-14 0 z m0 5.25 l14 0 l0 3.5 l-14 0 z m0 5.25 l14 0 l0 3.5 l-14 0 z"
			);
		};
	}

	disconnectedCallback() {
		document.body.removeEventListener("scroll", this.#handleScroll);
	}

	attributeChangedCallback(name, oldValue, newValue) {
		if (newValue !== oldValue) {
			this.#state[name] = newValue !== null;
		}
	}

	static get observedAttributes() {
		return ["open", "minified"];
	}
}

customElements.define("page-nav", PageNav);
