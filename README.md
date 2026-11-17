# Nuxt Minimal Starter

Look at the [Nuxt documentation](https://nuxt.com/docs/getting-started/introduction) to learn more.

## Setup

Make sure to install dependencies:

```bash
# npm
npm install

# pnpm
pnpm install

# yarn
yarn install

# bun
bun install
```

## Development Server

Start the development server on `http://localhost:3000`:

```bash
# npm
npm run dev

# pnpm
pnpm dev

# yarn
yarn dev

# bun
bun run dev
```

## Production

Build the application for production:

```bash
# npm
npm run build

# pnpm
pnpm build

# yarn
yarn build

# bun
bun run build
```

Locally preview production build:

```bash
# npm
npm run preview

# pnpm
pnpm preview

# yarn
yarn preview

# bun
bun run preview
```

Check out the [deployment documentation](https://nuxt.com/docs/getting-started/deployment) for more information.

## Deploy beta (QA)
- Prod: rama `master` → https://clientes.probusiness.pe (API de prod).
- Beta: rama `qa` → https://qa--nimble-gumption-e62d9f.netlify.app. Los branch deploys usan `NUXT_API_BASE_URL=https://qa-intranetback.probusiness.pe` (variable de Netlify con contexto «branch-deploy»).
- Formulario T-T de Pago a Proveedor: `/pago-proveedor/formulario-tt/{token}` (vive en `qa`; pasa a prod con el PR de qa → master). El back arma el link con `APP_URL_CLIENTES` (prod: clientes.probusiness.pe; QA: el beta de arriba).
