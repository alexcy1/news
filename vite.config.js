
// import { resolve } from "path";
// import { defineConfig } from "vite";

// export default defineConfig({
//   root: "src/",
//   base: "/",
//   server: {
//     proxy: {
//       '/api': {
//         // target: 'https://ellux.onrender.com',
//         target: 'http://localhost:3000',
//         changeOrigin: true,
//         secure: false,
//         rewrite: (path) => path.replace(/^\/api/, ''),
//         ws: true,
//         configure: (proxy, options) => {
//           proxy.on('proxyReq', (proxyReq) => {
//             proxyReq.setHeader('Origin', 'http://localhost:5173');
//           });
//         }
//       }
//     }
//   },
//   build: {
//     outDir: "../dist",
//     rollupOptions: {
//       input: {
//         main: resolve(__dirname, "src/index.html"),
//         about: resolve(__dirname, "src/about.html"),
//         signin: resolve(__dirname, "src/signin.html"),
//         signup: resolve(__dirname, "src/signup.html"),
//         forgot_password: resolve(__dirname, "src/forgot-password.html"),
//         reset_password: resolve(__dirname, "src/reset-password.html"),
//         reset_password_verification: resolve(__dirname, "src/reset-password-verification.html"),
//         resend_verification: resolve(__dirname, "src/resend_verification.html"),
//         verify_email: resolve(__dirname, "src/verify_email.html"),
//         users: resolve(__dirname, "src/users/index.html"),
//         news_listing: resolve(__dirname, "src/news_listing/index.html"),
//       },
//     },
//   },
// });






















import { resolve } from "path";
import { defineConfig } from "vite";

export default defineConfig({
  root: "src/",
  base: "/",
  server: {
    proxy: {
      '/api': {
        target: 'https://ellux.onrender.com', // Use your Render backend URL
        changeOrigin: true,
        secure: true, // Important: Use 'true' for HTTPS
        rewrite: (path) => path.replace(/^\/api/, ''),
        ws: true,
        configure: (proxy, options) => {
          proxy.on('proxyReq', (proxyReq) => {
            proxyReq.setHeader('Origin', 'http://localhost:5173');
          });
        }
      }
    }
  },
  build: {
    outDir: "../dist",
    rollupOptions: {
      input: {
        main: resolve(__dirname, "src/index.html"),
        about: resolve(__dirname, "src/about.html"),
        services: resolve(__dirname, "src/services.html"),
        signin: resolve(__dirname, "src/signin.html"),
        signup: resolve(__dirname, "src/signup.html"),
        forgot_password: resolve(__dirname, "src/forgot-password.html"),
        reset_password: resolve(__dirname, "src/reset-password.html"),
        reset_password_verification: resolve(__dirname, "src/reset-password-verification.html"),
        verify_email: resolve(__dirname, "src/verify-email.html"),
        profile: resolve(__dirname, "src/profile.html"),
        update_profile: resolve(__dirname, "src/update-profile.html"),
        favourites: resolve(__dirname, "src/favourites.html"),
      },
    },
  },
});











