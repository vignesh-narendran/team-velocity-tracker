const fs = require('fs');

let content = fs.readFileSync('frontend/src/pages/StoriesView.tsx', 'utf8');
content = content.replace(/frontendStart: '', frontendEnd: '', backendId: '', backendStart: '', backendEnd: '',\\n    qaId: '', qaStart: '', qaEnd: '', authorId: '', authorStart: '', authorEnd: '',/g, "frontendStart: '', frontendEnd: '', backendId: '', backendStart: '', backendEnd: '', qaId: '', qaStart: '', qaEnd: '', authorId: '', authorStart: '', authorEnd: '',");

// Remove the nested grid from inputs
content = content.replace(/<div className="grid gap-2">\s*<div className="col-span-2 grid grid-cols-2 gap-4">\s*<div className="grid gap-2">\s*<Label>(.*?) Start<\/Label>\s*<Input type="date" value=\{formData\.(.*?)Start \? formData\.(.*?)Start\.split\('T'\)\[0\] : ''\} onChange=\{e => setFormData\(\{ \.\.\.formData, (.*?)Start: e\.target\.value \}\)\} \/>\s*<\/div>\s*<div className="grid gap-2">\s*<Label>(.*?) End<\/Label>\s*<Input type="date" value=\{formData\.(.*?)End \? formData\.(.*?)End\.split\('T'\)\[0\] : ''\} onChange=\{e => setFormData\(\{ \.\.\.formData, (.*?)End: e\.target\.value \}\)\} \/>\s*<\/div>\s*<\/div>\s*<\/div>/g,
  (match, p1, p2, p3, p4, p5, p6, p7, p8) => {
    return `
                      <div className="col-span-2 grid grid-cols-2 gap-4">
                      <div className="grid gap-2">
                        <Label>${p1} Start</Label>
                        <Input type="date" value={formData.${p2}Start ? formData.${p3}Start.split('T')[0] : ''} onChange={e => setFormData({ ...formData, ${p4}Start: e.target.value })} />
                      </div>
                      <div className="grid gap-2">
                        <Label>${p5} End</Label>
                        <Input type="date" value={formData.${p6}End ? formData.${p7}End.split('T')[0] : ''} onChange={e => setFormData({ ...formData, ${p8}End: e.target.value })} />
                      </div>
                    </div>
    `;
});

fs.writeFileSync('frontend/src/pages/StoriesView.tsx', content);
