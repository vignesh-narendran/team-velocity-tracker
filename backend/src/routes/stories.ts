import { Router } from 'express';
import { prisma } from '../prisma';
const router = Router();

function getWorkingDays(startStr: string | null, endStr: string | null): number {
  if (!startStr || !endStr) return 0;
  let start = new Date(startStr);
  let end = new Date(endStr);
  if (isNaN(start.getTime()) || isNaN(end.getTime())) return 0;
  if (start > end) return 0;

  let days = 0;
  let current = new Date(start);
  while (current <= end) {
    const day = current.getDay();
    if (day !== 0 && day !== 6) { // Skip Sunday and Saturday
      days++;
    }
    current.setDate(current.getDate() + 1);
  }
  return days;
}

function calculateStoryPoints(d: any, sph: number): number {
  const fHours = getWorkingDays(d.frontendStart, d.frontendEnd) * 8;
  const bHours = getWorkingDays(d.backendStart, d.backendEnd) * 8;
  const qHours = getWorkingDays(d.qaStart, d.qaEnd) * 8;
  const aHours = getWorkingDays(d.authorStart, d.authorEnd) * 8;

  const th = fHours + bHours + qHours + aHours;
  if (th === 0) return 0;

  const rsp = th / sph;
  const fib = [1, 2, 3, 5, 8, 13, 21, 34];
  return fib.find(f => f >= Math.ceil(rsp)) || 34;
}

router.get('/', async (req, res) => res.json(await prisma.story.findMany({ include: { dsus: true } })));

router.post('/', async (req, res) => {
  const d = req.body;
  const s = await prisma.setting.findFirst();
  const sph = s?.spToHours || 8;
  const csp = calculateStoryPoints(d, sph);

  res.json(await prisma.story.create({
    data: {
      sprintId: d.sprintId,
      storyNumber: d.storyNumber,
      name: d.name,
      stage: d.stage || 'todo',
      frontendId: d.frontendId,
      frontendStart: d.frontendStart ? new Date(d.frontendStart) : null,
      frontendEnd: d.frontendEnd ? new Date(d.frontendEnd) : null,
      backendId: d.backendId,
      backendStart: d.backendStart ? new Date(d.backendStart) : null,
      backendEnd: d.backendEnd ? new Date(d.backendEnd) : null,
      qaId: d.qaId,
      qaStart: d.qaStart ? new Date(d.qaStart) : null,
      qaEnd: d.qaEnd ? new Date(d.qaEnd) : null,
      authorId: d.authorId,
      authorStart: d.authorStart ? new Date(d.authorStart) : null,
      authorEnd: d.authorEnd ? new Date(d.authorEnd) : null,
      storyPoints: csp,
      complexity: d.complexity || 'Easy',
      proposedStart: new Date(d.proposedStart),
      proposedEnd: new Date(d.proposedEnd)
    }
  }));
});

router.put('/:id', async (req, res) => {
  const d = req.body;
  const s = await prisma.setting.findFirst();
  const sph = s?.spToHours || 8;
  const csp = calculateStoryPoints(d, sph);

  res.json(await prisma.story.update({
    where: { id: parseInt(req.params.id) },
    data: {
      storyNumber: d.storyNumber,
      name: d.name,
      stage: d.stage,
      frontendId: d.frontendId,
      frontendStart: d.frontendStart ? new Date(d.frontendStart) : null,
      frontendEnd: d.frontendEnd ? new Date(d.frontendEnd) : null,
      backendId: d.backendId,
      backendStart: d.backendStart ? new Date(d.backendStart) : null,
      backendEnd: d.backendEnd ? new Date(d.backendEnd) : null,
      qaId: d.qaId,
      qaStart: d.qaStart ? new Date(d.qaStart) : null,
      qaEnd: d.qaEnd ? new Date(d.qaEnd) : null,
      authorId: d.authorId,
      authorStart: d.authorStart ? new Date(d.authorStart) : null,
      authorEnd: d.authorEnd ? new Date(d.authorEnd) : null,
      storyPoints: csp,
      complexity: d.complexity,
      proposedStart: new Date(d.proposedStart),
      proposedEnd: new Date(d.proposedEnd)
    }
  }));
});

router.delete('/:id', async (req, res) => {
  const id = parseInt(req.params.id);
  await prisma.dsuUpdate.deleteMany({ where: { storyId: id } });
  await prisma.story.delete({ where: { id: id } });
  res.json({ success: true });
});

export default router;