const API_URL = import.meta.env.VITE_API_URL || "http://localhost:4000";

function getToken() {
  return localStorage.getItem("oneboard_token");
}

async function request(path: string, options: RequestInit = {}) {
  const token = getToken();
  const res = await fetch(`${API_URL}/api${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(options.headers || {}),
    },
  });

  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error || `Request failed with status ${res.status}`);
  }
  if (res.status === 204) return null;
  return res.json();
}

export const api = {
  register: (name: string, email: string, password: string) =>
    request("/auth/register", { method: "POST", body: JSON.stringify({ name, email, password }) }),
  login: (email: string, password: string) =>
    request("/auth/login", { method: "POST", body: JSON.stringify({ email, password }) }),

  listProjects: () => request("/projects"),
  createProject: (name: string, description?: string) =>
    request("/projects", { method: "POST", body: JSON.stringify({ name, description }) }),
  getProject: (id: string) => request(`/projects/${id}`),

  createTask: (projectId: string, title: string) =>
    request("/tasks", { method: "POST", body: JSON.stringify({ projectId, title }) }),
  updateTask: (id: string, data: Record<string, unknown>) =>
    request(`/tasks/${id}`, { method: "PATCH", body: JSON.stringify(data) }),

  addComment: (taskId: string, body: string) =>
    request("/comments", { method: "POST", body: JSON.stringify({ taskId, body }) }),

  inviteMember: (projectId: string, email: string) =>
    request(`/projects/${projectId}/members`, { method: "POST", body: JSON.stringify({ email }) }),

  deleteTask: (id: string) =>
    request(`/tasks/${id}`, { method: "DELETE" }),

  deleteProject: (id: string) =>
    request(`/projects/${id}`, { method: "DELETE" }),

  getNotifications: () => request(`/notifications`),
  markNotificationRead: (id: string) =>
    request(`/notifications/${id}`, { method: "PATCH" }),
};

export { API_URL, getToken };