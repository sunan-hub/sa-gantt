import { defineConfig } from "umi";

export default defineConfig({
  routes: [
    { path: "/home", component: "index.tsx" },
  ],
  npmClient: 'yarn',
});
