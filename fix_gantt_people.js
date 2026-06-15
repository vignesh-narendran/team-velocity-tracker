const fs = require('fs');

let content = fs.readFileSync('frontend/src/components/GanttChart.tsx', 'utf8');

const oldPeopleRow = `    const peopleMap = new Map();
    stories.forEach(s => {
      [
        { id: s.frontendId, name: s.frontendMember?.name || 'Unassigned (FE)', type: 'frontend', start: s.frontendStart, end: s.frontendEnd },
        { id: s.backendId, name: s.backendMember?.name || 'Unassigned (BE)', type: 'backend', start: s.backendStart, end: s.backendEnd },
        { id: s.qaId, name: s.qaMember?.name || 'Unassigned (QA)', type: 'qa', start: s.qaStart, end: s.qaEnd },
        { id: s.authorId, name: s.authorMember?.name || 'Unassigned (Auth)', type: 'author', start: s.authorStart, end: s.authorEnd },
      ].forEach(assignment => {
        if (!assignment.id || !assignment.start || !assignment.end) return;
        if (!peopleMap.has(assignment.id)) {
          peopleMap.set(assignment.id, { name: assignment.name, tasks: [] });
        }
        peopleMap.get(assignment.id).tasks.push({ story: s, type: assignment.type, start: assignment.start, end: assignment.end });
      });
    });`;

// Wait, the API call returns stories with just IDs mostly, so we need to maybe fetch members or use names if provided. Wait, in stories endpoint, does it include members?
// Let's check backend/src/routes/stories.ts
