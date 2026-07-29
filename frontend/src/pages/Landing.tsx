const ArrowIcon = () => (
  <svg aria-hidden="true" viewBox="0 0 20 20">
    <path d="M4 10h12M11 5l5 5-5 5" />
  </svg>
);

const UsersIcon = () => (
  <svg aria-hidden="true" viewBox="0 0 24 24">
    <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
    <circle cx="9" cy="7" r="4" />
    <path d="M22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" />
  </svg>
);

const BellIcon = () => (
  <svg aria-hidden="true" viewBox="0 0 24 24">
    <path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9M13.7 21a2 2 0 0 1-3.4 0" />
  </svg>
);

const SettingsIcon = () => (
  <svg aria-hidden="true" viewBox="0 0 24 24">
    <circle cx="12" cy="12" r="3" />
    <path d="M19.4 15a1.7 1.7 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.8-.3 1.7 1.7 0 0 0-1 1.5v.2a2 2 0 0 1-4 0v-.1a1.7 1.7 0 0 0-1-1.5 1.7 1.7 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.8 1.7 1.7 0 0 0-1.5-1H3a2 2 0 0 1 0-4h.1a1.7 1.7 0 0 0 1.5-1 1.7 1.7 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.8.3h.1a1.7 1.7 0 0 0 1-1.5V3a2 2 0 0 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.8v.1a1.7 1.7 0 0 0 1.5 1h.2a2 2 0 0 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1Z" />
  </svg>
);

const ChatIcon = () => (
  <svg aria-hidden="true" viewBox="0 0 24 24">
    <path d="M21 15a4 4 0 0 1-4 4H8l-5 3V7a4 4 0 0 1 4-4h10a4 4 0 0 1 4 4Z" />
  </svg>
);

function PreviewTask({
  title,
  status,
  selected = false,
  assignee,
  date,
}: {
  title: string;
  status: "To do" | "In progress" | "Done";
  selected?: boolean;
  assignee: string;
  date: string;
}) {
  return (
    <article className={`room-preview__task${selected ? " is-selected" : ""}`}>
      <div className="room-preview__task-top">
        <strong>{title}</strong>
        <span className={`room-preview__status status-${status.toLowerCase().replace(" ", "-")}`}>
          {status}
        </span>
      </div>
      <div className="room-preview__task-options">
        <span>{status}⌄</span>
        <span>{assignee}⌄</span>
      </div>
      <time>{date}</time>
    </article>
  );
}

function RoomPreview() {
  return (
    <div className="room-preview" aria-label="Preview of a Oneboard project room">
      <header className="room-preview__header">
        <div className="room-preview__room-title">
          <span>← Rooms</span>
          <strong>Launch Week</strong>
        </div>
        <div className="room-preview__tools">
          <span className="room-preview__filter">All tasks⌄</span>
          <span className="room-preview__online"><i /> 3 online</span>
          <span className="room-preview__icon"><BellIcon /></span>
          <span className="room-preview__icon"><UsersIcon /></span>
          <span className="room-preview__icon"><SettingsIcon /></span>
        </div>
      </header>

      <div className="room-preview__body">
        <aside className="room-preview__tasks">
          <div className="room-preview__new-task">New task…</div>
          <div className="room-preview__task-list">
            <PreviewTask
              title="Polish onboarding flow"
              status="In progress"
              selected
              assignee="Maya"
              date="2026-08-02"
            />
            <PreviewTask
              title="Prepare launch announcement"
              status="To do"
              assignee="Everyone"
              date="2026-08-04"
            />
            <PreviewTask
              title="Finalize product screenshots"
              status="Done"
              assignee="Noah"
              date="2026-07-30"
            />
          </div>
        </aside>

        <section className="room-preview__conversation">
          <div className="room-preview__conversation-head">
            <div>
              <span className="room-preview__eyebrow">IN PROGRESS</span>
              <h2>Polish onboarding flow</h2>
              <p>Make the first minute in Oneboard feel effortless.</p>
            </div>
            <span className="room-preview__assignee">M</span>
          </div>

          <div className="room-preview__thread">
            <div className="room-preview__thread-label">
              <span>Activity</span><i />
            </div>
            <div className="room-preview__comment">
              <span className="avatar avatar-blue">M</span>
              <div>
                <p><strong>Maya Chen</strong><time>10:24 AM</time></p>
                <span>I tightened the welcome copy and simplified the first two steps.</span>
              </div>
            </div>
            <div className="room-preview__comment">
              <span className="avatar avatar-coral">N</span>
              <div>
                <p><strong>Noah Lee</strong><time>10:31 AM</time></p>
                <span>Nice. The new flow feels much clearer—ready for a final pass.</span>
              </div>
            </div>
          </div>

          <div className="room-preview__composer">
            <ChatIcon />
            <span>Write a comment…</span>
            <button>Send</button>
          </div>
        </section>
      </div>
    </div>
  );
}

export default function Landing() {
  return (
    <main className="landing-shell">
      <header className="landing-nav">
        <a className="landing-logo" href="/" aria-label="Oneboard home">Oneboard</a>

        <nav className="landing-nav__links" aria-label="Main navigation">
          <a href="#product">Product</a>
          <a href="#features">Features</a>
          <a href="#teams">For teams</a>
          <a href="#pricing">Pricing</a>
        </nav>

        <div className="landing-nav__actions">
          <a className="landing-login" href="/login">Log in</a>
          <a className="landing-nav__cta" href="/register">Start for free</a>
        </div>
      </header>

      <section className="landing-hero" id="product">
        <div className="landing-copy">
          <span className="landing-kicker">ONE ROOM. EVERY TASK, LIVE.</span>
          <h1>Plan calmly.<br />Ship together.</h1>
          <p>One focused room for your tasks, conversations, and team.</p>
          <div className="landing-copy__actions">
            <a className="landing-primary-cta" href="/register">
              Start for free <ArrowIcon />
            </a>
            <a className="landing-secondary-cta" href="#room-preview">
              See how it works
            </a>
          </div>
        </div>

        <div id="room-preview" className="landing-visual">
          <RoomPreview />
        </div>
      </section>
    </main>
  );
}
