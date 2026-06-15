const fs = require('fs');

let content = fs.readFileSync('frontend/src/components/GanttChart.tsx', 'utf8');

// Replace task row rendering to draw specific role blocks
const oldRenderTaskRow = `
    const tHours = (story.frontendHours || 0) + (story.backendHours || 0) + (story.qaHours || 0) + (story.authorHours || 0);

    const fPct = tHours ? ((story.frontendHours || 0) / tHours) * 100 : 25;
    const bPct = tHours ? ((story.backendHours || 0) / tHours) * 100 : 25;
    const qPct = tHours ? ((story.qaHours || 0) / tHours) * 100 : 25;
    const aPct = tHours ? ((story.authorHours || 0) / tHours) * 100 : 25;

    // Slippage tracking
    const slippageDays = isDelayed ? differenceInDays(actualEnd, sEnd) : 0;
    const slippageWidth = (slippageDays / totalDays) * 100;

    return (
      <div key={story.id} className="relative h-10 border-b flex items-center group">
        <div className="w-48 flex-shrink-0 px-2 truncate text-sm font-medium border-r z-10 bg-white dark:bg-slate-800">
          {story.storyNumber} - {story.name}
        </div>
        <div className="flex-1 relative h-full">
          {/* Main proposed bar */}
          <div
            className="absolute top-2 bottom-2 rounded-sm overflow-hidden flex shadow-sm"
            style={{ left: \`\${Math.max(0, leftOffset)}%\`, width: \`\${totalDurationWidth}%\` }}
          >
            {fPct > 0 && <div style={{ width: \`\${fPct}%\`, backgroundColor: stageColors.frontend }} title="Frontend" />}
            {bPct > 0 && <div style={{ width: \`\${bPct}%\`, backgroundColor: stageColors.backend }} title="Backend" />}
            {qPct > 0 && <div style={{ width: \`\${qPct}%\`, backgroundColor: stageColors.qa }} title="QA" />}
            {aPct > 0 && <div style={{ width: \`\${aPct}%\`, backgroundColor: stageColors.author }} title="Authoring" />}
          </div>

          {/* Slippage (Hashed) */}
          {isDelayed && (
            <div
              className="absolute top-2 bottom-2 rounded-r-sm bg-red-400 opacity-60"
              style={{
                left: \`\${leftOffset + totalDurationWidth}%\`,
                width: \`\${slippageWidth}%\`,
                backgroundImage: 'repeating-linear-gradient(45deg, transparent, transparent 5px, rgba(0,0,0,0.1) 5px, rgba(0,0,0,0.1) 10px)'
              }}
              title="Delayed Slippage"
            />
          )}
        </div>
      </div>
    );
`;

const newRenderTaskRow = `
    const renderBlock = (startStr: string, endStr: string, color: string, title: string) => {
      if (!startStr || !endStr) return null;
      const bStart = new Date(startStr);
      const bEnd = new Date(endStr);
      const bOffsetDays = differenceInDays(bStart, sprintStart);
      const bDurationDays = differenceInDays(bEnd, bStart) + 1;

      const bLeft = (bOffsetDays / totalDays) * 100;
      const bWidth = (bDurationDays / totalDays) * 100;

      return (
        <div
          className="absolute top-1 bottom-1 rounded-sm opacity-80"
          style={{ left: \`\${Math.max(0, bLeft)}%\`, width: \`\${bWidth}%\`, backgroundColor: color }}
          title={title}
        />
      );
    };

    // Slippage tracking
    const slippageDays = isDelayed ? differenceInDays(actualEnd, sEnd) : 0;
    const slippageWidth = (slippageDays / totalDays) * 100;

    return (
      <div key={story.id} className="relative h-12 border-b flex items-center group">
        <div className="w-48 flex-shrink-0 px-2 truncate text-sm font-medium border-r z-10 bg-white dark:bg-slate-800">
          {story.storyNumber} - {story.name}
        </div>
        <div className="flex-1 relative h-full">
          {/* Main proposed overall story border indicator (optional, maybe helpful for context) */}
          <div
            className="absolute top-1 bottom-1 border border-slate-300 dark:border-slate-600 rounded-sm opacity-30"
            style={{ left: \`\${Math.max(0, leftOffset)}%\`, width: \`\${totalDurationWidth}%\` }}
          />

          {renderBlock(story.frontendStart, story.frontendEnd, stageColors.frontend, "Frontend")}
          {renderBlock(story.backendStart, story.backendEnd, stageColors.backend, "Backend")}
          {renderBlock(story.qaStart, story.qaEnd, stageColors.qa, "QA")}
          {renderBlock(story.authorStart, story.authorEnd, stageColors.author, "Authoring")}

          {/* Slippage (Hashed) */}
          {isDelayed && (
            <div
              className="absolute top-1 bottom-1 rounded-r-sm bg-red-400 opacity-60"
              style={{
                left: \`\${leftOffset + totalDurationWidth}%\`,
                width: \`\${slippageWidth}%\`,
                backgroundImage: 'repeating-linear-gradient(45deg, transparent, transparent 5px, rgba(0,0,0,0.1) 5px, rgba(0,0,0,0.1) 10px)'
              }}
              title="Delayed Slippage"
            />
          )}
        </div>
      </div>
    );
`;

