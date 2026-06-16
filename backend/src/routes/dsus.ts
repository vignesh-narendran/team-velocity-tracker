import { Router } from 'express';
import { prisma } from '../prisma';
const router = Router();

router.get('/', async (req, res) => res.json(await prisma.dsuUpdate.findMany({ include: { story: true, member: true } })));

router.post('/', async (req, res) => {
  const { storyId, memberId, statusUpdate, targetCompletion, isBlocked, stage } = req.body;

  const dsu = await prisma.dsuUpdate.create({
    data: { storyId, memberId, statusUpdate, targetCompletion: new Date(targetCompletion), isBlocked: isBlocked || false, stageUpdate: stage }
  });

  if (isBlocked) {
    await prisma.story.update({ where: { id: storyId }, data: { stage: 'blocked' } });
  } else if (stage) {
    const isDone = (s: string | null | undefined) => s?.toLowerCase() === 'done';

    const story = await prisma.story.findUnique({
      where: { id: storyId },
      include: { dsus: { orderBy: { date: 'desc' } } }
    });

    if (story) {
      const assignedRoles = new Set<number>();
      if (story.frontendId) assignedRoles.add(story.frontendId);
      if (story.backendId) assignedRoles.add(story.backendId);
      if (story.qaId) assignedRoles.add(story.qaId);
      if (story.authorId) assignedRoles.add(story.authorId);

      if (assignedRoles.size > 0) {
        // Get latest DSU per member (dsus ordered desc so first = latest)
        const latestDsuPerMember = new Map<number, any>();
        for (const d of story.dsus) {
          if (!latestDsuPerMember.has(d.memberId)) {
            latestDsuPerMember.set(d.memberId, d);
          }
        }

        const allDone = Array.from(assignedRoles).every(roleId => {
          const memberDsu = latestDsuPerMember.get(roleId);
          return memberDsu && isDone(memberDsu.stageUpdate);
        });

        if (allDone) {
          await prisma.story.update({ where: { id: storyId }, data: { stage: 'Done' } });
        } else if (!isDone(story.stage)) {
          // Don't downgrade a fully-done story; only update if it's not already done
          await prisma.story.update({ where: { id: storyId }, data: { stage: stage } });
        }
      } else {
        await prisma.story.update({ where: { id: storyId }, data: { stage: stage } });
      }
    }
  }

  res.json(dsu);
});

router.delete('/:id', async (req, res) => {
  await prisma.dsuUpdate.delete({ where: { id: parseInt(req.params.id) } });
  res.json({ success: true });
});

export default router;
