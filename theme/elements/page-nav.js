import {Element} from "../element.js";

export class PageNav extends Element {
	#state = this.watch({
		expanded: this.hasAttribute("expanded"),
		minimized: this.hasAttribute("minimized"),
	});
	#previousY = 0;
	#transitioning = false;

	#handleScroll = this.throttle(() => {
		let currentY = document.body.scrollTop;

		if (currentY !== this.#previousY && !this.#transitioning) {
			this.#state.minimized = currentY >= this.#previousY;
		}

		this.#previousY = currentY;
	});

	*hydrate() {
		document.body.addEventListener("scroll", this.#handleScroll);

		this.addEventListener("mouseenter", () => {
			this.#state.minimized = false;
		});

		yield* [
			() => {
				this.toggleAttribute("minimized", this.#state.minimized);
			},

			() => {
				this.toggleAttribute("expanded", this.#state.expanded);
			},
		];

		let nav = this.shadowRoot.getElementById("nav");

		nav?.addEventListener("transitionstart", () => {
			this.#transitioning = true;
		});

		nav?.addEventListener("transitionend", () => {
			this.#transitioning = false;
		});

		let toggle = this.shadowRoot.getElementById("toggle");

		toggle?.addEventListener("click", () => {
			this.#state.expanded = !this.#state.expanded;
			this.#state.minimized = false;
		});

		toggle = new WeakRef(toggle);

		yield () => {
			toggle.deref()?.setAttribute("aria-pressed", `${this.#state.expanded}`);
		};

		let icon = new WeakRef(this.shadowRoot.getElementById("icon"));

		yield () => {
			icon
				.deref()
				?.setAttribute(
					"d",
					this.#state.expanded
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
		return ["expanded", "minimized"];
	}
}

customElements.define("page-nav", PageNav);
