import restart from 'vite-plugin-restart'
import glsl from 'vite-plugin-glsl'
import { defineConfig } from 'vite'

const repoName = 'portal-scene'

export default defineConfig(({ command }) => ({
    root: 'src/',
    publicDir: '../static/',
    base: command === 'build' ? `/${repoName}/` : '/',
    build: {
        outDir: '../docs',
        emptyOutDir: true
    },
    server:
    {
        host: true, // Open to local network and display URL
        open: !('SANDBOX_URL' in process.env || 'CODESANDBOX_HOST' in process.env) // Open if it's not a CodeSandbox
    },
    plugins:
        [
            restart({ restart: ['../static/**',] }), // Restart server on static file change
            glsl() // Handle shader files
        ]
}))