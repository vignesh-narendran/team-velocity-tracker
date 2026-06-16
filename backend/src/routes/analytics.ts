import { Router } from 'express';
import { prisma } from '../prisma';

const daysBetween = (a: Date, b: Date) =>
  Math.round((b.getTime() - a.getTime()) / (1000 * 60 * 60 * 24));

const fibonacciNumbers = [1, 2, 3, 5, 8, 13, 21, 34, 55, 89, 144, 233, 377];

const roundToNearestFibonacci = (num: number): number => {
  if (num <= 0) return 0;
  if (num <= 1) return 1;
  return fibonacciNumbers.reduce((prev, curr) =>
    Math.abs(curr - num) < Math.abs(prev - num) ? curr : prev
  );
};

// Count working days in a range excluding weekends and member leave days
const getWorkingDays = (
  startDate: Date,
  endDate: Date,
  leaves: { startDate: Date | string; endDate: Date | string }[]
): number => {
  let count = 0;
  const current = new Date(startDate);
  current.setHours(0, 0, 0, 0);
  const end = new Date(endDate);
  end.setHours(0, 0, 0, 0);

  while (current <= end) {
    const day = current.getDay();
    const isWeekend = day === 0 || day === 6;
    if (!isWeekend) {
      const onLeave = leaves.some(l => {
        const ls = new Date(l.startDate); ls.setHours(0, 0, 0, 0);
        const le = new Date(l.endDate); le.setHours(0, 0, 0, 0);
        return current >= ls && current <= le;
      });
      if (!onLeave) count++;
    }
    current.setDate(current.getDate() + 1);
  }
  return count;
};

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
    // Story points for this member in the active sprint (pro-rated by days assigned)
    const sprintStories = activeSprint?.stories ?? [];
    const memberStoryPoints = sprintStories
      .reduce((acc, s) => {
        let roleStartDate = null;
        let roleEndDate = null;

        if (s.frontendId === member.id) {
          roleStartDate = s.frontendStart;
          roleEndDate = s.frontendEnd;
        } else if (s.backendId === member.id) {
          roleStartDate = s.backendStart;
          roleEndDate = s.backendEnd;
        } else if (s.qaId === member.id) {
          roleStartDate = s.qaStart;
          roleEndDate = s.qaEnd;
        } else if (s.authorId === member.id) {
          roleStartDate = s.authorStart;
          roleEndDate = s.authorEnd;
        }

        if (roleStartDate && roleEndDate) {
          const storyDays = daysBetween(new Date(s.proposedStart), new Date(s.proposedEnd)) + 1;
          const roleDays = daysBetween(new Date(roleStartDate), new Date(roleEndDate)) + 1;
          const proRatedSP = (roleDays / storyDays) * s.storyPoints;
          return acc + proRatedSP;
        }

        return acc;
      }, 0);

    // Round total allocated SP to nearest Fibonacci number
    const memberStoryPointsRounded = roundToNearestFibonacci(memberStoryPoints);

    // Available SP = working days in sprint (excl. weekends + this member's leaves) * 0.9, rounded to nearest Fib
    let availableSP = 0;
    if (activeSprint) {
      const workingDays = getWorkingDays(
        new Date(activeSprint.startDate),
        new Date(activeSprint.endDate),
        member.leaves
      );
      availableSP = roundToNearestFibonacci(workingDays * 0.9);
    }

    // Check if on leave today
    const onLeave = member.leaves.some(l => new Date(l.startDate) <= today && new Date(l.endDate) >= today);
    if (onLeave) return { member, status: 'leave', color: 'gray', allLeaves: member.leaves, storyPoints: memberStoryPointsRounded, availableSP };

    let isBusyToday = false;

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
        }
      }
    }

    if (isBusyToday) {
      return { member, status: 'busy', color: 'red', allLeaves: member.leaves, storyPoints: memberStoryPointsRounded, availableSP };
    }

    return { member, status: 'free', color: 'green', allLeaves: member.leaves, storyPoints: memberStoryPointsRounded, availableSP };
  });

  res.json(availability);
});

export default router;
