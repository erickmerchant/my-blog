import {Element} from "element";

export class PageNav extends Element {
	#state = this.watchAttributes({
		minimized: false,
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
	}

	teardownCallback() {
		document.body.removeEventListener("scroll", this.#handleScroll);
	}
}

customElements.define("page-nav", PageNav);
