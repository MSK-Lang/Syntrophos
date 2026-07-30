# Contributing to Syntrophos

Syntrophos is an AI operating system built around a persistent, user-owned knowledge base. It connects a user's knowledge, tools, and AI while keeping permanent knowledge transparent, editable, and portable. The project is in early development: prefer small, reversible, well-documented steps over premature platform building.

This is the operating guide for human and AI contributors. Follow it for every change unless a more specific `AGENTS.md` exists in the directory being changed.

## Project overview

Syntrophos is not a chat-history product. Its enduring value is memory: capturing, connecting, retrieving, and improving a user's knowledge over time. The user's Obsidian vault is the canonical source of truth for long-term memory. Syntrophos may index, enrich, and help update that vault, but must not trap important knowledge in opaque or proprietary storage.

The intended architecture has six conceptual layers:

1. User interface
2. Frontend
3. Backend API and orchestration
4. Memory engine
5. AI engine
6. Knowledge and tool integrations

Keep these responsibilities distinct even when an early implementation is small.

## Repository structure

```text
apps/
  api/        Backend API service
  web/        Web client (reserved)
  desktop/    Desktop client (reserved)
packages/
  ai/         AI integrations and orchestration
  memory/     Memory models, retrieval, and storage abstractions
  obsidian/   Obsidian and vault integration
  shared/     Stable cross-package types and utilities
docs/         Product, architecture, and decision documentation
scripts/      Repository automation
examples/     Small, focused usage examples
.github/      GitHub configuration
```

Do not place reusable domain logic in `apps/`. Do not turn `shared/` into a dumping ground. Add a new package only when it has a clear, durable ownership boundary and at least one expected consumer.

## Documentation first policy

`docs/` is the source of truth for product intent, architecture, memory behavior, and accepted decisions. Read the relevant documents before proposing or implementing a change:

- `Home.md` for navigation and project status
- `Vision.md` and `Principles.md` for product intent and non-negotiable values
- `Roadmap.md` and `Features.md` for scope and sequencing
- `Architecture.md` for system boundaries and data flow
- `Memory.md` for the memory model and Obsidian-first requirements
- `Database.md` for provisional data-model direction
- `Decisions.md` for the decision record format and accepted choices

The root `README.md` is the repository entry point and index. Documentation may be incomplete or provisional; do not silently invent product policy to fill a gap. State assumptions in the pull request or request a decision when an assumption affects product behavior, persistence, privacy, or a package boundary.

### Documentation workflow

1. Read the relevant documentation before changing code or structure.
2. Confirm that the proposed work agrees with it.
3. Update the affected document in the same change when behavior, architecture, scope, or a public contract changes.
4. Record consequential, durable decisions in `docs/Decisions.md` using its existing Date / Decision / Reason / Alternatives / Status format.
5. Keep internal Markdown links valid after moving files. Do not rewrite unrelated documentation for style.

## Engineering philosophy

- Protect user ownership, control, and portability.
- Prefer clear Markdown-backed knowledge over hidden state.
- Make memory explainable: users should be able to understand where it came from, why it was retrieved, and how it changed.
- Use composition and explicit interfaces rather than inheritance, global state, or tightly coupled abstractions.
- Favor simple, readable code over clever generalization.
- Build the smallest complete change that satisfies the documented need.
- Make side effects explicit, bounded, observable, and reversible where practical.
- Keep business and domain logic independent of UI framework code.
- Treat automation and AI output as assistive; the user remains in control of consequential actions.

## Package responsibilities and boundaries

### `packages/obsidian`

Own vault discovery, Markdown reading and writing, links, metadata handling, and synchronization contracts. It must preserve user content and surface conflicts rather than silently overwriting user edits.

### `packages/memory`

Own memory-domain concepts, lifecycle rules, retrieval contracts, provenance, and explainability. Long-term-memory behavior must remain compatible with Markdown in the user's vault. Avoid embedding vendor SDKs or UI concerns here.

### `packages/ai`

Own model-provider adapters, prompting/orchestration boundaries, reasoning workflows, and tool-call coordination. Keep provider-specific details behind adapters. AI behavior must consume documented memory contracts rather than reach directly into a vault or UI state.

### `packages/shared`

Own only small, stable contracts used by multiple packages: types, schemas, errors, and narrowly reusable utilities. A type used by one package belongs in that package. `shared` must not import from application packages.

### `apps/web` and `apps/desktop`

Own composition, presentation, user interaction, and platform-specific integration. They may depend on packages; packages must never depend on applications. UI components should delegate business decisions, synchronization, and retrieval logic to domain services.

## Architecture and dependency rules

- Dependency direction is inward: apps → domain packages; integration/adapters → domain contracts. Never reverse this direction.
- Prefer dependency injection or explicit constructor/function parameters for external services, clocks, storage, model clients, and file systems.
- Avoid circular dependencies. Extract a stable contract only when the relationship is genuinely shared.
- Do not introduce a framework, package manager, build system, database, ORM, cloud service, or dependency without a documented need and an explicit decision.
- Avoid broad cross-package imports and barrel files that hide dependency edges. Import from a package's intended public API.
- Keep persistence separate from domain rules. Derived indexes, embeddings, and graphs may accelerate retrieval but must not become the sole copy of permanent user knowledge.
- Preserve source, timestamps, references, and transformation history for durable memory where feasible.

## TypeScript and coding standards

No implementation stack has been selected. When TypeScript is introduced, use these defaults unless a later documented decision supersedes them:

