class PageNav extends HTMLElement {
  static {
    let previousY = 0,
      scrollCalcFired = false,
      body = document.body;

    body.addEventListener("scroll", () => {
      if (!scrollCalcFired) {
        scrollCalcFired = true;

        window.requestAnimationFrame(() => {
          scrollCalcFired = false;

          let currentY = body.scrollTop;

          if (currentY !== previousY) {
            body.style.setProperty(
              "--scrolling-down",
              currentY < previousY ? "0" : "1"
            );
          }

          previousY = currentY;
        });
      }
    });
  }

  #state = new Proxy(
    {open: false},
    {
      set: (target, key, val) => {
        let update = target[key] !== val;

        target[key] = val;

        if (update) this.#update();

        return true;
      },
    }
  );

  #refs = new Proxy(
    {},
    {
      get: (_, key) => {
        return this.shadowRoot.getElementById(key);
      },
    }
  );

  constructor() {
    super();

    if (!this.shadowRoot) {
      let template = this.querySelector("template"),
        shadowRoot = this.attachShadow({
          mode: "open",
        });

      shadowRoot.appendChild(template?.content?.cloneNode(true));

      template.remove();
    }

    this.#refs.toggle?.addEventListener("click", () => {
      this.#state.open = !this.#state.open;
    });

    this.#update();
  }

  #update = () => {
    let {open} = this.#state;

    this.#refs.toggle?.setAttribute("aria-pressed", String(open));

    this.#refs.toggleIcon?.setAttribute("viewBox", `0 ${open ? 16 : 0} 16 16`);

    this.#refs.nav.classList.toggle("open", open);

    this.#refs.nav.classList.toggle("closing", !open);

    if (!open) {
      this.#refs.nav.addEventListener(
        "transitionend",
        () => {
          this.#refs.nav.classList.toggle("closing", false);
        },
        {once: true}
      );
    }

    this.style.setProperty("--scrolling-down-override", open ? "0" : "");
  };
}

customElements.define("page-nav", PageNav);
