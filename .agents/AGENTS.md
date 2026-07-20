# TypeScript Coding and Linting Guidelines

Ensure all code changes in the frontend match the strict typing and linting rules defined in the project.

## Rules for TypeScript Development

1. **Strict Type Safety (`"strict": true`)**
   - Always run `npm run lint` inside the `/frontend` directory to verify code changes.
   - Do **NOT** use `any`. Use `unknown` or specify explicit TypeScript types/interfaces if type is not known.
   - Enable strict null checks: use optional chaining (`?.`) and nullish coalescing (`??`) rather than relying on loose comparison (`== null`) or forcing non-null assertion (`!`).

2. **Explicit Function & Component Types**
   - Always define types/interfaces for component props. Destructure them directly in the function arguments.
   - Use explicit return types for functions, especially APIs (`src/services/api/`) and utility functions.
   - Use Next.js conventions for client-side components by placing `'use client';` at the top of the file.

3. **Type-Only Imports**
   - Prefer type-only imports (`import type { TypeName } from '...'`) when importing typescript types or interfaces. This optimizes compilation and prevents circular dependency runtime issues.

4. **Zod Validation for API Endpoints**
   - Use Zod schemas under `src/services/types/` to validate API responses on the frontend, ensuring structure safety at runtime.

5. **Linting Workflow**
   - After creating or modifying any TypeScript or React code, run:
     ```bash
     npm run lint
     ```
     Ensure that no errors or warnings are introduced.
