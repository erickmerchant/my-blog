import {Element} from "../element.js";

class CodeBlock extends Element {
  render() {
    let lines = this.textContent.split("\n");

    return (
      <>
        <link
          rel="stylesheet"
          href={new URL("../common.css", import.meta.url).pathname}
        />
        <link
          rel="stylesheet"
          href={new URL("./code-block.css", import.meta.url).pathname}
        />
        <pre className="pre">
          <code className="code">
            {lines.map((ln) => (
              <span className="line">
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
