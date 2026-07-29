import { Router } from "express";
import prisma from "../lib/prisma.js";
import { requireAuth } from "../middleware/auth.js";

const router = Router();
router.use(requireAuth);

// Small helper — confirm the logged-in user actually belongs to this project
// before letting them touch any of its tasks
async function assertMember(userId, projectId) {
  return prisma.membership.findUnique({
    where: { userId_projectId: { userId, projectId } },
  });
}

// helper
function toDateOrNull(value) {
  if (value === undefined) return undefined; // don't touch the field if not sent
  if (!value) return null; // "" or null → clear the deadline
  return new Date(value); // "2026-07-30" → valid Date, Prisma serializes it
}

// POST /api/tasks — create a task inside a project
router.post("/", async (req, res) => {
  const { projectId, title, description, assigneeId, deadline } = req.body;
  if (!projectId || !title) {
    return res.status(400).json({ error: "projectId and title are required" });
  }

  const membership = await assertMember(req.user.id, projectId);
  if (!membership) {
    return res.status(403).json({ error: "You are not a member of this project" });
  }

  const task = await prisma.task.create({
    data: {
      projectId,
      title,
      description,
      assigneeId: assigneeId || req.user.id, // default to creator if not specified
      deadline: toDateOrNull(deadline),
    },
    include: { assignee: { select: { id: true, name: true } }, comments: true },
  });

  req.app.get("io").to(`project:${projectId}`).emit("task:created", task);
  res.status(201).json(task);
});

// PATCH /api/tasks/:id — update a task's status, title, description, or assignee
router.patch("/:id", async (req, res) => {
  const existing = await prisma.task.findUnique({ where: { id: req.params.id } });
  if (!existing) return res.status(404).json({ error: "Task not found" });

  const membership = await assertMember(req.user.id, existing.projectId);
  if (!membership) {
    return res.status(403).json({ error: "You are not a member of this project" });
  }
  const { title, description, status, assigneeId, deadline } = req.body;

  const task = await prisma.task.update({
    where: { id: req.params.id },
    data: { title, description, status, assigneeId, deadline: toDateOrNull(deadline) },
    include: { assignee: { select: { id: true, name: true } } },
  });

  req.app.get("io").to(`project:${existing.projectId}`).emit("task:updated", task);
  res.json(task);
});

// DELETE /api/tasks/:id — remove a task
router.delete("/:id", async (req, res) => {
  const existing = await prisma.task.findUnique({ where: { id: req.params.id } });
  if (!existing) return res.status(404).json({ error: "Task not found" });

  const membership = await assertMember(req.user.id, existing.projectId);
  if (!membership) {
    return res.status(403).json({ error: "You are not a member of this project" });
  }

  await prisma.comment.deleteMany({ where: { taskId: req.params.id } });
  await prisma.task.delete({ where: { id: req.params.id } });

  req.app.get("io").to(`project:${existing.projectId}`).emit("task:deleted", { id: req.params.id });
  res.status(204).end();
});

export default router;