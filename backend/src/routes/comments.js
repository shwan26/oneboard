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

  req.app.get("io").to(`project:${task.projectId}`).emit("comment:created", { taskId, comment });
  res.status(201).json(comment);
});

export default router;