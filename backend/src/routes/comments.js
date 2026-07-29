import { Router } from "express";
import prisma from "../lib/prisma.js";
import { requireAuth } from "../middleware/auth.js";

const router = Router();
router.use(requireAuth);

router.post("/", async (req, res) => {
  const { taskId, body } = req.body;
  if (!taskId || !body) {
    return res.status(400).json({ error: "taskId and body are required" });
  }

  const task = await prisma.task.findUnique({ where: { id: taskId } });
  if (!task) return res.status(404).json({ error: "Task not found" });

  const membership = await prisma.membership.findUnique({
    where: { userId_projectId: { userId: req.user.id, projectId: task.projectId } },
  });
  if (!membership) {
    return res.status(403).json({ error: "You are not a member of this project" });
  }

  const comment = await prisma.comment.create({
    data: { taskId, userId: req.user.id, body },
    include: { user: { select: { id: true, name: true } } },
  });

  const io = req.app.get("io");
  io.to(`project:${task.projectId}`).emit("comment:created", { taskId, comment });

  // --- Mention detection ---
  // Match @Name where Name can include spaces, stopping at the next @ or line end.
  // We match against actual project members' names rather than trusting arbitrary @text.
  const members = await prisma.membership.findMany({
    where: { projectId: task.projectId },
    include: { user: { select: { id: true, name: true } } },
  });

  const mentionedUserIds = new Set();
  for (const m of members) {
    if (m.user.id === req.user.id) continue; // don't notify yourself
    const pattern = new RegExp(`@${m.user.name.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\b`, "i");
    if (pattern.test(body)) mentionedUserIds.add(m.user.id);
  }

  for (const userId of mentionedUserIds) {
    const notification = await prisma.notification.create({
      data: {
        userId,
        taskId,
        commentId: comment.id,
        body: `${req.user.name} mentioned you in "${task.title}"`,
      },
    });
    io.to(`user:${userId}`).emit("notification:new", notification);
  }

  res.status(201).json(comment);
});

export default router;