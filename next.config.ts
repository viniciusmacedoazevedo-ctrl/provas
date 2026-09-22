import type { NextConfig } from "next";

// Em desenvolvimento dentro de um GitHub Codespace, o proxy de encaminhamento
// de portas reescreve o header `Origin` das requisições para `localhost:<porta>`
// (para compatibilidade com dev servers que só aceitam localhost), embora
// informe o domínio público real via `x-forwarded-host`. O Next.js compara
// esses dois headers como proteção contra CSRF nas Server Actions, então sem
// isso a requisição é rejeitada com "Invalid Server Actions request", mesmo o
// `x-forwarded-host` estando correto.
const origensPermitidas = [
  "*.app.github.dev",
  "*.github.dev",
  "localhost:3000",
];

const nextConfig: NextConfig = {
  allowedDevOrigins: origensPermitidas,
  experimental: {
    serverActions: {
      allowedOrigins: origensPermitidas,
    },
  },
};

export default nextConfig;
