const fs = require('fs');

let content = fs.readFileSync('frontend/src/pages/StoriesView.tsx', 'utf8');

const fields = ['frontend', 'backend', 'qa', 'author'];

for (const field of fields) {
  // Start
  content = content.replace(
    new RegExp('<Input type="date" value=\\{formData\\.' + field + 'Start \\? formData\\.' + field + 'Start\\.split\\(\\\'T\\\'\\)\\[0\\] : \\\'\\\'\\} onChange=\\{e => setFormData\\(\\{ \\.\\.\\.formData, ' + field + 'Start: e\\.target\\.value \\}\\)\\} \\/>', 'g'),
    `<Input type="date" min={formData.proposedStart ? formData.proposedStart.split('T')[0] : ''} max={formData.proposedEnd ? formData.proposedEnd.split('T')[0] : ''} value={formData.${field}Start ? formData.${field}Start.split('T')[0] : ''} onChange={e => setFormData({ ...formData, ${field}Start: e.target.value })} />`
  );

  // End
  content = content.replace(
    new RegExp('<Input type="date" value=\\{formData\\.' + field + 'End \\? formData\\.' + field + 'End\\.split\\(\\\'T\\\'\\)\\[0\\] : \\\'\\\'\\} onChange=\\{e => setFormData\\(\\{ \\.\\.\\.formData, ' + field + 'End: e\\.target\\.value \\}\\)\\} \\/>', 'g'),
    `<Input type="date" min={formData.proposedStart ? formData.proposedStart.split('T')[0] : ''} max={formData.proposedEnd ? formData.proposedEnd.split('T')[0] : ''} value={formData.${field}End ? formData.${field}End.split('T')[0] : ''} onChange={e => setFormData({ ...formData, ${field}End: e.target.value })} />`
  );
}

fs.writeFileSync('frontend/src/pages/StoriesView.tsx', content);
