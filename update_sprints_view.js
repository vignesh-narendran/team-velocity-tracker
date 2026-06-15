const fs = require('fs');

let content = fs.readFileSync('frontend/src/pages/SprintsView.tsx', 'utf8');

// Update table header
content = content.replace(/<TableHead>Status<\/TableHead>/g, "<TableHead>Status</TableHead>\n              <TableHead>Actions</TableHead>");

// Update table rows
content = content.replace(/<TableCell>\{s\.status\}<\/TableCell>\s*<\/TableRow>/g,
  `<TableCell>{s.status}</TableCell>
                <TableCell>
                  <Button variant="outline" size="sm" className="mr-2" onClick={() => { setFormData({...s, memberIds: s.members?.map((m:any) => m.memberId) || []}); setOpen(true); }}>Edit</Button>
                  <Button variant="destructive" size="sm" onClick={async () => { if(confirm('Are you sure?')) { await axios.delete(\`\${API_URL}/sprints/\${s.id}\`); fetchData(); } }}>Delete</Button>
                </TableCell>
              </TableRow>`);

fs.writeFileSync('frontend/src/pages/SprintsView.tsx', content);
