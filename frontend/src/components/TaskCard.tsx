interface Task {
  id: string;
  title: string;
  description?: string | null;
  status: "todo" | "doing" | "done";
  deadline?: string | null;
  assignee?: { id: string; name: string } | null;
}

interface Membership {
  id: string;
  role: string;
  user: { id: string; name: string; email?: string };
}

const STATUS_LABEL: Record<Task["status"], string> = {
  todo: "To do",
  doing: "In progress",
  done: "Done",
};

const STATUS_STYLE: Record<Task["status"], string> = {
  todo: "bg-mist text-muted",
  doing: "bg-accentsoft text-accent",
  done: "bg-green-50 text-green-700",
};

export default function TaskCard({
  task,
  members,
  selected,
  hasUnread,
  onSelect,
  onStatusChange,
  onAssigneeChange,
  onDeadlineChange,
  onDelete,
}: {
  task: Task;
  members: Membership[];
  selected: boolean;
  hasUnread?: boolean;
  onSelect: () => void;
  onStatusChange: (status: Task["status"]) => void;
  onAssigneeChange: (assigneeId: string) => void;
  onDeadlineChange: (deadline: string) => void;
  onDelete: () => void;
}) {
  const isOverdue = !!task.deadline && task.status !== "done" && new Date(task.deadline) < new Date();

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={onSelect}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") onSelect();
      }}
      className={`w-full text-left rounded-xl border px-4 py-3 transition cursor-pointer ${
        selected ? "border-accent bg-white shadow-sm" : "border-line bg-cloud hover:border-accent/40"
      }`}
    >
      {hasUnread && (
        <span className="absolute -top-1 -left-1 h-2.5 w-2.5 rounded-full bg-accent" />
      )}
      <div className="flex items-center justify-between gap-2">
        <p className="text-sm font-medium text-ink">{task.title}</p>
        <div className="flex items-center gap-1.5 shrink-0">
          <span className={`text-xs px-2 py-0.5 rounded-full ${STATUS_STYLE[task.status]}`}>
            {STATUS_LABEL[task.status]}
          </span>
          <button
            onClick={(e) => {
              e.stopPropagation();
              if (confirm(`Delete "${task.title}"? This can't be undone.`)) onDelete();
            }}
            title="Delete task"
            className="text-muted hover:text-red-600 p-0.5"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M3 6h18M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2m3 0-1 14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2L4 6h16Z" />
            </svg>
          </button>
        </div>
      </div>

      <div className="mt-2 flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
        <select
          value={task.status}
          onChange={(e) => onStatusChange(e.target.value as Task["status"])}
          className="text-xs border border-line rounded-full px-2 py-1 bg-white text-muted outline-none focus:border-accent"
        >
          <option value="todo">To do</option>
          <option value="doing">In progress</option>
          <option value="done">Done</option>
        </select>

        <select
          value={(task as any).assignee?.id || ""}
          onChange={(e) => onAssigneeChange(e.target.value)}
          className="text-xs border border-line rounded-full px-2 py-1 bg-white text-muted outline-none focus:border-accent"
        >
          <option value="">All</option>
          {members.map((m) => (
            <option key={m.user.id} value={m.user.id}>
              {m.user.name}
            </option>
          ))}
        </select>
      </div>

      <div className="mt-2 flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
        <input
          type="date"
          value={task.deadline ? task.deadline.slice(0, 10) : ""}
          onChange={(e) => onDeadlineChange(e.target.value)}
          className={`rounded border bg-panel2 px-1.5 py-1 font-mono-tight text-[10px] ${
            isOverdue ? "border-live text-live" : "border-line text-faint"
          }`}
        />
        {isOverdue && <span className="text-[10px] text-live">overdue</span>}
      </div>
    </div>
  );
}