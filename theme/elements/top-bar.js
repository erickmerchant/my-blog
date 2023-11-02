export class TopBar extends HTMLElement {
	#scrollTop = 0;

	#handleScroll = () => {
		let scrollTop = document.body.scrollTop;

		if (scrollTop !== this.#scrollTop) {
			let scrollingDown = scrollTop >= this.#scrollTop;

			this.style.setProperty("--scrolling-down", scrollingDown ? 1 : 0);
		}

		this.#scrollTop = scrollTop;
	};

	connectedCallback() {
		document.body.addEventListener("scroll", this.#handleScroll);
	}

	disconnectedCallback() {
		document.body.removeEventListener("scroll", this.#handleScroll);
	}
}

customElements.define("top-bar", TopBar);
