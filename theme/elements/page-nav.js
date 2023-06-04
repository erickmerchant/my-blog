import {Element} from "../element.js";

export class PageNav extends Element {
	#state = this.attributes({
		expanded: false,
		minimized: false,
	});
	#scrollTop = 0;
	#transitioning = false;

	#handleScroll = () => {
		let scrollTop = document.body.scrollTop;

		if (scrollTop !== this.#scrollTop && !this.#transitioning) {
			this.#state.minimized = scrollTop >= this.#scrollTop;
		}

		this.#scrollTop = scrollTop;
	};

	*setupCallback() {
		document.body.addEventListener("scroll", this.#handleScroll);

		this.addEventListener("mouseenter", () => {
			this.#state.minimized = false;
		});

		this.refs.nav?.addEventListener("transitionstart", () => {
			this.#transitioning = true;
		});

		this.refs.nav?.addEventListener("transitionend", () => {
			this.#transitioning = false;
		});

		this.refs.toggle?.addEventListener("click", () => {
			this.#state.expanded = !this.#state.expanded;
			this.#state.minimized = false;
		});

		yield () => {
			this.refs.toggle?.setAttribute("aria-pressed", `${this.#state.expanded}`);
		};

		yield () => {
			this.refs.icon?.setAttribute(
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
