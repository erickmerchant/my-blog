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

	static get observedAttributes() {
		return ["open"];
	}

	#state = this.watch({
		open: this.hasAttribute("open"),
	});

	#nav = this.shadowRoot.getElementById("nav");
	#toggle = this.shadowRoot.getElementById("toggle");
	#icon = this.shadowRoot.getElementById("icon");

	*hydrate() {
		this.#toggle?.addEventListener("click", () => {
			this.#state.open = !this.#state.open;
		});

		window.addEventListener("resize", () => {
			this.#state.open = false;
		});

		document.body.addEventListener("click", (e) => {
			if (!e.target.matches("a") || !this.#state.open) return;

			let href = new URL(e.target.href);

			if (href.origin !== window.location.origin) return;

			e.preventDefault();

			this.#nav.addEventListener(
				"transitionend",
				() => {
					window.location = href;
				},
				{once: true}
			);

			this.#state.open = false;
		});

		yield () => this.toggleAttribute("open", this.#state.open);

		yield () =>
			this.#toggle?.setAttribute("aria-pressed", String(this.#state.open));

		yield () =>
			this.#icon?.setAttribute(
				"d",
				this.#state.open
					? "M1 4 l3 -3 l11 11 l-3 3 z m11 -3 l3 3 l-11 11 l-3 -3 z"
					: "M1 1 l14 0 l0 3.5 l-14 0 z m0 5.25 l14 0 l0 3.5 l-14 0 z m0 5.25 l14 0 l0 3.5 l-14 0 z"
			);
	}

	attributeChangedCallback(name, oldValue, newValue) {
		if (newValue !== oldValue) {
			this.#state[name] = newValue !== null;
		}
	}
}

customElements.define("page-nav", PageNav);
