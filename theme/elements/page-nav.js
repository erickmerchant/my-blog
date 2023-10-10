import {Element} from "element";

export class PageNav extends Element {
	#scrollTop = 0;
	#sheet;

	#handleScroll = () => {
		let scrollTop = document.body.scrollTop;

		if (scrollTop !== this.#scrollTop) {
			let scrollingDown = scrollTop >= this.#scrollTop;

			this.#sheet.replaceSync(
				`:host { --scrolling-down: ${scrollingDown ? 1 : 0}; }`
			);
		}

		this.#scrollTop = scrollTop;
	};

	connectedCallback() {
		document.body.addEventListener("scroll", this.#handleScroll);

		let root = this.shadowRoot.getRootNode();

		this.#sheet = new CSSStyleSheet({});

		this.#sheet.replaceSync("");

		root.adoptedStyleSheets = [...root.adoptedStyleSheets, this.#sheet];
	}

	disconnectedCallback() {
		document.body.removeEventListener("scroll", this.#handleScroll);
	}
}

customElements.define("page-nav", PageNav);
