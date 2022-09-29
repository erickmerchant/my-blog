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

  render() {
    let lines = Array.from(this.querySelectorAll("code"));

    return (
      <>
        {["../common.css", "./code-block.css"].map((url) => (
          <link
            rel="stylesheet"
            href={new URL(url, import.meta.url).pathname}
          />
        ))}
        <div class="root">
          <div
            class={() => {
              let classes = ["inner"];

              if (this.#state.hasScrollbars) classes.push("scrolling");

              if (this.#state.wrapWhiteSpace) classes.push("wrap");

              return classes.join(" ");
            }}
          >
            {
              (this.#preRef = (
                <pre>
                  <div class="lines">
                    {lines.map((ln) => (
                      <div class="line">{ln.cloneNode(true)}</div>
                    ))}
                  </div>
                </pre>
              ))
            }
            <toggle-button
              class={() => {
                return this.#state.hasScrollbars || this.#state.wrapWhiteSpace
                  ? "toggle"
                  : "toggle hidden";
              }}
              pressed={() => this.#state.wrapWhiteSpace}
              onclick={this.#toggleWrapWhiteSpace}
            >
              Wrap
            </toggle-button>
          </div>
        </div>
      </>
    );
  }
}

customElements.define("code-block", CodeBlock);
