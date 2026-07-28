export default function Landing() {
  return (
    <div className="min-h-screen bg-sky-night text-white relative overflow-hidden">
      {/* Nav */}
      <nav className="relative z-10 flex items-center justify-between px-8 py-5 max-w-6xl mx-auto">
        <span className="font-serif text-xl">Oneboard</span>
        <div className="flex items-center gap-3">
          <a href="/login" className="text-sm text-white/80 hover:text-white px-4 py-2">Log in</a>
          <a href="/register" className="text-sm font-medium bg-white text-accent px-5 py-2 rounded-full hover:bg-white/90">
            Get started
          </a>
        </div>
      </nav>

      {/* Hero */}
      <div className="relative z-10 max-w-3xl mx-auto text-center px-6 pt-24 pb-24">
        <p className="inline-block text-xs tracking-wide bg-white/10 border border-white/15 rounded-full px-4 py-1.5 mb-8">
          One room. Every task, live.
        </p>
        <h1 className="font-serif text-5xl sm:text-6xl leading-tight mb-6">
          Plan calmly.
          <br />
          Ship together.
        </h1>
        <p className="text-white/70 text-lg max-w-xl mx-auto mb-10">
          Oneboard brings your tasks, comments, and team into one live room —
          so nothing gets lost between five different tabs.
        </p>
        <div className="flex items-center justify-center gap-4">
          <a href="/register" className="bg-white text-accent font-medium px-6 py-3 rounded-full hover:bg-white/90">
            Start for free
          </a>
          <a href="/login" className="border border-white/25 text-white px-6 py-3 rounded-full hover:bg-white/10">
            Log in
          </a>
        </div>
      </div>
    </div>
  );
}