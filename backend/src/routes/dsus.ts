import { Router } from 'express';
import { prisma } from '../prisma';
const router = Router();
router.get('/', async (req, res) => res.json(await prisma.dsuUpdate.findMany({ include: { story: true, member: true } })));
router.post('/', async (req, res) => { const { storyId, memberId, statusUpdate, targetCompletion, isBlocked, stage } = req.body; const dsu = await prisma.dsuUpdate.create({ data: { storyId, memberId, statusUpdate, targetCompletion: new Date(targetCompletion), isBlocked: isBlocked || false, stageUpdate: stage } }); if (stage) { await prisma.story.update({ where: { id: storyId }, data: { stage: stage } }); } else if (isBlocked) { await prisma.story.update({ where: { id: storyId }, data: { stage: 'blocked' } }); } res.json(dsu); });
router.delete('/:id', async (req, res) => { await prisma.dsuUpdate.delete({ where: { id: parseInt(req.params.id) } }); res.json({ success: true }); });
export default router;