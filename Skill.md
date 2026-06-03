
# Project Engineering Standards

This project follows a production-grade scalable architecture designed for long-term maintainability, extensibility, and high-volume processing.

The system is expected to support:

* Large Excel/CSV imports
* External API integrations
* Background job processing
* Retry mechanisms
* Queue-based architecture
* Progress tracking
* Enterprise-level maintainability

---

# Core Engineering Principles

## 1. Separation of Concerns

Each layer must have a single responsibility.

* UI handles rendering only
* Services handle business workflows
* Repositories handle database access
* Clients handle external API communication
* Validators handle input validation
* Parsers handle file parsing
* Transformers handle data mapping

Never mix responsibilities.

---

# 2. Clean Architecture

The system must follow layered architecture.

Flow:

UI
→ Route Handler / Server Action
→ Validation
→ Service
→ Repository / Client
→ Database / External API

Business logic must never exist inside:

* React components
* Route handlers
* Database repositories

---

# 3. Feature-Based Modular Structure

Organize by feature/domain instead of technical type.

Correct:

src/modules/import-job/
src/modules/auth/
src/modules/user/

Avoid:

src/components/
src/services/
src/hooks/

at the global root for feature-specific logic.

---

# 4. Scalability First

Assume the system will eventually process:

* millions of rows
* large files
* concurrent users
* unstable external APIs

Architecture decisions must support scaling.

---

# Folder Structure

src/
│
├── app/
├── modules/
├── infrastructure/
├── shared/
├── providers/
├── configs/
├── hooks/
├── types/
└── utils/

---

# app/

Contains:

* routes
* layouts
* route handlers
* server actions
* loading/error boundaries

Keep app layer thin.

Do not place heavy business logic here.

---

# modules/

Each business domain lives inside modules.

Example:

modules/
└── import-job/
├── components/
├── services/
├── repositories/
├── parsers/
├── transformers/
├── validators/
├── queue/
├── clients/
├── schemas/
├── types/
└── utils/

Everything related to a feature should stay together.

---

# components/

UI-only layer.

Responsibilities:

* rendering
* event handling
* user interaction

Avoid:

* direct database access
* direct fetch logic
* complex business logic

Components should be reusable and composable.

---

# services/

Contains business workflows and use cases.

Examples:

* startImport()
* processImportRow()
* retryFailedRows()
* createUser()
* login()

Services orchestrate the system.

Services may call:

* repositories
* clients
* queues
* validators

Services should NOT:

* render UI
* contain SQL queries

---

# repositories/

Database access layer.

Responsibilities:

* CRUD
* querying
* persistence

Repositories must not contain business rules.

Repositories should be easily replaceable.

---

# parsers/

Responsible for parsing files.

Examples:

* Excel parser
* CSV parser
* XML parser

Parser responsibilities:

* read files
* extract raw data
* validate headers

Do not place business transformation logic here.

---

# validators/

Responsible for validating data.

Use:

* Zod

Validation examples:

* required fields
* email format
* numeric ranges
* enum validation

Never trust user input.

---

# transformers/

Responsible for converting data formats.

Example:

Excel row
→ API payload

Database model
→ DTO

Transformers must remain pure and deterministic.

---

# clients/

Responsible for external API communication.

Rules:

* centralize HTTP logic
* normalize errors
* support retries
* support timeouts
* support authentication

Never call fetch() directly across the application.

Use dedicated API client abstractions.

---

# queue/

Responsible for background processing.

Use queues for:

* large imports
* retries
* delayed jobs
* batch processing

Recommended:

* BullMQ

Queue workers must be idempotent.

---

# infrastructure/

Contains infrastructure-related implementations.

Examples:

* database
* redis
* storage
* logger
* email
* monitoring

Infrastructure must remain replaceable.

---

# shared/

Shared reusable utilities across modules.

Examples:

* UI components
* constants
* helpers
* shared hooks
* shared schemas

Avoid placing feature-specific logic here.

---

# Coding Standards

## TypeScript

* strict mode enabled
* avoid any
* prefer explicit types
* infer from schemas where possible

---

# Naming Conventions

Use clear names.

Good:

* importJobService
* externalApiClient
* processImportRow

Bad:

* dataService
* helperUtil
* tempFunction

---

# Async Rules

Always use:

* async/await

Avoid:

* nested promises
* unhandled promise chains

---

# Error Handling

Never silently ignore errors.

Always:

* log errors
* normalize errors
* provide context

Use structured logging.

Avoid:

* console.log in production

---

# Logging

Every critical workflow should log:

* job start
* job completion
* retry attempts
* external API failures
* validation failures

Logs must be structured and searchable.

---

# Queue Processing Standards

Queue workers must support:

* retries
* exponential backoff
* concurrency control
* batch processing
* progress tracking

Workers must be resumable after crashes.

---

# External API Rules

External APIs are unstable by default.

Always support:

* retry
* timeout
* error normalization
* rate limiting
* request tracing

Never assume API stability.

---

# Database Design Standards

Track:

* import jobs
* row-level processing
* failure reasons
* retry counts
* processing duration

Never lose processing history.

---

# Performance Standards

Avoid:

* loading entire large files into memory
* sequential processing when batching is possible
* unnecessary re-renders
* excessive client-side state

Use:

* streaming
* pagination
* batching
* queues
* caching

---

# Security Standards

Never trust:

* uploaded files
* request payloads
* external API responses

Validate everything.

Avoid:

* exposing secrets
* logging sensitive data
* insecure file handling

Use environment variables properly.

---

# Testing Standards

Minimum:

* unit tests
* integration tests

Critical flows must be testable.

Business logic should remain framework-independent where possible.

---

# AI Generation Rules

When generating code:

* prioritize maintainability over brevity
* prioritize clarity over cleverness
* avoid overengineering
* avoid tightly coupled code
* prefer explicit architecture
* keep layers separated

Generate code as if this project will be maintained for 5+ years by multiple engineers.

---

# Engineering Mindset

The goal is not:
"make it work"

The goal is:

* scalable
* testable
* observable
* maintainable
* replaceable
* resilient

Think like a systems engineer, not just a frontend developer.
