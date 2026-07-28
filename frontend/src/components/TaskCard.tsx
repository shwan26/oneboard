interface Task {
  id: string;
  title: string;
  description?: string | null;
  status: "todo" | "doing" | "done";
  deadline?: string | null;
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
  onSelect,
  onStatusChange,
  onAssigneeChange,
  onDeadlineChange,
}: {
  task: Task;
  members: Membership[];
  selected: boolean;
  onSelect: () => void;
  onStatusChange: (status: Task["status"]) => void;
  onAssigneeChange: (assigneeId: string) => void;
  onDeadlineChange: (deadline: string) => void;
}) {
  const isOverdue = !!task.deadline && task.status !== "done" && new Date(task.deadline) < new Date();

  return (
    <button
      onClick={onSelect}
      className={`w-full text-left rounded-xl border px-4 py-3 transition ${
        selected ? "border-accent bg-white shadow-sm" : "border-line bg-cloud hover:border-accent/40"
      }`}
    >
      <div className="flex items-center justify-between gap-2">
        <p className="text-sm font-medium text-ink">{task.title}</p>
        <span className={`shrink-0 text-xs px-2 py-0.5 rounded-full ${STATUS_STYLE[task.status]}`}>
          {STATUS_LABEL[task.status]}
        </span>
      </div>

      <div className="mt-2" onClick={(e) => e.stopPropagation()}>
        <select
          value={task.status}
          onChange={(e) => onStatusChange(e.target.value as Task["status"])}
          className="text-xs border border-line rounded-full px-2 py-1 bg-white text-muted outline-none focus:border-accent"
        >
          <option value="todo">To do</option>
          <option value="doing">In progress</option>
          <option value="done">Done</option>
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
    </button>
  );
}