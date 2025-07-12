import { serveDir } from "@std/http/file-server";

export default {
  fetch(req) {
    return serveDir(req, {
      fsRoot: "dist",
    });
  },
};
