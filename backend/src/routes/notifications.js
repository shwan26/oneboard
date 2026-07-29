import { Router } from "express";
import prisma from "../lib/prisma.js";
import { requireAuth } from "../middleware/auth.js";

const router = Router();
router.use(requireAuth);

// GET /api/notifications — recent notifications for the logged-in user
router.get("/", async (req, res) => {
  const notifications = await prisma.notification.findMany({
    where: { userId: req.user.id },
    orderBy: { createdAt: "desc" },
    take: 30,
    include: { task: { select: { id: true, title: true, projectId: true } } },
  });
  res.json(notifications);
});

// PATCH /api/notifications/:id — mark one as read
router.patch("/:id", async (req, res) => {
  const notification = await prisma.notification.update({
    where: { id: req.params.id },
    data: { read: true },
  });
  res.json(notification);
});

export default router;