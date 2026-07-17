# Arjun Ajit — OPG Research Prototype

A personal landing page and browser-local thesis interface for comparing mesioangular and distoangular mandibular third-molar impactions (FDI 38 and 48) as risk indicators for clinically assessed pericoronitis.

> Research prototype — not for autonomous diagnosis or treatment decisions. Mock angulation classifications are not derived from the uploaded image. Pericoronitis is a clinical outcome and is not diagnosed from an OPG alone.

## Local development

Requirements: Node.js 24+ and pnpm 11+.

```bash
pnpm install
pnpm dev
```

Open `http://localhost:3000`. PostgreSQL and the future Python service are not required.

## Verification

```bash
pnpm lint
pnpm typecheck
pnpm test
pnpm test:e2e
pnpm build
```

Images are kept in IndexedDB for up to 24 hours and can be deleted from the review screen. Do not use identifiable patient information. See `docs/PRIVACY_AND_SAFETY.md` before evaluating the prototype.

## Architecture

UI code, domain contracts, validation, storage, and analysis providers are separated under `components/` and `features/opg-analysis/`. `MockOPGAnalysisProvider` is the only active provider. `RemoteMedicalModelProvider` deliberately refuses requests until a secure, clinically developed service is configured.
