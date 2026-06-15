const fs = require('fs');

// Fix StatusDot
let dotContent = fs.readFileSync('frontend/src/components/StatusDot.tsx', 'utf8');
dotContent = dotContent.replace("import { useState, useEffect } from 'react';", "");
fs.writeFileSync('frontend/src/components/StatusDot.tsx', dotContent);

// Fix StoryTimeline
let timelineContent = fs.readFileSync('frontend/src/components/StoryTimeline.tsx', 'utf8');
timelineContent = timelineContent.replace("map((dsu: any, i: number) => (", "map((dsu: any) => (");
fs.writeFileSync('frontend/src/components/StoryTimeline.tsx', timelineContent);
