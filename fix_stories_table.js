const fs = require('fs');

let content = fs.readFileSync('frontend/src/pages/StoriesView.tsx', 'utf8');

if(!content.includes('import StoryTimeline')) {
  content = content.replace("import { Label } from '../components/ui/label';", "import { Label } from '../components/ui/label';\nimport StoryTimeline from '../components/StoryTimeline';\nimport StatusDot from '../components/StatusDot';");
}

if (!content.includes('timelineStory')) {
  content = content.replace("const [overloadWarning, setOverloadWarning] = useState<string | null>(null);", "const [overloadWarning, setOverloadWarning] = useState<string | null>(null);\n  const [timelineStory, setTimelineStory] = useState<any>(null);\n  const [timelineOpen, setTimelineOpen] = useState(false);");
}

// Update table to show status dot
content = content.replace(/<TableCell className="font-medium">\{s\.name\}<\/TableCell>/g, '<TableCell className="font-medium"><div className="flex items-center gap-2"><StatusDot story={s} /> {s.name}</div></TableCell>');

// Add Timeline button
content = content.replace(/<Button variant="destructive"/g, '<Button variant="outline" size="sm" className="mr-2" onClick={() => { setTimelineStory(s); setTimelineOpen(true); }}>Timeline</Button>\n                  <Button variant="destructive"');

// Add timeline component
content = content.replace(/<\/Card>/g, '</Card>\n      <StoryTimeline story={timelineStory} open={timelineOpen} onOpenChange={setTimelineOpen} />');

fs.writeFileSync('frontend/src/pages/StoriesView.tsx', content);
