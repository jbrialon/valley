import restart from "vite-plugin-restart";

export default {
  root: "src/",
  publicDir: "../static/",
  envDir: "../",
  base: "./",
  server: {
    host: true,
    open: false,
  },
  build: {
    outDir: "../dist",
    emptyOutDir: true,
    sourcemap: true,
  },
  plugins: [restart({ restart: ["../static/**"] })],
};
