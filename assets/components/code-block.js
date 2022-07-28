import {Element} from "../element.js";

class CodeBlock extends Element {
  render() {
    let lines = this.textContent.split("\n");

    return (
      <>
        {super.render()}
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
