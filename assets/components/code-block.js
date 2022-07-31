import {Element} from "../element.js";

class CodeBlock extends Element {
  render() {
    let lines = this.textContent.split("\n");

    return (
      <>
        <link
          rel="stylesheet"
          href={new URL("./code-block.css", import.meta.url).pathname}
        />
        <pre class="pre">
          <code class="code">
            {lines.map((ln) => (
              <span class="line">
                <span>{`${ln || " "}\n`}</span>
              </span>
            ))}
          </code>
        </pre>
      </>
    );
  }
}

customElements.define("code-block", CodeBlock);
