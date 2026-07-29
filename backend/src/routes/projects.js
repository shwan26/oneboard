import { Router } from "express";
import prisma from "../lib/prisma.js";
import { requireAuth } from "../middleware/auth.js";

const router = Router();

// Every route below this line requires a valid token first
router.use(requireAuth);

// GET /api/projects — list only the projects the logged-in user belongs to
router.get("/", async (req, res) => {
  const memberships = await prisma.membership.findMany({
    where: { userId: req.user.id },
    include: { project: true }, // pull in the actual project data, not just the join row
    orderBy: { joinedAt: "desc" },
  });

  // Flatten it so the frontend gets a clean list of projects (with role attached)
  const projects = memberships.map((m) => ({ ...m.project, role: m.role }));
  res.json(projects);
});

// POST /api/projects — create a new project; creator becomes the owner
router.post("/", async (req, res) => {
  const { name, description } = req.body;
  if (!name) return res.status(400).json({ error: "name is required" });

  const project = await prisma.project.create({
    data: {
      name,
      description,
      ownerId: req.user.id,
      // Create the Membership row in the same operation — creator is auto-added as owner
      members: {
        create: { userId: req.user.id, role: "owner" },
      },
    },
  });

  res.status(201).json(project);
});

// GET /api/projects/:id — get one project, but only if the user is a member
router.get("/:id", async (req, res) => {
  const membership = await prisma.membership.findUnique({
    where: {
      userId_projectId: { userId: req.user.id, projectId: req.params.id },
    },
  });

  if (!membership) {
    return res.status(403).json({ error: "You are not a member of this project" });
  }

  const project = await prisma.project.findUnique({
    where: { id: req.params.id },
    include: {
      members: {
        include: { user: { select: { id: true, name: true, email: true } } },
      },
      tasks: {
        include: {
          comments: {
            include: { user: { select: { id: true, name: true } } },
            orderBy: { createdAt: "asc" },
          },
        },
        orderBy: { createdAt: "asc" },
      },
    },
  });

  res.json(project);
});

router.post("/:id/members", async (req, res) => {
  const { email } = req.body;
  if (!email) return res.status(400).json({ error: "email is required" });

  const membership = await prisma.membership.findUnique({
    where: { userId_projectId: { userId: req.user.id, projectId: req.params.id } },
  });
  if (!membership) {
    return res.status(403).json({ error: "You are not a member of this project" });
  }

  const invitedUser = await prisma.user.findUnique({ where: { email } });
  if (!invitedUser) {
    return res.status(404).json({ error: "No account found with that email" });
  }

  const newMembership = await prisma.membership.upsert({
    where: { userId_projectId: { userId: invitedUser.id, projectId: req.params.id } },
    update: {},
    create: { userId: invitedUser.id, projectId: req.params.id, role: "member" },
    include: { user: { select: { id: true, name: true, email: true } } },
  });

  res.status(201).json(newMembership);
});

// DELETE /api/projects/:id — remove a project entirely (owner only)
router.delete("/:id", async (req, res) => {
  const membership = await prisma.membership.findUnique({
    where: { userId_projectId: { userId: req.user.id, projectId: req.params.id } },
  });
  if (!membership) {
    return res.status(403).json({ error: "You are not a member of this project" });
  }
  if (membership.role !== "owner") {
    return res.status(403).json({ error: "Only the room owner can delete it" });
  }

  const taskIds = (
    await prisma.task.findMany({ where: { projectId: req.params.id }, select: { id: true } })
  ).map((t) => t.id);

  await prisma.comment.deleteMany({ where: { taskId: { in: taskIds } } });
  await prisma.task.deleteMany({ where: { projectId: req.params.id } });
  await prisma.membership.deleteMany({ where: { projectId: req.params.id } });
  await prisma.project.delete({ where: { id: req.params.id } });

  req.app.get("io").to(`project:${req.params.id}`).emit("project:deleted", { id: req.params.id });
  res.status(204).end();
});

export default router;