- Enable strict TypeScript settings; do not bypass errors with `any`, broad casts, or suppression comments without a narrow, documented reason.
- Prefer `unknown` at untrusted boundaries and validate/narrow it before use.
- Model domains with explicit types and discriminated unions. Make impossible states difficult to represent.
- Use `type` for object shapes and unions; use `interface` only where declaration merging or an intentionally extendable contract is needed.
- Prefer immutable data (`const`, readonly inputs/outputs) and pure functions for domain transformations.
- Name booleans as predicates (`isSynced`, `hasConflict`), use nouns for data, and verbs for actions. Avoid unclear abbreviations.
- Use `camelCase` for values and functions, `PascalCase` for types/classes/components, and kebab-case for file names unless the selected framework establishes a documented convention.
- One module should have one coherent purpose. Place tests next to the unit or in a clearly mirrored test structure once a testing convention is established.
- Return or throw typed, actionable errors; do not swallow failures, especially around vault writes, synchronization, and tool execution.

Do not add code merely to create a structure. Empty directories, a concise README, or a documented interface are preferable to speculative implementations.

## Testing expectations

Every behavior change needs proportionate verification. Before a test runner exists, document the exact manual checks performed. Once testing infrastructure is chosen:

- Unit-test pure domain logic, parsing, retrieval ranking rules, conflict handling, and transformations.
- Integration-test boundaries that read or write vault content, call tools, or persist derived state using isolated fixtures.
- Exercise failure paths: malformed Markdown, missing files, interrupted synchronization, duplicate events, model/tool failures, and user-edit conflicts.
- Assert externally visible behavior and invariants, not implementation details.
- Add regression coverage for fixed defects.

Tests must not write to a real user vault, use real credentials, or depend on nondeterministic remote AI responses. Inject fakes or use recorded, sanitized fixtures at boundaries.

## Performance and scalability

Design for vaults that grow across years without assuming that every early feature needs distributed infrastructure.

- Avoid full-vault scans and full re-embedding on every small change; prefer incremental, observable work.
- Keep UI paths responsive and move expensive indexing, parsing, and model work off interactive paths where possible.
- Paginate, batch, cache, and invalidate deliberately; document cache ownership and invalidation rules.
- Measure before optimizing. Add instrumentation around costly or user-visible operations before adding complex caching or queues.
- Preserve deterministic behavior for the same input and vault state where practical.
- Make background work resumable and idempotent so retries cannot corrupt memory or duplicate writes.

## Security and privacy

- Treat vault contents, prompts, retrieved memories, tool inputs, tokens, and model responses as sensitive user data.
- Minimize collection and transmission. Never send vault data to an external service without an explicit product requirement and user-aware control.
- Do not log secrets, raw private note content, access tokens, or full prompts by default.
- Keep credentials out of source control, documentation examples, fixtures, and error messages.
- Validate untrusted input, paths, tool arguments, and Markdown-derived metadata at boundaries.
- Require clear user intent for destructive or external side effects, including overwriting notes, sending messages, or invoking tools with broad access.
- Prefer least-privilege access and explicit allowlists for file and tool operations.

## AI agent expectations

AI contributors are expected to act as careful maintainers, not autonomous product owners.

- Inspect the repository and relevant docs before editing.
- Preserve existing files and user changes. Move files instead of recreating them when a reorganization is requested.
- Keep changes narrowly scoped; do not opportunistically reformat, rename, modernize, or add tooling.
- Do not implement application logic when asked only for architecture, documentation, review, or structure.
- Explain assumptions, trade-offs, and verification performed in the final handoff.
- Stop and request direction when a change needs an unresolved product choice, credentials, external access, data migration, or destructive action.
- Never claim a test, build, integration, or behavior was verified when it was not.

## Pull requests and commit philosophy

Keep each pull request and commit focused on one coherent outcome. Prefer a sequence of reviewable changes over a large mixed refactor.

A pull request description should state:

- the problem and intended outcome;
- the relevant documentation and decisions considered;
- key design choices and alternatives when they matter;
- validation performed and anything not validated;
- documentation, migration, privacy, or compatibility impact.

Write commit subjects in imperative form and describe the outcome, for example: `docs: add contributor architecture guide`. Do not combine unrelated formatting changes, dependency upgrades, and feature work in one commit.

## Definition of done

A change is ready when all of the following are true:

- It aligns with the relevant source-of-truth documentation, or the documentation was updated deliberately.
- Its ownership and dependency direction are clear.
- The implementation is minimal, readable, typed, and free of speculative abstractions.
- Appropriate tests or documented manual verification pass.
- Failure, privacy, and user-control implications were considered.
- Public behavior, contracts, and durable decisions are documented.
- No unrelated files, generated artifacts, secrets, or avoidable dependencies were added.

## Common mistakes to avoid

- Treating chat history, embeddings, or a database index as the canonical long-term memory.
- Writing permanent knowledge without a transparent Markdown representation in the user's vault.
- Coupling UI components directly to model providers, file-system operations, or retrieval internals.
- Letting `shared` become a dependency shortcut for unrelated code.
- Adding a framework or dependency before the documentation and a concrete need justify it.
- Hiding AI reasoning or memory provenance behind unexplained output.
- Overwriting user-authored notes during synchronization or conflict resolution.
- Optimizing or abstracting ahead of demonstrated need.
- Editing documents casually when a focused link repair or an appended decision is sufficient.
- When there is ambiguity between implementing a quick solution and preserving long-term architecture consistency, prefer the architecture.

## Future scalability principles

As Syntrophos grows, preserve stable domain contracts and isolate adapters so new applications, model providers, tools, and storage implementations can be added without rewriting core concepts. Evolve schemas and public APIs deliberately and compatibly. Prefer local-first, portable formats; synchronize derived state rather than replacing user-owned source material. Scale through explicit boundaries, observability, idempotent workflows, and incremental processing—not by making the core opaque or tightly coupled.
