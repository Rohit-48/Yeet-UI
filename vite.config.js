import { defineConfig } from "vite";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

// <!-- @include nav --> pulls in partials/nav.html (shared across every page)
const partials = () => ({
  name: "html-partials",
  transformIndexHtml: {
    order: "pre",
    handler: (html) =>
      html.replace(/<!--\s*@include\s+([\w-]+)\s*-->/g, (_, name) =>
        readFileSync(resolve(import.meta.dirname, "partials", `${name}.html`), "utf8")),
  },
});

export default defineConfig({
  plugins: [partials()],
  server: { watch: { paths: ["partials/**"] } },
  build: {
    rollupOptions: {
      input: {
        home: resolve(import.meta.dirname, "index.html"),
        components: resolve(import.meta.dirname, "components.html"),
        docs: resolve(import.meta.dirname, "docs.html"),
        tokens: resolve(import.meta.dirname, "tokens.html"),
        usage: resolve(import.meta.dirname, "usage.html"),
      },
    },
  },
});
