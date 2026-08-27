// Stub for the `server-only` package under Vitest.
//
// The real package throws when imported outside a React Server Component,
// which would make every server module untestable. Aliasing it here lets the
// tests exercise the actual production modules rather than copies of them.
export {};
