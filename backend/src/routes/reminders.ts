import { Router } from 'express';
import { prisma } from '../prisma';

const router = Router();

router.get('/', async (req, res) => {
  try {
    const reminders = await prisma.reminder.findMany({
      include: { member: true, story: true },
      orderBy: { dueDate: 'asc' }
    });
    res.json(reminders);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch reminders' });
  }
});

router.post('/', async (req, res) => {
  try {
    const { title, description, dueDate, priority, memberId, storyId } = req.body;
    const reminder = await prisma.reminder.create({
      data: {
        title,
        description: description || null,
        dueDate: new Date(dueDate),
        priority: priority || 'medium',
        memberId: memberId || null,
        storyId: storyId || null
      },
      include: { member: true, story: true }
    });
    res.json(reminder);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create reminder' });
  }
});

router.put('/:id', async (req, res) => {
  try {
    const { title, description, dueDate, priority, memberId, storyId, completed } = req.body;
    const reminder = await prisma.reminder.update({
      where: { id: parseInt(req.params.id) },
      data: {
        title,
        description: description || null,
        dueDate: new Date(dueDate),
        priority: priority || 'medium',
        memberId: memberId || null,
        storyId: storyId || null,
        completed: completed || false
      },
      include: { member: true, story: true }
    });
    res.json(reminder);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update reminder' });
  }
});

router.patch('/:id/toggle', async (req, res) => {
  try {
    const reminder = await prisma.reminder.findUnique({
      where: { id: parseInt(req.params.id) }
    });
    if (!reminder) {
      return res.status(404).json({ error: 'Reminder not found' });
    }
    const updated = await prisma.reminder.update({
      where: { id: parseInt(req.params.id) },
      data: { completed: !reminder.completed },
      include: { member: true, story: true }
    });
    res.json(updated);
  } catch (error) {
    res.status(500).json({ error: 'Failed to toggle reminder' });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    await prisma.reminder.delete({
      where: { id: parseInt(req.params.id) }
    });
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete reminder' });
  }
});

export default router;
