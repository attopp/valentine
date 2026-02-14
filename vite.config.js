/* global process */
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  // Use repo-name base path on GitHub Pages (only in GitHub Actions builds).
  // Example: https://username.github.io/repo-name/
  base: process.env.GITHUB_ACTIONS
    ? `/${(process.env.GITHUB_REPOSITORY || '').split('/')[1] || ''}/`
    : '/',
  plugins: [react()],
})
