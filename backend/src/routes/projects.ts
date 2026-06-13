import { Router } from 'express';
import { prisma } from '../prisma';
const router = Router();
router.get('/', async (req, res) => res.json(await prisma.project.findMany({ include: { members: { include: { member: true } } } })));
router.post('/', async (req, res) => { const { name, startDate, endDate, managerId, architectId, projectType } = req.body; res.json(await prisma.project.create({ data: { name, startDate: new Date(startDate), endDate: new Date(endDate), managerId, architectId, projectType } })); });
router.put('/:id', async (req, res) => { const { name, startDate, endDate, managerId, architectId, projectType } = req.body; res.json(await prisma.project.update({ where: { id: parseInt(req.params.id) }, data: { name, startDate: new Date(startDate), endDate: new Date(endDate), managerId, architectId, projectType } })); });
router.delete('/:id', async (req, res) => { await prisma.project.delete({ where: { id: parseInt(req.params.id) } }); res.json({ success: true }); });
export default router;