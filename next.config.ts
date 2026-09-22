import type { NextConfig } from "next";

// Em desenvolvimento dentro de um GitHub Codespace, o navegador acessa a app
// por um domínio público encaminhado (https://<nome>-<porta>.app.github.dev),
// diferente do host interno em que o servidor Next.js roda (localhost:3000).
// Sem isso, o Next rejeita a origem por padrão (proteção contra CSRF) e as
// Server Actions falham com "Invalid Server Actions request".
const origensCodespaces = ["*.app.github.dev", "*.github.dev"];

const nextConfig: NextConfig = {
  allowedDevOrigins: origensCodespaces,
  experimental: {
    serverActions: {
      allowedOrigins: origensCodespaces,
    },
  },
};

export default nextConfig;
