const fs = require('fs');

let content = fs.readFileSync('frontend/src/pages/SettingsView.tsx', 'utf8');

content = content.replace('complexities: \'\',', 'complexities: \'\',\n    storyStages: \'\',');
content = content.replace('complexities: settings.complexities,', 'complexities: settings.complexities,\n        storyStages: settings.storyStages,');

const insertPoint = '<div className="grid gap-2">\n            <Label>1 Story Point = X Hours</Label>';
content = content.replace(insertPoint, `<div className="grid gap-2">\n            <Label>Story Stages (JSON Array)</Label>\n            <Input\n              value={formData.storyStages}\n              onChange={e => setFormData({ ...formData, storyStages: e.target.value })}\n            />\n          </div>\n          ${insertPoint}`);

fs.writeFileSync('frontend/src/pages/SettingsView.tsx', content);
