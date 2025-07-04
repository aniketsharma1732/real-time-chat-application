import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// Use GitHub-specific base only when building for production and deploying to GitHub Pages
const isGitHubPages = process.env.GITHUB_PAGES === 'true';

export default defineConfig({
  plugins: [react()],
  base: isGitHubPages ? '/real-time-chat-application/' : '/',
});
