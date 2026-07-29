import { useEffect, useMemo, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { api } from "../api";
import { connectSocket } from "../socket";
import TaskCard from "../components/TaskCard";
import CommentPanel from "../components/CommentPanel";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../auth";

export default function ProjectRoom() {
  const { id } = useParams<{ id: string }>();
  const [project, setProject] = useState<any>(null);
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);
  const [newTaskTitle, setNewTaskTitle] = useState("");
  const [draft, setDraft] = useState("");
  const [online, setOnline] = useState<{ id: string; name: string }[]>([]);
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteMsg, setInviteMsg] = useState("");
  const [showMembers, setShowMembers] = useState(false);
  const navigate = useNavigate();
  const [showSettings, setShowSettings] = useState(false);

  const { user } = useAuth();
  const myMembership = project?.members?.find((m: any) => m.user.id === user?.id);
  const isOwner = myMembership?.role === "owner";

  useEffect(() => {
    if (!id) return;
    api.getProject(id).then(setProject);

    const socket = connectSocket();
    socket.emit("project:join", id);

    socket.on("presence:update", setOnline);

    socket.on("task:created", (task: any) => {
      setProject((p: any) => (p ? { ...p, tasks: [...p.tasks, task] } : p));
    });

    socket.on("task:updated", (task: any) => {
      setProject((p: any) =>
        p ? { ...p, tasks: p.tasks.map((t: any) => (t.id === task.id ? { ...t, ...task } : t)) } : p
      );
    });

    socket.on("comment:created", ({ taskId, comment }: any) => {
      setProject((p: any) =>
        p
          ? { ...p, tasks: p.tasks.map((t: any) => t.id === taskId ? { ...t, comments: [...t.comments, comment] } : t) }
          : p
      );
    });

    socket.on("task:deleted", ({ id: taskId }: { id: string }) => {
      setProject((p: any) => (p ? { ...p, tasks: p.tasks.filter((t: any) => t.id !== taskId) } : p));
      setSelectedTaskId((s) => (s === taskId ? null : s));
    });

    socket.on("project:deleted", () => {
      navigate("/dashboard");
    });

    return () => {
      socket.off("presence:update");
      socket.off("task:created");
      socket.off("task:updated");
      socket.off("comment:created");
    };
  }, [id]);

  const selectedTask = useMemo(
    () => project?.tasks?.find((t: any) => t.id === selectedTaskId) || null,
    [project, selectedTaskId]
    );

  if (!project) {
    return <div className="min-h-screen bg-sky-light flex items-center justify-center text-muted">Opening room…</div>;
  }

  async function addTask(e: React.FormEvent) {
    e.preventDefault();
    if (!newTaskTitle.trim() || !id) return;
    await api.createTask(id, newTaskTitle.trim());
    setNewTaskTitle("");
  }

  async function sendComment() {
    if (!draft.trim() || !selectedTask) return;
    await api.addComment(selectedTask.id, draft.trim());
    setDraft("");
  }

  async function sendInvite(e: React.FormEvent) {
    e.preventDefault();
    if (!inviteEmail.trim() || !id) return;
    try {
        await api.inviteMember(id, inviteEmail.trim());
        setInviteMsg(`${inviteEmail} added`);
        setInviteEmail("");
        api.getProject(id).then(setProject);
    } catch (err: any) {
        setInviteMsg(err.message);
    }
  }

  return (
    <div className="h-screen flex flex-col bg-sky-light">
      <header className="relative z-20 flex items-center justify-between px-6 py-4 border-b border-line bg-white/60 backdrop-blur">
        <div className="flex items-center gap-4">
          <Link to="/dashboard" className="text-sm text-muted hover:text-ink">← Rooms</Link>
          <p className="font-serif text-lg text-ink">{project.name}</p>
        </div>
        <div className="flex items-center gap-3">
          <p className="text-xs text-muted">{online.length} online</p>
          <button
            onClick={() => setShowMembers((s) => !s)}
            title="Crew"
            className="rounded-full border border-line bg-white p-1.5 text-muted hover:text-ink hover:border-accent transition"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
              <circle cx="9" cy="7" r="4" />
              <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
              <path d="M16 3.13a4 4 0 0 1 0 7.75" />
            </svg>
          </button>
          <div className="relative">
            <button
              onClick={() => setShowSettings((s) => !s)}
              title="Room settings"
              className="rounded-full border border-line bg-white p-1.5 text-muted hover:text-ink hover:border-accent transition"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="3" />
                <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.6 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.6a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1Z" />
              </svg>
            </button>

            {showSettings && (
              <div className="absolute right-0 mt-2 w-44 rounded-lg border border-line bg-white shadow-lg z-10">
                {isOwner ? (
                  <button
                    onClick={async () => {
                      if (confirm(`Delete "${project.name}"? This removes it for everyone and can't be undone.`)) {
                        await api.deleteProject(id!);
                        navigate("/dashboard");
                      }
                    }}
                    className="w-full text-left px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg"
                  >
                    Delete room
                  </button>
                ) : (
                  <p className="px-3 py-2 text-xs text-muted">Only the room owner can delete this room.</p>
                )}
              </div>
            )}
          </div>
        </div>

      </header>

      <div className="relative flex flex-1 overflow-hidden">
        <div className="w-80 shrink-0 border-r border-line flex flex-col">
          <form onSubmit={addTask} className="p-3 border-b border-line">
            <input
              value={newTaskTitle}
              onChange={(e) => setNewTaskTitle(e.target.value)}
              placeholder="New task…"
              className="w-full rounded-full border border-line bg-white px-4 py-2 text-sm outline-none focus:border-accent focus:ring-1 focus:ring-accent"
            />
          </form>
          <div className="flex-1 overflow-y-auto p-3 space-y-2">
            {project.tasks.map((task: any) => (
              <TaskCard
                key={task.id}
                task={task}
                members={project.members}
                selected={task.id === selectedTaskId}
                onSelect={() => setSelectedTaskId(task.id)}
                onStatusChange={(status) => api.updateTask(task.id, { status })}
                onAssigneeChange={(assigneeId) => api.updateTask(task.id, { assigneeId: assigneeId || null })}
                onDeadlineChange={(deadline) => api.updateTask(task.id, { deadline: deadline || null })}
                onDelete={() => api.deleteTask(task.id)}
            />
            ))}
          </div>
        </div>

        <div className="flex-1 bg-white">
          <CommentPanel task={selectedTask} draft={draft} onDraftChange={setDraft} onSend={sendComment} />
        </div>

        {/* Crew / invite panel — only rendered when the icon is clicked */}
        {showMembers && (
          <div className="absolute right-0 top-0 h-full w-64 border-l border-line bg-white p-4 shadow-lg">
            <div className="flex items-center justify-between mb-2">
              <p className="text-xs font-medium text-muted uppercase tracking-wide">Crew</p>
              <button onClick={() => setShowMembers(false)} className="text-muted hover:text-ink text-sm">✕</button>
            </div>
            <ul className="space-y-1 mb-4">
                {project.members?.map((m: any) => (
                <li key={m.id} className="text-sm text-ink">
                    {m.user.name} <span className="text-xs text-muted">· {m.role}</span>
                </li>
                ))}
            </ul>

            <form onSubmit={sendInvite} className="space-y-2">
                <input
                type="email"
                value={inviteEmail}
                onChange={(e) => setInviteEmail(e.target.value)}
                placeholder="teammate@email.com"
                className="w-full rounded-full border border-line bg-white px-3 py-1.5 text-xs outline-none focus:border-accent"
                />
                <button className="w-full bg-mist text-ink text-xs font-medium py-1.5 rounded-full hover:bg-line">
                Invite
                </button>
                {inviteMsg && <p className="text-xs text-muted">{inviteMsg}</p>}
            </form>
          </div>
        )}
      </div>
    </div>
  );
}