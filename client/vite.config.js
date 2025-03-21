import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { visualizer } from 'rollup-plugin-visualizer';
import path from 'path';

// https://vite.dev/config/
export default defineConfig({
    plugins: [react(), visualizer()],
    resolve: {
        alias: {
            '@shared': path.resolve(__dirname, '../shared')
        }
    },
    server: {
        port: 3000,
        open: true,
        proxy: {
            '/graphql': {
                target: 'http://localhost:3001',
                secure: false,
                changeOrigin: true
            }
        }
    }
})
