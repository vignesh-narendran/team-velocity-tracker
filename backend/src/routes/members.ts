import { Router } from 'express';
import { prisma } from '../prisma';
const router = Router();
router.get('/', async (req, res) => res.json(await prisma.member.findMany()));
router.post('/', async (req, res) => res.json(await prisma.member.create({ data: req.body })));
router.put('/:id', async (req, res) => res.json(await prisma.member.update({ where: { id: parseInt(req.params.id) }, data: req.body })));
router.delete('/:id', async (req, res) => { await prisma.member.delete({ where: { id: parseInt(req.params.id) } }); res.json({ success: true }); });
export default router;