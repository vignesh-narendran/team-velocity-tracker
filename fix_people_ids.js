const fs = require('fs');

let content = fs.readFileSync('frontend/src/components/GanttChart.tsx', 'utf8');

const oldMapLogic = `        if (!peopleMap.has(assignment.id)) {
          peopleMap.set(assignment.id, { name: assignment.name, tasks: [] });
        }
        peopleMap.get(assignment.id).tasks.push({ story: s, type: assignment.type, start: assignment.start, end: assignment.end });`;

const newMapLogic = `        if (!peopleMap.has(assignment.id)) {
          peopleMap.set(assignment.id, { id: assignment.id, name: assignment.name, tasks: [] });
        }
        peopleMap.get(assignment.id).tasks.push({ story: s, type: assignment.type, start: assignment.start, end: assignment.end });`;

content = content.replace(oldMapLogic, newMapLogic);
fs.writeFileSync('frontend/src/components/GanttChart.tsx', content);
