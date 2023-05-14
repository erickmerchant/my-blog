import {Element} from "../element.js";

export class PageNav extends Element {
	static {
		let previousY = 0;
		let frameRequested = false;

		document.body.addEventListener("scroll", () => {
			if (!frameRequested) {
				frameRequested = true;

				window.requestAnimationFrame(() => {
					frameRequested = false;

					let currentY = document.body.scrollTop;

					if (currentY !== previousY) {
						document.body.style.setProperty(
							"--scrolling-down",
							currentY < previousY ? "0" : "1"
						);
					}

					previousY = currentY;
				});
			}
		});
	}

	static #icons = {
		open: "M1 1 l14 0 l0 3.5 l-14 0 z m0 5.25 l14 0 l0 3.5 l-14 0 z m0 5.25 l14 0 l0 3.5 l-14 0 z",
		close: "M1 4 l3 -3 l11 11 l-3 3 z m11 -3 l3 3 l-11 11 l-3 -3 z",
	};

	static get observedAttributes() {
		return ["open"];
	}

	#state = this.watch({
		open: this.hasAttribute("open"),
		transitioning: false,
	});

	#nav = this.shadowRoot.getElementById("nav");
	#toggle = this.shadowRoot.getElementById("toggle");
	#icon = this.shadowRoot.getElementById("icon");

	*hydrate() {
		this.#toggle?.addEventListener("click", () => {
			this.#state.open = !this.#state.open;
			this.#state.transitioning = true;
		});

		this.#nav?.addEventListener("transitionend", () => {
			this.#state.transitioning = false;
		});

		yield () => this.toggleAttribute("open", this.#state.open);

		yield () => this.#nav?.classList?.toggle("open", this.#state.open);

		yield () =>
			this.#nav?.classList?.toggle("transitioning", this.#state.transitioning);

		yield () =>
			this.#toggle?.setAttribute("aria-pressed", String(this.#state.open));

		yield () =>
			this.#icon?.setAttribute(
				"d",
				PageNav.#icons[this.#state.open ? "close" : "open"]
			);
	}

	attributeChangedCallback(name, oldValue, newValue) {
		if (name === "open" && newValue !== oldValue) {
			this.#state.open = newValue !== null;
		}
	}
}

customElements.define("page-nav", PageNav);
