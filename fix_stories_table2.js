const fs = require('fs');
let content = fs.readFileSync('frontend/src/pages/StoriesView.tsx', 'utf8');

content = content.replace('    </Card>\n      <StoryTimeline story={timelineStory} open={timelineOpen} onOpenChange={setTimelineOpen} />\n  );', '    </Card>\n      <StoryTimeline story={timelineStory} open={timelineOpen} onOpenChange={setTimelineOpen} />\n    </>\n  );');

content = content.replace('  return (\n    <Card>', '  return (\n    <>\n    <Card>');

fs.writeFileSync('frontend/src/pages/StoriesView.tsx', content);
