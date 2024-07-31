export class TopBar extends HTMLElement {
	#scrollTop = 0;

	#onScroll = () => {
		let scrollTop = document.body.scrollTop;

		if (scrollTop !== this.#scrollTop) {
			let scrollingDown = scrollTop >= this.#scrollTop;

			this.style.setProperty("--scrolling-down", scrollingDown ? 1 : 0);
		}

		this.#scrollTop = scrollTop;
	};

	connectedCallback() {
		document.body.addEventListener("scroll", this.#onScroll);
	}

	disconnectedCallback() {
		document.body.removeEventListener("scroll", this.#onScroll);
	}
}

customElements.define("top-bar", TopBar);
