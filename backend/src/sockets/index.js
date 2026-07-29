import jwt from "jsonwebtoken";

// Tracks who's currently active in each project, in memory.
// Map<projectId, Map<userId, { id, name }>>
const presence = new Map();

function getRoomPresence(projectId) {
  if (!presence.has(projectId)) presence.set(projectId, new Map());
  return presence.get(projectId);
}

function broadcastPresence(io, projectId) {
  const room = getRoomPresence(projectId);
  const list = Array.from(room.values());
  io.to(`project:${projectId}`).emit("presence:update", list);
}

export function registerSocketHandlers(io) {
  // This runs before any connection is accepted — reject anyone without a valid token
  io.use((socket, next) => {
    const token = socket.handshake.auth?.token;
    if (!token) return next(new Error("Missing auth token"));

    try {
      const payload = jwt.verify(token, process.env.JWT_SECRET);
      socket.user = payload;
      next();
    } catch (err) {
      next(new Error("Invalid auth token"));
    }
  });

  io.on("connection", (socket) => {
    let currentProjectId = null;

    socket.join(`user:${socket.user.id}`); // personal room — for DMs/notifications regardless of active project

    // Frontend calls this after connecting, telling us which project it's viewing
    socket.on("project:join", (projectId) => {
      currentProjectId = projectId;
      socket.join(`project:${projectId}`); // Socket.io "rooms" — a way to group connections

      const room = getRoomPresence(projectId);
      room.set(socket.user.id, { id: socket.user.id, name: socket.user.name });
      broadcastPresence(io, projectId);
    });

    socket.on("disconnect", () => {
      if (!currentProjectId) return;
      getRoomPresence(currentProjectId).delete(socket.user.id);
      broadcastPresence(io, currentProjectId);
    });
  });
}