content = content.replace(oldRenderTaskRow, newRenderTaskRow);

// Update people row rendering
const oldPeopleRow = `
    const peopleMap = new Map();
    stories.forEach(s => {
      [
        { id: s.frontendId, name: s.frontendMember?.name || 'Unassigned (FE)', type: 'frontend' },
        { id: s.backendId, name: s.backendMember?.name || 'Unassigned (BE)', type: 'backend' },
        { id: s.qaId, name: s.qaMember?.name || 'Unassigned (QA)', type: 'qa' },
        { id: s.authorId, name: s.authorMember?.name || 'Unassigned (Auth)', type: 'author' },
      ].forEach(assignment => {
        if (!assignment.id) return;
        if (!peopleMap.has(assignment.id)) {
          peopleMap.set(assignment.id, { name: assignment.name, tasks: [] });
        }
        peopleMap.get(assignment.id).tasks.push({ story: s, type: assignment.type });
      });
    });

    return Array.from(peopleMap.values()).map((person: any, idx) => (
      <div key={idx} className="relative h-12 border-b flex items-center">
        <div className="w-48 flex-shrink-0 px-2 truncate text-sm font-medium border-r z-10 bg-white dark:bg-slate-800">
          {person.name}
        </div>
        <div className="flex-1 relative h-full">
           {person.tasks.map((task: any, tIdx: number) => {
             const sStart = new Date(task.story.proposedStart);
             const sEnd = new Date(task.story.proposedEnd);
             const startOffsetDays = differenceInDays(sStart, sprintStart);
             const durationDays = differenceInDays(sEnd, sStart) + 1;

             return (
               <div
                 key={tIdx}
                 className="absolute top-2 bottom-2 rounded opacity-80"
                 style={{
                   left: \`\${Math.max(0, (startOffsetDays / totalDays) * 100)}%\`,
                   width: \`\${(durationDays / totalDays) * 100}%\`,
                   backgroundColor: (stageColors as any)[task.type]
                 }}
                 title={\`\${task.story.storyNumber} (\${task.type})\`}
               />
             );
           })}
        </div>
      </div>
    ));
`;

const newPeopleRow = `
    const peopleMap = new Map();
    stories.forEach(s => {
      [
        { id: s.frontendId, name: s.frontendMember?.name || 'Unassigned (FE)', type: 'frontend', start: s.frontendStart, end: s.frontendEnd },
        { id: s.backendId, name: s.backendMember?.name || 'Unassigned (BE)', type: 'backend', start: s.backendStart, end: s.backendEnd },
        { id: s.qaId, name: s.qaMember?.name || 'Unassigned (QA)', type: 'qa', start: s.qaStart, end: s.qaEnd },
        { id: s.authorId, name: s.authorMember?.name || 'Unassigned (Auth)', type: 'author', start: s.authorStart, end: s.authorEnd },
      ].forEach(assignment => {
        if (!assignment.id || !assignment.start || !assignment.end) return;
        if (!peopleMap.has(assignment.id)) {
          peopleMap.set(assignment.id, { name: assignment.name, tasks: [] });
        }
        peopleMap.get(assignment.id).tasks.push({ story: s, type: assignment.type, start: assignment.start, end: assignment.end });
      });
    });

    return Array.from(peopleMap.values()).map((person: any, idx) => (
      <div key={idx} className="relative h-12 border-b flex items-center">
        <div className="w-48 flex-shrink-0 px-2 truncate text-sm font-medium border-r z-10 bg-white dark:bg-slate-800">
          {person.name}
        </div>
        <div className="flex-1 relative h-full">
           {person.tasks.map((task: any, tIdx: number) => {
             const sStart = new Date(task.start);
             const sEnd = new Date(task.end);
             const startOffsetDays = differenceInDays(sStart, sprintStart);
             const durationDays = differenceInDays(sEnd, sStart) + 1;

             return (
               <div
                 key={tIdx}
                 className="absolute top-2 bottom-2 rounded opacity-80"
                 style={{
                   left: \`\${Math.max(0, (startOffsetDays / totalDays) * 100)}%\`,
                   width: \`\${(durationDays / totalDays) * 100}%\`,
                   backgroundColor: (stageColors as any)[task.type]
                 }}
                 title={\`\${task.story.storyNumber} (\${task.type})\`}
               />
             );
           })}
        </div>
      </div>
    ));
`;

content = content.replace(oldPeopleRow, newPeopleRow);

fs.writeFileSync('frontend/src/components/GanttChart.tsx', content);
