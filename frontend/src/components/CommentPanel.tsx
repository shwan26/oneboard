import { useMemo, useState } from "react";

interface Comment {
  id: string;
  taskId: string;
  body: string;
  system?: boolean;
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
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  return `${Math.floor(hours / 24)}d ago`;
}

interface Membership {
  id: string;
  role: string;
  user: { id: string; name: string };
}

export default function CommentPanel({
  task,
  members,
  draft,
  onDraftChange,
  onSend,
}: {
  task: Task | null;
  members: Membership[];
  draft: string;
  onDraftChange: (v: string) => void;
  onSend: () => void;
}) {
  const [mentionQuery, setMentionQuery] = useState<string | null>(null); // null = not currently mentioning

  const mentionMatches = useMemo(() => {
    if (mentionQuery === null) return [];
    return members
      .filter((m) => m.user.name.toLowerCase().includes(mentionQuery.toLowerCase()))
      .slice(0, 5);
  }, [mentionQuery, members]);

  function handleDraftChange(value: string) {
    onDraftChange(value);
    const atIndex = value.lastIndexOf("@");
    if (atIndex === -1) {
      setMentionQuery(null);
      return;
    }
    const afterAt = value.slice(atIndex + 1);
    if (/\s/.test(afterAt)) {
      setMentionQuery(null); // they've typed past the name, e.g. "@Alice hey" — stop suggesting
    } else {
      setMentionQuery(afterAt);
    }
  }

  function pickMention(name: string) {
    const atIndex = draft.lastIndexOf("@");
    const newDraft = draft.slice(0, atIndex) + `@${name} `;
    onDraftChange(newDraft);
    setMentionQuery(null);
  }

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
        {task.comments.map((c: any) =>
          c.system ? (
            <p key={c.id} className="text-center text-xs text-muted italic my-2">
              {c.user.name} {c.body} · {timeAgo(c.createdAt)}
            </p>
          ) : (
            <div key={c.id} className="rounded-lg bg-mist px-3 py-2 mb-2">
              <div className="flex items-center justify-between gap-2">
                <p className="text-xs font-medium text-ink">{c.user.name}</p>
                <p className="text-[11px] text-muted">{timeAgo(c.createdAt)}</p>
              </div>
              <p className="text-sm text-ink">{c.body}</p>
            </div>
          )
        )}
      </div>

      <div className="relative border-t border-line px-4 py-3">
        {mentionMatches.length > 0 && (
          <div className="absolute bottom-full left-4 mb-1 w-56 rounded-lg border border-line bg-white shadow-lg z-10">
            {mentionMatches.map((m) => (
              <button
                key={m.user.id}
                onClick={() => pickMention(m.user.name)}
                className="w-full text-left px-3 py-1.5 text-xs text-ink hover:bg-mist first:rounded-t-lg last:rounded-b-lg"
              >
                @{m.user.name}
              </button>
            ))}
          </div>
        )}
        <div className="flex items-center gap-2">
          <input
            value={draft}
            onChange={(e) => handleDraftChange(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && onSend()}
            placeholder="Post an update… (@ to mention)"
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
    </div>
  );
}