import {Element} from "element";

export class PageNav extends Element {
	#state = this.attributes({
		expanded: false,
		minimized: false,
	});

	#toggleMinimized(minimized) {
		if (this.#state.expanded) {
			return;
		}

		this.#state.minimized = minimized;
	}

	#toggleExpanded(expanded = !this.#state.expanded) {
		this.#state.minimized = false;
		this.#state.expanded = expanded;
	}

	#toggle = this.shadowRoot?.getElementById("toggle");
	#icon = this.shadowRoot?.getElementById("icon");
	#scrollTop = 0;

	#handleScroll = () => {
		let scrollTop = document.body.scrollTop;

		if (scrollTop !== this.#scrollTop) {
			this.#toggleMinimized(scrollTop >= this.#scrollTop);
		}

		this.#scrollTop = scrollTop;
	};

	*setupCallback() {
		document.body.addEventListener("scroll", this.#handleScroll);

		this.addEventListener("mouseenter", () => {
			this.#toggleMinimized(false);
		});

		this.#toggle?.addEventListener("click", () => {
			this.#toggleExpanded();
		});

		yield () => {
			this.#toggle?.setAttribute("aria-pressed", `${this.#state.expanded}`);
		};

		yield () => {
			this.#icon?.setAttribute(
				"d",
				this.#state.expanded
					? "M1 4 l3 -3 l11 11 l-3 3 z m11 -3 l3 3 l-11 11 l-3 -3 z"
					: "M1 1 l14 0 l0 3.5 l-14 0 z m0 5.25 l14 0 l0 3.5 l-14 0 z m0 5.25 l14 0 l0 3.5 l-14 0 z"
			);
		};
	}

	teardownCallback() {
		document.body.removeEventListener("scroll", this.#handleScroll);
	}
}

customElements.define("page-nav", PageNav);
