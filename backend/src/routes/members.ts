import { Router } from 'express';
import { prisma } from '../prisma';

const router = Router();

router.get('/', async (req, res) => {
  const members = await prisma.member.findMany({
    include: {
      projects: { include: { project: true } }
    }
  });
  res.json(members);
});

router.post('/', async (req, res) => {
  const { name, role, projectId, allocationStart, allocationEnd } = req.body;

  const member = await prisma.member.create({
    data: { name, role }
  });

  if (projectId) {
    await prisma.memberProject.create({
      data: {
        memberId: member.id,
        projectId: parseInt(projectId),
        allocationStart: new Date(allocationStart),
        allocationEnd: new Date(allocationEnd)
      }
    });
  }

  res.json(member);
});

router.put('/:id', async (req, res) => {
  const { name, role, projectId, allocationStart, allocationEnd } = req.body;
  const memberId = parseInt(req.params.id);

  const member = await prisma.member.update({
    where: { id: memberId },
    data: { name, role }
  });

  // Handle single project allocation for simplicity in the onboarding form
  if (projectId) {
    // Upsert equivalent for the project association
    const existing = await prisma.memberProject.findFirst({ where: { memberId, projectId: parseInt(projectId) } });
    if (existing) {
      await prisma.memberProject.update({
        where: { id: existing.id },
        data: {
          allocationStart: new Date(allocationStart),
          allocationEnd: new Date(allocationEnd)
        }
      });
    } else {
      await prisma.memberProject.create({
        data: {
          memberId,
          projectId: parseInt(projectId),
          allocationStart: new Date(allocationStart),
          allocationEnd: new Date(allocationEnd)
        }
      });
    }
  }

  res.json(member);
});

router.delete('/:id', async (req, res) => {
  const id = parseInt(req.params.id);
  await prisma.memberProject.deleteMany({ where: { memberId: id } });
  await prisma.memberSprint.deleteMany({ where: { memberId: id } });
  await prisma.member.delete({ where: { id } });
  res.json({ success: true });
});

export default router;
