export default function Landing() {
  return (
    <div className="min-h-screen bg-sky-night text-white relative overflow-hidden">
      {/* Nav */}
      <nav className="relative z-10 mx-auto flex max-w-6xl items-center justify-between px-4 py-4 sm:px-8 sm:py-5">
        <span className="font-serif text-xl">Oneboard</span>
        <div className="flex items-center gap-3">
          <a href="/login" className="px-2 py-2 text-sm text-white/80 hover:text-white sm:px-4">Log in</a>
          <a href="/register" className="rounded-full bg-white px-4 py-2 text-sm font-medium text-accent hover:bg-white/90 sm:px-5">
            Get started
          </a>
        </div>
      </nav>

      {/* Hero */}
      <div className="relative z-10 mx-auto max-w-3xl px-4 pb-16 pt-16 text-center sm:px-6 sm:pb-24 sm:pt-24">
        <p className="inline-block text-xs tracking-wide bg-white/10 border border-white/15 rounded-full px-4 py-1.5 mb-8">
          One room. Every task, live.
        </p>
        <h1 className="mb-6 font-serif text-4xl leading-tight sm:text-6xl">
          Plan calmly.
          <br />
          Ship together.
        </h1>
        <p className="mx-auto mb-10 max-w-xl text-base text-white/70 sm:text-lg">
          Oneboard brings your tasks, comments, and team into one live room —
          so nothing gets lost between five different tabs.
        </p>
        <div className="flex flex-col items-stretch justify-center gap-3 min-[380px]:flex-row min-[380px]:items-center sm:gap-4">
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
