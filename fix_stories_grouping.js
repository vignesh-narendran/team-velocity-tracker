const fs = require('fs');
let content = fs.readFileSync('frontend/src/pages/StoriesView.tsx', 'utf8');

const tableRegex = /<TableBody>([\s\S]*?)<\/TableBody>/;
const groupedLogic = `<TableBody>
            {sprints.sort((a: any, b: any) => b.sprintNumber - a.sprintNumber).map((sp: any) => {
              const sprintStories = stories.filter(s => s.sprintId === sp.id);
              if (sprintStories.length === 0) return null;
              return (
                <React.Fragment key={sp.id}>
                  <TableRow className="bg-slate-100 dark:bg-slate-800/50 hover:bg-slate-100 dark:hover:bg-slate-800/50">
                    <TableCell colSpan={7} className="font-semibold py-2">Sprint {sp.sprintNumber}</TableCell>
                  </TableRow>
                  {sprintStories.map(s => (
                    <TableRow key={s.id}>
                      <TableCell>{s.storyNumber}</TableCell>
                      <TableCell className="font-medium"><div className="flex items-center gap-2"><StatusDot story={s} /> {s.name}</div></TableCell>
                      <TableCell>Sprint {sp.sprintNumber}</TableCell>
                      <TableCell>{s.stage}</TableCell>
                      <TableCell>{s.storyPoints}</TableCell>
                      <TableCell>{s.complexity}</TableCell>
                      <TableCell>
                        <Button variant="outline" size="sm" className="mr-2" onClick={() => { setFormData({...s}); setOpen(true); }}>Edit</Button>
                        <Button variant="outline" size="sm" className="mr-2" onClick={() => { setTimelineStory(s); setTimelineOpen(true); }}>Timeline</Button>
                        <Button variant="destructive" size="sm" onClick={async () => { if(confirm('Are you sure?')) { await axios.delete(\`\${API_URL}/stories/\${s.id}\`); fetchData(); } }}>Delete</Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </React.Fragment>
              );
            })}

            {/* Unassigned Stories or Stories without matching sprint */}
            {(() => {
              const unassigned = stories.filter(s => !sprints.find((sp: any) => sp.id === s.sprintId));
              if (unassigned.length === 0) return null;
              return (
                <React.Fragment key="unassigned">
                  <TableRow className="bg-slate-100 dark:bg-slate-800/50 hover:bg-slate-100 dark:hover:bg-slate-800/50">
                    <TableCell colSpan={7} className="font-semibold py-2">Unassigned / Other</TableCell>
                  </TableRow>
                  {unassigned.map(s => (
                    <TableRow key={s.id}>
                      <TableCell>{s.storyNumber}</TableCell>
                      <TableCell className="font-medium"><div className="flex items-center gap-2"><StatusDot story={s} /> {s.name}</div></TableCell>
                      <TableCell>None</TableCell>
                      <TableCell>{s.stage}</TableCell>
                      <TableCell>{s.storyPoints}</TableCell>
                      <TableCell>{s.complexity}</TableCell>
                      <TableCell>
                        <Button variant="outline" size="sm" className="mr-2" onClick={() => { setFormData({...s}); setOpen(true); }}>Edit</Button>
                        <Button variant="outline" size="sm" className="mr-2" onClick={() => { setTimelineStory(s); setTimelineOpen(true); }}>Timeline</Button>
                        <Button variant="destructive" size="sm" onClick={async () => { if(confirm('Are you sure?')) { await axios.delete(\`\${API_URL}/stories/\${s.id}\`); fetchData(); } }}>Delete</Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </React.Fragment>
              )
            })()}
          </TableBody>`;

content = content.replace(tableRegex, groupedLogic);

if (!content.includes('import React')) {
  content = content.replace("import { useState, useEffect } from 'react';", "import React, { useState, useEffect } from 'react';");
}

fs.writeFileSync('frontend/src/pages/StoriesView.tsx', content);
