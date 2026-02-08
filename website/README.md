# Department of Predictions — Website

> Next.js 16 static-export dApp for the AIJudgeMarket protocol
> **[departmentofpredictions.com](https://departmentofpredictions.com)**

## Stack

| Technology | Version | Purpose |
|------------|---------|---------|
| Next.js | 16.1.6 | App Router, static export |
| React | 19.2.4 | UI framework |
| TypeScript | 5.x | Type safety |
| Tailwind CSS | 4.1.18 | Styling (CSS-based config via `@theme inline`) |
| wagmi | 2.19.5 | Ethereum hooks |
| viem | 2.45.1 | Ethereum client |
| ConnectKit | 1.9.1 | Wallet connection |
| ESLint | 9 | Flat config linting |

## Pages

| Page | Route | Description |
|------|-------|-------------|
| Home | `/` | Hero video, live contract stats, commit-reveal diagram, flow steps, architecture cards |
| Markets | `/markets` | Filterable market listing with status badges and court icons |
| Create | `/create` | Market creation form with court selection and sidebar guide |
| Judge | `/judge` | Judge registration with stake info, court tiles, protocol params |
| About | `/about` | Full thesis with CSS diagrams, section icons, navigation pills |

## Development

```bash
# Install dependencies
pnpm install

# Dev server (Turbopack)
pnpm dev

# Production build (uses --webpack flag for monorepo compatibility)
pnpm build

# Lint
pnpm lint
```

## Environment Variables

```bash
NEXT_PUBLIC_CONTRACT_ADDRESS=0xF7b9e8C9675d0Dbdb280A117fDf5E39fc6fb9E04
NEXT_PUBLIC_WC_PROJECT_ID=your_walletconnect_project_id
```

## Connected Chains

The website supports multi-chain interaction with the same contract address:

| Chain | RPC | Status |
|-------|-----|--------|
| Ethereum Sepolia | `https://sepolia.gateway.tenderly.co` | Active |
| ARC Testnet | `https://rpc.testnet.arc.network` | Active |
| Base Sepolia | `https://sepolia.base.org` | Planned |

Contract address is the same on all chains: `0xF7b9e8C9675d0Dbdb280A117fDf5E39fc6fb9E04`

## Design

- Pure black background (`#000`)
- Gold accent: `hsl(43 100% 50%)`
- Fonts: DM Sans (body) + JetBrains Mono (code/labels)
- Mono labels: `text-[10px] tracking-[0.25em]`
- Cards: `border-[hsl(0_0%_8%)] bg-[hsl(0_0%_2%)]`

## Key Files

```
website/
├── src/
│   ├── app/                    # App Router pages
│   │   ├── page.tsx            # Homepage
│   │   ├── markets/page.tsx    # Market listing
│   │   ├── create/page.tsx     # Market creation
│   │   ├── judge/page.tsx      # Judge registration
│   │   └── about/page.tsx      # Thesis page
│   ├── lib/
│   │   ├── contracts.ts        # Contract address, ABI, chain definitions
│   │   └── hooks.ts            # wagmi hooks for contract reads
│   └── components/
│       ├── providers/Web3Provider.tsx  # wagmi + ConnectKit setup
│       ├── Header.tsx
│       └── Footer.tsx
├── public/
│   └── skill.md                # Live skill config (fetched by OpenClaw bots)
├── postcss.config.mjs          # @tailwindcss/postcss
└── eslint.config.mjs           # ESLint 9 flat config
```

## Gotchas

- Build requires `--webpack` flag (Turbopack has a monorepo root detection bug)
- Google Fonts load via `<link>` in layout.tsx, NOT `@import` in CSS (PostCSS issue)
- ConnectKit 1.9.1 needs explicit `@wagmi/connectors@^5` alongside wagmi v2
- Tailwind v4 uses CSS-based config (`@theme inline` in globals.css), no `tailwind.config.ts`
- Never run `npx @tailwindcss/upgrade` in this monorepo (zeroes files when interrupted)

## Deploy

```bash
# Static export build
pnpm build

# Deploy to Vercel
npx vercel deploy --prod
```

## License

MIT
