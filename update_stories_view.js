const fs = require('fs');

let content = fs.readFileSync('frontend/src/pages/StoriesView.tsx', 'utf8');

// Replace remaining hours inputs with start/end date inputs
const hoursRegex = /<Label>(.*?) Hours<\/Label>\s*<Input type="number" value=\{formData\.(.*?)Hours\} onChange=\{e => setFormData\(\{ \.\.\.formData, \2Hours: e\.target\.value \}\)\} \/>/g;

content = content.replace(hoursRegex, (match, labelText, fieldPrefix) => {
    return `<div className="col-span-2 grid grid-cols-2 gap-4">
                      <div className="grid gap-2">
                        <Label>${labelText} Start</Label>
                        <Input type="date" value={formData.${fieldPrefix}Start ? formData.${fieldPrefix}Start.split('T')[0] : ''} onChange={e => setFormData({ ...formData, ${fieldPrefix}Start: e.target.value })} />
                      </div>
                      <div className="grid gap-2">
                        <Label>${labelText} End</Label>
                        <Input type="date" value={formData.${fieldPrefix}End ? formData.${fieldPrefix}End.split('T')[0] : ''} onChange={e => setFormData({ ...formData, ${fieldPrefix}End: e.target.value })} />
                      </div>
                    </div>`;
});

// Update the table row to include Edit and Delete buttons
const tableRowRegex = /<TableRow key=\{s\.id\}>([\s\S]*?)<\/TableRow>/g;

let actionHeaderAdded = false;
content = content.replace(/<TableHead>Complexity<\/TableHead>/g, "<TableHead>Complexity</TableHead>\n              <TableHead>Actions</TableHead>");

content = content.replace(tableRowRegex, (match, inner) => {
    return `<TableRow key={s.id}>${inner}
                <TableCell>
                  <Button variant="outline" size="sm" className="mr-2" onClick={() => { setFormData({...s}); setOpen(true); }}>Edit</Button>
                  <Button variant="destructive" size="sm" onClick={async () => { if(confirm('Are you sure?')) { await axios.delete(\`\${API_URL}/stories/\${s.id}\`); fetchData(); } }}>Delete</Button>
                </TableCell>
              </TableRow>`;
});


fs.writeFileSync('frontend/src/pages/StoriesView.tsx', content);
