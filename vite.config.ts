import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";
import monkey, { cdn, util } from "vite-plugin-monkey";
import AutoImport from "unplugin-auto-import/vite";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    vue(),
    AutoImport({
      imports: [util.unimportPreset, "vue", "@vueuse/core"],
    }),
    monkey({
      entry: "src/main.ts",
      userscript: {
        author: "luminisward",
        namespace: "https://github.com/luminisward",
        match: ["*://*/*"],
      },
      build: {
        externalGlobals: {
          vue: cdn.jsdelivr("Vue", "dist/vue.global.prod.js"),
        },
      },
    }),
  ],
});
