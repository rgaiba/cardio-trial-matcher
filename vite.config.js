import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// Using './' makes all asset paths relative, so the build works regardless of
// what you name your GitHub repo (it'll live at username.github.io/<repo-name>/).
export default defineConfig({
  plugins: [react()],
  base: './',
});
