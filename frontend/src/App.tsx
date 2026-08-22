import React from 'react'

export default function App() {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      <header className="border-b border-slate-800 bg-slate-900/50 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="h-8 w-8 rounded-lg bg-cyan-500/20 border border-cyan-500/40 flex items-center justify-center text-cyan-400 font-bold text-lg">
            M
          </div>
          <div>
            <h1 className="font-semibold text-lg tracking-tight text-slate-100">
              Unified Marine Intelligence Platform
            </h1>
            <p className="text-xs text-slate-400">SIH PS 20 — Ecosystem Reasoning System</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
            Demo Mode Active
          </span>
        </div>
      </header>

      <main className="flex-1 p-8 max-w-7xl mx-auto w-full">
        <div className="rounded-xl border border-slate-800 bg-slate-900/40 p-8 text-center space-y-4">
          <h2 className="text-2xl font-bold text-cyan-400">Platform Scaffolding Ready</h2>
          <p className="text-slate-400 max-w-2xl mx-auto text-sm leading-relaxed">
            The monorepo structure, database models, schema migrations, and analytics engines have been initialized. Next step: Data ingestion pipelines and Supabase database seeding.
          </p>
        </div>
      </main>

      <footer className="border-t border-slate-900 px-6 py-4 text-center text-xs text-slate-500">
        Unified Marine Intelligence Platform • Built for Oceanographic, Fisheries & Molecular Biodiversity Reasoning
      </footer>
    </div>
  )
}
