export default function HomePage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-ds-3 lg:p-ds-7">
      <div className="max-w-[var(--container-content)] text-center">
        <h1 className="mb-ds-3 text-foreground">Anuj Yadav</h1>
        <p className="text-muted text-[var(--text-md)]">
          Portfolio platform — scaffolding complete.
        </p>
        <div className="mt-ds-6 flex items-center justify-center gap-ds-3">
          <span className="inline-block rounded-sm bg-accent px-ds-3 py-ds-1 text-[var(--text-xs)] font-medium text-accent-foreground">
            Next.js
          </span>
          <span className="inline-block rounded-sm border border-border px-ds-3 py-ds-1 text-[var(--text-xs)] text-muted">
            Express
          </span>
          <span className="inline-block rounded-sm border border-border px-ds-3 py-ds-1 text-[var(--text-xs)] text-muted">
            PostgreSQL
          </span>
        </div>
      </div>
    </main>
  );
}
