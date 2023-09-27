import {Element} from "element";

export class PageNav extends Element {
	#state = this.watchAttributes({
		expanded: false,
		minimized: false,
		transitioning: false,
	});
	#scrollTop = 0;

	#handleScroll = () => {
		let scrollTop = document.body.scrollTop;

		if (scrollTop !== this.#scrollTop) {
			this.#state.minimized = scrollTop >= this.#scrollTop;
		}

		this.#scrollTop = scrollTop;
	};

	*setupCallback() {
		document.body.addEventListener("scroll", this.#handleScroll);

		let nav = this.shadowRoot?.querySelector("nav");

		nav?.addEventListener("transitionend", (e) => {
			if (e.target === nav) {
				this.#state.transitioning = false;
			}
		});

		let toggle = this.shadowRoot?.querySelector("button");

		toggle?.addEventListener("click", () => {
			this.#state.minimized = false;
			this.#state.expanded = !this.#state.expanded;
			this.#state.transitioning = true;
		});

		yield () => {
			toggle?.setAttribute("aria-pressed", `${this.#state.expanded}`);
		};

		let icon = this.shadowRoot?.querySelector("svg");

		yield () => {
			icon?.setAttribute(
				"viewBox",
				`${this.#state.expanded ? "0" : "16"} 0 16 16`
			);
		};
	}

	teardownCallback() {
		document.body.removeEventListener("scroll", this.#handleScroll);
	}
}

customElements.define("page-nav", PageNav);
