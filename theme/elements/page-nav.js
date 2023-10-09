import {Element} from "element";

export class PageNav extends Element {
	#state = this.watchAttributes({
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
	}

	teardownCallback() {
		document.body.removeEventListener("scroll", this.#handleScroll);
	}
}

customElements.define("page-nav", PageNav);
