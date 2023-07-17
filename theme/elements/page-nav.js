import {Element} from "element";

export class PageNav extends Element {
	static get observedAttributeDefaults() {
		return {expanded: false, minimized: false, transitioning: false};
	}

	#nav = this.shadowRoot?.getElementById("nav");
	#toggle = this.shadowRoot?.getElementById("toggle");
	#icon = this.shadowRoot?.getElementById("icon");
	#scrollTop = 0;

	#handleScroll = () => {
		let scrollTop = document.body.scrollTop;

		if (scrollTop !== this.#scrollTop) {
			this.minimized = scrollTop >= this.#scrollTop;
		}

		this.#scrollTop = scrollTop;
	};

	*setupCallback() {
		document.body.addEventListener("scroll", this.#handleScroll);

		this.addEventListener("mouseenter", () => {
			this.minimized = false;
		});

		this.#toggle?.addEventListener("click", () => {
			this.minimized = false;
			this.expanded = !this.expanded;
			this.transitioning = true;
		});

		this.#nav?.addEventListener("transitionend", (e) => {
			if (e.target === this.#nav) {
				this.transitioning = false;
			}
		});

		yield () => {
			this.#toggle?.setAttribute("aria-pressed", `${this.expanded}`);
		};

		yield () => {
			this.#icon?.setAttribute(
				"d",
				this.expanded
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
