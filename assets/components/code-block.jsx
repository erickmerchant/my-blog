import {Element} from "../element.js";

class CodeBlock extends Element {
  #preRef = null;

  #state = this.watch({
    hasScrollbars: false,
    wrapWhiteSpace: false,
  });

  #toggleWrapWhiteSpace = () => {
    this.#state.wrapWhiteSpace = !this.#state.wrapWhiteSpace;

    this.#state.hasScrollbars = false;
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
    let lines = this.textContent.trim().split("\n");

    return (
      <>
        {["../common.css", "./code-block.css"].map((url) => (
          <link rel="stylesheet" href={new URL(url, import.meta.url).href} />
        ))}
        <div class="root">
          <div
            class={this.formula(() =>
              this.#state.wrapWhiteSpace ? "pre-wrap" : "pre"
            )}
          >
            {
              (this.#preRef = (
                <pre>
                  <div class="lines">
                    {lines.map((ln) => (
                      <div class="line">
                        <code>{ln}</code>
                      </div>
                    ))}
                  </div>
                </pre>
              ))
            }
            <toggle-button
              class={this.formula(() => {
                return this.#state.hasScrollbars || this.#state.wrapWhiteSpace
                  ? "toggle"
                  : "toggle--hidden";
              })}
              pressed={this.formula(() => this.#state.wrapWhiteSpace)}
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
