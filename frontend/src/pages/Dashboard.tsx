import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { api } from "../api";
import { useAuth } from "../auth";
import NotificationBell from "../components/NotificationBell";

interface Project {
  id: string;
  name: string;
  role?: string;
}

export default function Dashboard() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(true);
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    api.listProjects().then((p) => {
      setProjects(p);
      setLoading(false);
    });
  }, []);

  async function createProject(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) return;
    const project = await api.createProject(name.trim());
    navigate(`/project/${project.id}`);
  }

  return (
    <div className="min-h-screen bg-sky-light px-6 py-10">
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <p className="font-serif text-2xl text-ink">Oneboard</p>
            <p className="text-muted text-sm">Welcome back, {user?.name}</p>
          </div>
          <div className="flex items-center gap-3">
            <NotificationBell />
            <button onClick={logout} className="text-sm text-muted hover:text-ink">
              Sign out
            </button>
          </div>
        </div>

        <form onSubmit={createProject} className="flex gap-2 mb-8">
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="New room name — e.g. Launch Week"
            className="flex-1 rounded-full border border-line bg-white px-4 py-2.5 text-sm text-ink outline-none focus:border-accent focus:ring-1 focus:ring-accent"
          />
          <button className="bg-accent text-white text-sm font-medium px-5 py-2.5 rounded-full hover:bg-accent/90 transition">
            Open room
          </button>
        </form>

        <div className="space-y-2">
          {loading && <p className="text-sm text-muted">Loading your rooms…</p>}
          {!loading && projects.length === 0 && (
            <p className="bg-cloud border border-line rounded-2xl px-5 py-8 text-center text-sm text-muted">
              No rooms yet. Open one above to get your team on the same page.
            </p>
          )}
          {projects.map((p) => (
            <Link
              key={p.id}
              to={`/project/${p.id}`}
              className="block bg-cloud border border-line rounded-2xl px-5 py-4 hover:border-accent/40 transition"
            >
              <p className="text-sm font-medium text-ink">{p.name}</p>
              <p className="text-xs text-muted uppercase tracking-wide">{p.role}</p>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}