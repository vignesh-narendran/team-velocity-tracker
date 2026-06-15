const fs = require('fs');

let content = fs.readFileSync('frontend/src/pages/DsuView.tsx', 'utf8');

const insertPoint = '<div className="grid gap-2"> <Label>Target Completion Date</Label>';
content = content.replace(insertPoint, `<div className="grid gap-2"> <Label>Current Stage</Label> <select required className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm" value={formData.stage} onChange={e => setFormData({ ...formData, stage: e.target.value })}> <option value="">Select Stage</option> {storyStages.map((s: string) => <option key={s} value={s}>{s}</option>)} </select> </div> ${insertPoint}`);

fs.writeFileSync('frontend/src/pages/DsuView.tsx', content);
