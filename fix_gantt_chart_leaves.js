const fs = require('fs');

let content = fs.readFileSync('frontend/src/components/GanttChart.tsx', 'utf8');

if(!content.includes("export default function GanttChart({ stories, sprintStart, sprintEnd, viewType, availability }: GanttProps)")) {
  content = content.replace("export default function GanttChart({ stories, sprintStart, sprintEnd, viewType }: GanttProps)", "export default function GanttChart({ stories, sprintStart, sprintEnd, viewType, availability }: GanttProps)");
}

fs.writeFileSync('frontend/src/components/GanttChart.tsx', content);
