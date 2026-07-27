import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import fs from 'fs'
import path from 'path'

// Check if local UI kit exists for development alias
const localUiKitPath = path.resolve(__dirname, '../../../../ds-uikit/src');
const useLocalUiKit = fs.existsSync(localUiKitPath);

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: useLocalUiKit ? {
      '@digital-suite/ui-kit': localUiKitPath
    } : {}
  }
})
