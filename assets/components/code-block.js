import {Element} from "../element.js";

class CodeBlock extends Element {
  #state = this.watch({
    hasScrollbars: false,
    wrapWhiteSpace: false,
  });

  #preRef = null;

  #toggleWrapWhiteSpace = () => {
    this.#state.wrapWhiteSpace = !this.#state.wrapWhiteSpace;

    this.#state.Scrollbars = false;
  };

  connectedCallback() {
    super.connectedCallback();

    const resizeObserver = new ResizeObserver(() => {
      this.#state.hasScrollbars =
        this.#preRef.scrollWidth > this.#preRef.clientWidth;
    });

    resizeObserver.observe(this.#preRef);
  }

  render({link, pre, code, div, span, "toggle-button": toggleButton}) {
    let lines = this.textContent.split("\n");

    return [
      ...["../common.css", "./code-block.css"].map((url) =>
        link({
          rel: "stylesheet",
          href: new URL(url, import.meta.url).pathname,
        })
      ),
      div(
        {
          class: () => (this.#state.hasScrollbars ? "wrap scrolling" : "wrap"),
        },
        (this.#preRef = pre(
          {
            class: () => {
              return this.#state.wrapWhiteSpace ? "pre wrap" : "pre";
            },
          },
          code(
            {class: "code"},
            ...lines.map((ln) =>
              span({class: "line"}, span({}, ln || " ", "\n"))
            )
          )
        )),
        toggleButton(
          {
            class: () => {
              return this.#state.hasScrollbars || this.#state.wrapWhiteSpace
                ? "toggle"
                : "toggle hidden";
            },
            pressed: () => this.#state.wrapWhiteSpace,
            onclick: this.#toggleWrapWhiteSpace,
          },
          "Wrap"
        )
      ),
    ];
  }
}

customElements.define("code-block", CodeBlock);
