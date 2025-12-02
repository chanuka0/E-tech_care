// // import { defineConfig } from 'vite'
// // import react from '@vitejs/plugin-react'

// // // https://vitejs.dev/config/
// // export default defineConfig({
// //   plugins: [react()],
// //   server: {
// //     port: 5173,
// //     proxy: {
// //       '/api': {
// //         target: 'http://localhost:8080',
// //         changeOrigin: true,
// //       }
// //     }
// //   }
// // })


// // import { defineConfig } from 'vite'
// // import react from '@vitejs/plugin-react'

// // // https://vitejs.dev/config/
// // export default defineConfig({
// //   plugins: [react()],
// //   server: {
// //     port: 5173,
// //     hmr: false, // Disable HMR temporarily
// //     proxy: {
// //       '/api': {
// //         target: 'http://localhost:8080',
// //         changeOrigin: true,
// //       }
// //     }
// //   }
// // })

// import { defineConfig } from 'vite'
// import react from '@vitejs/plugin-react'

// // https://vitejs.dev/config/
// export default defineConfig({
//   plugins: [react()],
//   define: {
//     global: 'globalThis', // This fixes global reference issues
//   },
//   server: {
//     port: 5173,
//     hmr: true, // Keep HMR enabled
//     headers: {
//       // Add CSP headers to allow eval (temporary fix for development)
//       'Content-Security-Policy': [
//         "default-src 'self'",
//         "connect-src 'self' ws://localhost:5173 wss://localhost:5173 http://localhost:8080",
//         "script-src 'self' 'unsafe-inline' 'unsafe-eval'", // Allow unsafe-eval for development
//         "style-src 'self' 'unsafe-inline'",
//         "img-src 'self' data: blob:",
//         "font-src 'self'",
//         "worker-src 'self' blob:",
//       ].join('; ')
//     },
//     proxy: {
//       '/api': {
//         target: 'http://localhost:8080',
//         changeOrigin: true,
//       },
//       '/ws': { // Add WebSocket proxy
//         target: 'http://localhost:8080',
//         ws: true,
//         changeOrigin: true,
//       }
//     }
//   },
//   build: {
//     rollupOptions: {
//       external: [], // Ensure no external dependencies cause issues
//     },
//     sourcemap: false, // Disable source maps if not needed
//     commonjsOptions: {
//       transformMixedEsModules: true,
//     }
//   },
//   // Fix for buffer and other Node.js polyfills
//   resolve: {
//     alias: {
//       buffer: 'buffer',
//       process: 'process/browser',
//       util: 'util',
//     }
//   },
//   optimizeDeps: {
//     include: ['buffer', 'process'],
//     esbuildOptions: {
//       // Define global replacements
//       define: {
//         global: 'globalThis',
//       }
//     }
//   }
// })

// import { defineConfig } from 'vite'
// import react from '@vitejs/plugin-react'

// // https://vitejs.dev/config/
// export default defineConfig({
//   plugins: [react()],
//   define: {
//     global: 'globalThis', // This fixes global reference issues
//   },
//   server: {
//     port: 5173,
//     hmr: true, // Keep HMR enabled
//     headers: {
//       // Add CSP headers to allow eval (temporary fix for development)
//       'Content-Security-Policy': [
//         "default-src 'self'",
//         "connect-src 'self' ws://localhost:5173 wss://localhost:5173 http://localhost:8080",
//         "script-src 'self' 'unsafe-inline' 'unsafe-eval'", // Allow unsafe-eval for development
//         "style-src 'self' 'unsafe-inline'",
//         "img-src 'self' data: blob:",
//         "font-src 'self'",
//         "worker-src 'self' blob:",
//       ].join('; ')
//     },
//     proxy: {
//       '/api': {
//         target: 'http://localhost:8080',
//         changeOrigin: true,
//       },
//       '/ws': { // Add WebSocket proxy
//         target: 'http://localhost:8080',
//         ws: true,
//         changeOrigin: true,
//       }
//     }
//   },
//   build: {
//     rollupOptions: {
//       external: [], // Ensure no external dependencies cause issues
//     },
//     sourcemap: false, // Disable source maps if not needed
//     commonjsOptions: {
//       transformMixedEsModules: true,
//     }
//   },
//   // Fix for buffer and other Node.js polyfills
//   resolve: {
//     alias: {
//       buffer: 'buffer',
//       process: 'process/browser',
//       util: 'util',
//     }
//   },
//   optimizeDeps: {
//     include: ['buffer', 'process'],
//     esbuildOptions: {
//       // Define global replacements
//       define: {
//         global: 'globalThis',
//       }
//     }
//   }
// })


import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    hmr: false, // Disable HMR temporarily
    proxy: {
      '/api': {
        target: 'http://localhost:8081',
        changeOrigin: true,
      }
    }
  }
})