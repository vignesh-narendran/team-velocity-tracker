import { Router } from 'express';
import { prisma } from '../prisma';
const router = Router();
router.get('/', async (req, res) => res.json(await prisma.leave.findMany({ include: { member: true } })));
router.post('/', async (req, res) => { const { memberIds, projectId, startDate, endDate, reason } = req.body; const ls = []; if (memberIds && memberIds.length > 0) { for (const id of memberIds) ls.push(await prisma.leave.create({ data: { memberId: id, projectId, startDate: new Date(startDate), endDate: new Date(endDate), reason } })); } else { ls.push(await prisma.leave.create({ data: { projectId, startDate: new Date(startDate), endDate: new Date(endDate), reason } })); } res.json(ls); });
router.delete('/:id', async (req, res) => { await prisma.leave.delete({ where: { id: parseInt(req.params.id) } }); res.json({ success: true }); });
export default router;