const fs = require('fs');
let content = fs.readFileSync('frontend/src/components/GanttChart.tsx', 'utf8');

if (!content.includes('import StatusDot')) {
  content = content.replace("import { differenceInDays, addDays, format, isWeekend } from 'date-fns';", "import { differenceInDays, addDays, format, isWeekend } from 'date-fns';\nimport StatusDot from './StatusDot';");
}

content = content.replace(
  "{story.storyNumber} - {story.name}",
  "<div className=\"flex items-center gap-2\"><StatusDot story={story} /> {story.storyNumber}</div>"
);

fs.writeFileSync('frontend/src/components/GanttChart.tsx', content);
