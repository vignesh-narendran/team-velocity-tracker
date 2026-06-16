import { Router } from 'express';
import { prisma } from '../prisma';

const router = Router();

const isDoneStage = (stage: string | null | undefined) =>
  ['done', 'complete'].includes(stage?.toLowerCase() ?? '');

router.get('/insights', async (req, res) => {
  const stories = await prisma.story.findMany({
    include: {
      dsus: { orderBy: { date: 'desc' } },
      sprint: true
    }
  });

  const blockers = stories.filter(s => s.stage === 'blocked' || s.dsus.some(d => d.isBlocked));

  const driftingTasks = stories.filter(s => {
    if (isDoneStage(s.stage)) return false;
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

  // Find active sprint for story points calculation
  const activeSprint = await prisma.sprint.findFirst({
    where: { status: 'Active' },
    include: { stories: true }
  });

  const allStories = await prisma.story.findMany({
    include: { dsus: { orderBy: { date: 'desc' }, take: 1 } }
  });

  // Active stories = not done/complete
  const activeStories = allStories.filter(s => !isDoneStage(s.stage));

  const today = new Date();

  const availability = members.map(member => {
    // Story points for this member in the active sprint
    const sprintStories = activeSprint?.stories ?? [];
    const memberStoryPoints = sprintStories
      .filter(s =>
        s.frontendId === member.id ||
        s.backendId === member.id ||
        s.qaId === member.id ||
        s.authorId === member.id
      )
      .reduce((acc, s) => acc + s.storyPoints, 0);

    // Check if on leave today
    const onLeave = member.leaves.some(l => new Date(l.startDate) <= today && new Date(l.endDate) >= today);
    if (onLeave) return { member, status: 'leave', color: 'gray', allLeaves: member.leaves, storyPoints: memberStoryPoints };

    let isBusyToday = false;
    let endingSoon = false;

    for (const s of activeStories) {
      let mStart, mEnd;
      if (s.frontendId === member.id) { mStart = s.frontendStart; mEnd = s.frontendEnd; }
      else if (s.backendId === member.id) { mStart = s.backendStart; mEnd = s.backendEnd; }
      else if (s.qaId === member.id) { mStart = s.qaStart; mEnd = s.qaEnd; }
      else if (s.authorId === member.id) { mStart = s.authorStart; mEnd = s.authorEnd; }

      if (mStart && mEnd) {
        const start = new Date(mStart);
        const end = new Date(mEnd);

        const todayAtMidnight = new Date(today);
        todayAtMidnight.setHours(0, 0, 0, 0);
        const startAtMidnight = new Date(start);
        startAtMidnight.setHours(0, 0, 0, 0);
        const endAtMidnight = new Date(end);
        endAtMidnight.setHours(0, 0, 0, 0);

        if (todayAtMidnight >= startAtMidnight && todayAtMidnight <= endAtMidnight) {
          isBusyToday = true;
          const daysDiff = (endAtMidnight.getTime() - todayAtMidnight.getTime()) / (1000 * 3600 * 24);
          if (daysDiff >= 0 && daysDiff <= 2) endingSoon = true;
        }
      }
    }

    if (isBusyToday) {
      if (endingSoon) return { member, status: 'about-to-free', color: 'amber', allLeaves: member.leaves, storyPoints: memberStoryPoints };
      return { member, status: 'busy', color: 'red', allLeaves: member.leaves, storyPoints: memberStoryPoints };
    }

    return { member, status: 'free', color: 'green', allLeaves: member.leaves, storyPoints: memberStoryPoints };
  });

  res.json(availability);
});

export default router;
