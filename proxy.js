const express = require("express");
const { createProxyMiddleware } = require("http-proxy-middleware");

const app = express();

app.use(
  "/backend/api",
  createProxyMiddleware({
    target: "http://avimexintranet.com", // Fuerza HTTP
    changeOrigin: true,
    secure: false, // Evita problemas con SSL
    onProxyReq: (proxyReq) => {
      proxyReq.setHeader("X-Forwarded-Proto", "http");
    },
  })
);

app.listen(3000, () => {
  console.log("Proxy corriendo en http://localhost:3000");
});Ç