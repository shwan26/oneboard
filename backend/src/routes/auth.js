import { Router } from "express";
import bcrypt from "bcryptjs";
import prisma from "../lib/prisma.js";
import { requireAuth, signToken } from "../middleware/auth.js";

const router = Router();

router.post("/register", async (req, res) => {
  const { name, email, password } = req.body;

  // Basic validation — never trust input from the client
  if (!name || !email || !password) {
    return res.status(400).json({ error: "name, email, and password are required" });
  }
  if (password.length < 8) {
    return res.status(400).json({ error: "Password must be at least 8 characters" });
  }

  // Check if this email is already taken
  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    return res.status(409).json({ error: "An account with that email already exists" });
  }

  // Hash the password — the "10" is the cost factor (higher = slower but more secure)
  const passwordHash = await bcrypt.hash(password, 10);

  const user = await prisma.user.create({
    data: { name, email, passwordHash },
  });

  const token = signToken(user);
  res.status(201).json({
    token,
    user: { id: user.id, name: user.name, email: user.email },
  });
});

router.post("/login", async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: "email and password are required" });
  }

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) {
    // Same error for "no user" and "wrong password" — don't reveal which one it was,
    // that avoids leaking which emails are registered
    return res.status(401).json({ error: "Invalid email or password" });
  }

  const valid = await bcrypt.compare(password, user.passwordHash);
  if (!valid) {
    return res.status(401).json({ error: "Invalid email or password" });
  }

  const token = signToken(user);
  res.json({
    token,
    user: { id: user.id, name: user.name, email: user.email },
  });
});

router.patch("/me", requireAuth, async (req, res) => {
  const name = typeof req.body.name === "string" ? req.body.name.trim() : "";
  if (!name) {
    return res.status(400).json({ error: "Name is required" });
  }
  if (name.length > 80) {
    return res.status(400).json({ error: "Name must be 80 characters or fewer" });
  }

  const user = await prisma.user.update({
    where: { id: req.user.id },
    data: { name },
  });
  const token = signToken(user);

  res.json({
    token,
    user: { id: user.id, name: user.name, email: user.email },
  });
});

router.patch("/me/password", requireAuth, async (req, res) => {
  const { currentPassword, newPassword } = req.body;
  if (typeof currentPassword !== "string" || typeof newPassword !== "string") {
    return res.status(400).json({ error: "Current and new passwords are required" });
  }
  if (newPassword.length < 8) {
    return res.status(400).json({ error: "New password must be at least 8 characters" });
  }
  if (currentPassword === newPassword) {
    return res.status(400).json({ error: "New password must be different from your current password" });
  }

  const user = await prisma.user.findUnique({ where: { id: req.user.id } });
  if (!user || !(await bcrypt.compare(currentPassword, user.passwordHash))) {
    return res.status(401).json({ error: "Current password is incorrect" });
  }

  const passwordHash = await bcrypt.hash(newPassword, 10);
  await prisma.user.update({
    where: { id: user.id },
    data: { passwordHash },
  });

  res.status(204).end();
});

router.delete("/me", requireAuth, async (req, res) => {
  const { password } = req.body;
  if (typeof password !== "string") {
    return res.status(400).json({ error: "Password is required" });
  }

  const user = await prisma.user.findUnique({ where: { id: req.user.id } });
  if (!user || !(await bcrypt.compare(password, user.passwordHash))) {
    return res.status(401).json({ error: "Password is incorrect" });
  }

  await prisma.$transaction(async (tx) => {
    const ownedProjects = await tx.project.findMany({
      where: { ownerId: user.id },
      select: { id: true },
    });
    const ownedProjectIds = ownedProjects.map((project) => project.id);

    const ownedTasks = await tx.task.findMany({
      where: { projectId: { in: ownedProjectIds } },
      select: { id: true },
    });
    const ownedTaskIds = ownedTasks.map((task) => task.id);

    const authoredComments = await tx.comment.findMany({
      where: { userId: user.id },
      select: { id: true },
    });
    const authoredCommentIds = authoredComments.map((comment) => comment.id);

    await tx.notification.deleteMany({
      where: {
        OR: [
          { userId: user.id },
          { taskId: { in: ownedTaskIds } },
          { commentId: { in: authoredCommentIds } },
        ],
      },
    });
    await tx.comment.deleteMany({
      where: {
        OR: [
          { userId: user.id },
          { taskId: { in: ownedTaskIds } },
        ],
      },
    });
    await tx.task.deleteMany({ where: { projectId: { in: ownedProjectIds } } });
    await tx.membership.deleteMany({
      where: {
        OR: [
          { userId: user.id },
          { projectId: { in: ownedProjectIds } },
        ],
      },
    });
    await tx.project.deleteMany({ where: { id: { in: ownedProjectIds } } });
    await tx.user.delete({ where: { id: user.id } });
  });

  res.status(204).end();
});

export default router;
