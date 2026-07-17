# Architecture

## Phase 1

The Next.js App Router application runs without a database or model service. The selected JPEG/PNG is validated and stored temporarily in browser IndexedDB. Only after explicit de-identification confirmation does the UI call `OPGAnalysisProvider`. The mock provider returns a Zod-validated, deterministic demonstration result.

The current study scope is deliberately narrow: mandibular third molars 38 and 48, with mesioangular or distoangular exposure classification. Pericoronitis outcome data must come from a separately defined clinical examination and is represented as `not_assessed_from_opg` in the imaging result.

The analysis route loads its study by URL identifier from the same browser. Missing, expired, or deleted studies fail safely. Reviews and editable report drafts are stored locally. Images never enter a URL, React server payload, log, or Phase 1 server endpoint.

## Provider replacement

`OPGAnalysisProvider.analyse(input)` is the application boundary. A future remote adapter must authenticate to a private FastAPI service, send a de-identified image through encrypted transport, enforce timeouts and size limits, validate the response, map service errors to safe user messages, and record model provenance. The frontend consumes the same result contract.

## Measurements

Results can include normalized bounding boxes, tooth/reference axes, angles, uncertainty, reference method, classification method, and model probability. Phase 1 values are explicitly simulated. A production method must define landmarks, angle normalization, tooth-numbering convention, thresholds, and uncertainty with specialist governance and versioning.

## Future data layer

The Prisma schema illustrates de-identified studies, encrypted object references, immutable analyses/findings, separate human reviews, draft reports, and audit events. Production authorization must be enforced server-side for every resource; the schema is not used in Phase 1.
