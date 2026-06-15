const fs = require('fs');

let content = fs.readFileSync('frontend/src/pages/ProjectsView.tsx', 'utf8');

// Update table header
content = content.replace(/<TableHead>Type<\/TableHead>/g, "<TableHead>Type</TableHead>\n              <TableHead>Actions</TableHead>");

// Update table rows
content = content.replace(/<TableCell>\{p\.projectType\}<\/TableCell>\s*<\/TableRow>/g,
  `<TableCell>{p.projectType}</TableCell>
                <TableCell>
                  <Button variant="outline" size="sm" className="mr-2" onClick={() => { setFormData({...p, managerId: p.managerId || '', architectId: p.architectId || ''}); setOpen(true); }}>Edit</Button>
                  <Button variant="destructive" size="sm" onClick={async () => { if(confirm('Are you sure?')) { await axios.delete(\`\${API_URL}/projects/\${p.id}\`); fetchProjects(); } }}>Delete</Button>
                </TableCell>
              </TableRow>`);

fs.writeFileSync('frontend/src/pages/ProjectsView.tsx', content);
