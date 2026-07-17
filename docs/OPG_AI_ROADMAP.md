# OPG AI Roadmap

No medical model is trained or represented as available in Phase 1.

A future service may securely receive a de-identified image, validate/decode it, remove or flag metadata, assess quality, normalize acquisition variation, detect teeth/anatomical regions, assign a configured numbering convention, detect only supported findings, estimate clinically defined angles, calibrate probabilities, and return versioned findings with normalized annotations. Input images must then be deleted under a configured and auditable retention policy.

The FastAPI service should expose health and version endpoints plus an authenticated inference endpoint. It needs request limits, malware/decode defenses, structured failures, no patient data in logs, reproducible preprocessing, model registry integration, monitoring for drift, and rollback capability.

General-purpose vision-language models must not be presented as validated dental diagnostic systems. Advancement from `mock` to `research`, and later `validated`, requires dataset governance, external evaluation, human-factors testing, clinical approval, security review, and applicable regulatory review.
