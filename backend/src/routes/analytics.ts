import { Router } from 'express';
import { prisma } from '../prisma';

const router = Router();

router.get('/insights', async (req, res) => {
  const stories = await prisma.story.findMany({
    include: {
      dsus: { orderBy: { date: 'desc' } },
      sprint: true
    }
  });

  const blockers = stories.filter(s => s.stage === 'blocked' || s.dsus.some(d => d.isBlocked));

  const driftingTasks = stories.filter(s => {
    if (s.stage === 'complete' || s.stage === 'done') return false;
    const latestDsu = s.dsus[0];
    if (latestDsu && new Date(latestDsu.targetCompletion) > new Date(s.proposedEnd)) {
      return true;
    }
    const today = new Date();
    if (today > new Date(s.proposedEnd)) return true;
    return false;
  });

  res.json({ blockers, driftingTasks });
});

router.get('/team-availability', async (req, res) => {
  const members = await prisma.member.findMany({
    include: { leaves: true }
  });

  const activeStories = await prisma.story.findMany({
    where: { stage: { notIn: ['complete', 'done'] } },
    include: { dsus: { orderBy: { date: 'desc' }, take: 1 } }
  });

  const today = new Date();

  const availability = members.map(member => {
    // Check if on leave today
    const onLeave = member.leaves.some(l => new Date(l.startDate) <= today && new Date(l.endDate) >= today);
    if (onLeave) return { member, status: 'leave', color: 'gray', allLeaves: member.leaves };

    const memberStories = activeStories.filter(s =>
      s.frontendId === member.id || s.backendId === member.id || s.qaId === member.id || s.authorId === member.id
    );

    if (memberStories.length === 0) return { member, status: 'free', color: 'green', allLeaves: member.leaves };

    let endingSoon = false;
    for (const story of memberStories) {
      const targetDate = story.dsus[0] ? new Date(story.dsus[0].targetCompletion) : new Date(story.proposedEnd);
      const daysDiff = (targetDate.getTime() - today.getTime()) / (1000 * 3600 * 24);
      if (daysDiff >= 0 && daysDiff <= 2) {
        endingSoon = true;
      }
    }

    if (endingSoon) return { member, status: 'about-to-free', color: 'amber', allLeaves: member.leaves };

    return { member, status: 'busy', color: 'red', allLeaves: member.leaves };
  });

  res.json(availability);
});

export default router;
