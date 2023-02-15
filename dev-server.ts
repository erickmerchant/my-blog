import { serve } from "https://deno.land/std/http/mod.ts";

const fileService = "http://0.0.0.0:3000";

async function reqHandler(req: Request) {
  const path = new URL(req.url).pathname;
  const proxyRes = await fetch(fileService + path);
  const headers = new Headers();

  for (const [name, value] of proxyRes.headers) {
    headers.set(name, value);
  }

  /* if it's html parse through it and replace all cases of link[rel=stylesheet] with a script[type=module]. Name the module dev-client.js. It will use constructed stylesheets to inject the css into the page (or custom element), and have an open communication (using sse) with this server to be notified when there is a change and update the css */

  return new Response(proxyRes.body, {
    status: proxyRes.status,
    headers,
  });
}

serve(reqHandler, { port: 4000 });
