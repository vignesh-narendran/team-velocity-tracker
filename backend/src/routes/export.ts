import { Router } from 'express';
import { prisma } from '../prisma';
const router = Router();
router.get('/csv', async (req, res) => { const projects = await prisma.project.findMany({ include: { sprints: { include: { stories: true } } } }); let csv = 'Project,Sprint,Story Number,Story Name,Stage,Complexity,Story Points,Proposed Start,Proposed End\n'; projects.forEach(p => p.sprints.forEach(sp => sp.stories.forEach(st => csv += `"${p.name}","Sprint ${sp.sprintNumber}","${st.storyNumber}","${st.name}","${st.stage}","${st.complexity}",${st.storyPoints},"${st.proposedStart.toISOString().split('T')[0]}","${st.proposedEnd.toISOString().split('T')[0]}"\n`))); res.header('Content-Type', 'text/csv'); res.attachment('export.csv'); return res.send(csv); });
export default router;