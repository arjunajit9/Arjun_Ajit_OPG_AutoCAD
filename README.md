# Lakshmi Thesis OPG Tool

A browser-local presentation tool supporting the OPG angulation-measurement component of the prospective MDS thesis, "Assessment of Mandibular Third Molar Position as a Risk Indicator for Pericoronitis." The examiner marks the long axes for FDI teeth 38 and 48 and the tool calculates the Winter position category.

> MDS thesis presentation demonstration only — not for diagnosis or treatment decisions. No position is pre-classified: results are calculated from examiner-positioned geometry. Pericoronitis is assessed separately through the study's clinical protocol.

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
