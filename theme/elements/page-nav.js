import {Element, watch} from "element";

export class PageNav extends Element {
	static get observedAttributes() {
		return ["expanded", "minimized", "transitioning"];
	}

	#state = watch({
		expanded: this.hasAttribute("expanded"),
		minimized: this.hasAttribute("minimized"),
		transitioning: this.hasAttribute("transitioning"),
	});
	#nav = this.shadowRoot?.getElementById("nav");
	#toggle = this.shadowRoot?.getElementById("toggle");
	#icon = this.shadowRoot?.getElementById("icon");
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

		yield () => {
			this.toggleAttribute("expanded", this.#state.expanded);
		};

		yield () => {
			this.toggleAttribute("minimized", this.#state.minimized);
		};

		yield () => {
			this.toggleAttribute("transitioning", this.#state.transitioning);
		};

		this.#nav?.addEventListener("transitionend", (e) => {
			if (e.target === this.#nav) {
				this.#state.transitioning = false;
			}
		});

		this.#toggle?.addEventListener("click", () => {
			this.#state.minimized = false;
			this.#state.expanded = !this.#state.expanded;
			this.#state.transitioning = true;
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

	attributeChangedCallback(k, previous, current) {
		if (previous !== current) {
			this.#state[k] = current != null;
		}
	}
}

customElements.define("page-nav", PageNav);
