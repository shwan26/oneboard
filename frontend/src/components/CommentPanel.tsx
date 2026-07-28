interface Comment {
  id: string;
  body: string;
  createdAt: string;
  user: { id: string; name: string };
}

interface Task {
  id: string;
  title: string;
  description?: string | null;
  comments: Comment[];
  deadline?: string | null;
}

function timeAgo(iso: string) {
  const mins = Math.floor((Date.now() - new Date(iso).getTime()) / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  return `${Math.floor(mins / 60)}h ago`;
}

export default function CommentPanel({
  task,
  draft,
  onDraftChange,
  onSend,
}: {
  task: Task | null;
  draft: string;
  onDraftChange: (v: string) => void;
  onSend: () => void;
}) {
  if (!task) {
    return (
      <div className="h-full flex items-center justify-center text-sm text-muted">
        Select a task to see its updates
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      <div className="px-5 py-4 border-b border-line">
        <p className="text-sm font-medium text-ink">{task.title}</p>
      </div>

      <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4">
        {task.comments.length === 0 && (
          <p className="text-sm text-muted">No updates yet — add one below.</p>
        )}
        {task.comments.map((c) => (
          <div key={c.id} className="flex gap-3">
            <div className="w-7 h-7 rounded-full bg-accentsoft text-accent text-xs font-medium flex items-center justify-center shrink-0">
              {c.user.name.slice(0, 1).toUpperCase()}
            </div>
            <div>
              <div className="flex items-baseline gap-2">
                <span className="text-sm font-medium text-ink">{c.user.name}</span>
                <span className="text-xs text-muted">{timeAgo(c.createdAt)}</span>
              </div>
              <p className="text-sm text-ink/90">{c.body}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="flex items-center gap-2 border-t border-line px-4 py-3">
        <input
          value={draft}
          onChange={(e) => onDraftChange(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && onSend()}
          placeholder="Post an update…"
          className="flex-1 rounded-full border border-line bg-white px-4 py-2 text-sm outline-none focus:border-accent focus:ring-1 focus:ring-accent"
        />
        <button
          onClick={onSend}
          className="bg-accent text-white text-sm font-medium px-4 py-2 rounded-full hover:bg-accent/90"
        >
          Send
        </button>
      </div>
    </div>
  );
}