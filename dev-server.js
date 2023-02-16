import {serve} from "https://deno.land/std/http/mod.ts";
import {concat} from "https://deno.land/std/bytes/mod.ts";
import init, {HTMLRewriter} from "https://deno.land/x/lol_html@0.0.6/mod.ts";
import wasm from "https://deno.land/x/lol_html@0.0.6/wasm.js";
import {resolve} from "https://deno.land/std@0.177.0/path/mod.ts";

await init(wasm());

let fileService = "http://0.0.0.0:3000";

let reqHandler = async (req) => {
  let path = new URL(req.url).pathname;

  if (path === "/dev-client.js") {
    let file;
    try {
      file = await Deno.open("." + path, {read: true});
    } catch {
      return new Response("404 Not Found", {status: 404});
    }

    let readableStream = file.readable;

    return new Response(readableStream, {
      headers: {
        "content-type": "application/javascript",
      },
    });
  }

  if (path === "/dev-changes") {
    let watcher = Deno.watchFs("./theme");
    let enc = new TextEncoder();

    let body = new ReadableStream({
      async start(controller) {
        controller.enqueue(enc.encode(`\n\n`));

        let themeDir = resolve("./theme");

        for await (let e of watcher) {
          let data = JSON.stringify({
            hrefs: e.paths
              .filter((p) => p.endsWith(".css"))
              .map((p) => p.substring(themeDir.length)),
          });
          controller.enqueue(enc.encode(`data: ${data}\n\n`));
        }
      },
      cancel() {
        watcher.close();
      },
    });

    return new Response(body, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
      },
    });
  }

  let proxyRes = await fetch(fileService + path);
  let headers = new Headers();
  let contentType;
  let body = proxyRes.body;

  for (let [name, value] of proxyRes.headers) {
    if (name === "content-security-policy") continue;

    if (name === "content-type") {
      contentType = value;
    }

    headers.set(name, value);
  }

  if (contentType.startsWith("text/html")) {
    body = await proxyRes.text();

    let enc = new TextEncoder();
    let dec = new TextDecoder();
    let chunks = [];

    let rewriter = new HTMLRewriter("utf8", (chunk) => {
      chunks.push(chunk);
    });

    rewriter.on("link[rel=stylesheet]", {
      element(el) {
        el.setAttribute("is", "dev-stylesheet");

        el.after('<script type="module" src="/dev-client.js"></script>', {
          html: true,
        });
      },
    });

    rewriter.write(enc.encode(body));

    try {
      rewriter.end();
      body = dec.decode(concat(...chunks));
    } finally {
      rewriter.free();
    }
  }

  return new Response(body, {
    status: proxyRes.status,
    headers,
  });
};

serve(reqHandler, {port: 4000});
