const fs = require('fs');
let content = fs.readFileSync('frontend/src/components/GanttChart.tsx', 'utf8');

// The issue might be that people without tasks are not in peopleMap, but what if they do have tasks?
// Even if they have tasks, the previous logic was:
// availability?.find(a => a.member.id === person.id)?.allLeaves?.map...
// Let's check how 'availability' is structured in DashboardView.
// DashboardView calls '/analytics/team-availability'.
// The response is an array of objects: { member: { id, name, ... }, status, color, allLeaves: [{ startDate, endDate... }] }

// In GanttChart:
// We should perhaps make sure leaves overlay properly with z-index and styles.
// And also, if a person has NO tasks but is on leave, they don't even show up in the Gantt Chart right now because we only build peopleMap from stories!
// To fix this, we need to initialize peopleMap with EVERYONE from 'availability' first, and then add their tasks.

const oldMapLogic = `    const peopleMap = new Map();
    stories.forEach(s => {`;

const newMapLogic = `    const peopleMap = new Map();
    // Initialize with all members if availability is provided
    if (availability) {
      availability.forEach(a => {
        if (a.member && a.member.id) {
          peopleMap.set(a.member.id, { id: a.member.id, name: a.member.name, tasks: [] });
        }
      });
    }

    stories.forEach(s => {`;

content = content.replace(oldMapLogic, newMapLogic);
fs.writeFileSync('frontend/src/components/GanttChart.tsx', content);
