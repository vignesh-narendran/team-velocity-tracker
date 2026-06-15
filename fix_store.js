const fs = require('fs');
let content = fs.readFileSync('frontend/src/store.ts', 'utf8');
content = content.replace('complexities: string; spToHours: number;', 'complexities: string; storyStages: string; spToHours: number;');
fs.writeFileSync('frontend/src/store.ts', content);
