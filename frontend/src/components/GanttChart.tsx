
import { differenceInDays, addDays, format, isWeekend } from 'date-fns';

interface GanttProps {
  stories: any[];
  sprintStart: Date;
  sprintEnd: Date;
  viewType: 'task' | 'people'; // "team view" excluded per request
}

export default function GanttChart({ stories, sprintStart, sprintEnd, viewType }: GanttProps) {
  const totalDays = differenceInDays(sprintEnd, sprintStart) + 1;
  const daysArray = Array.from({ length: totalDays }, (_, i) => addDays(sprintStart, i));

  // Colors based on stage: Frontend, Backend, QA, Authoring
  const stageColors = {
    frontend: '#3b82f6', // blue
    backend: '#10b981',  // emerald
    qa: '#f59e0b',       // amber
    author: '#8b5cf6',   // violet
  };

  const renderTaskRow = (story: any) => {
    // Basic task timeline calculation
    // Start to end date single bar, split by % of hours
    const sStart = new Date(story.proposedStart);
    const sEnd = new Date(story.proposedEnd);

    // Check DSU deviation
    const latestDsu = story.dsus?.[0];
    const actualEnd = latestDsu ? new Date(latestDsu.targetCompletion) : sEnd;
    const isDelayed = actualEnd > sEnd;

    const startOffsetDays = differenceInDays(sStart, sprintStart);
    const durationDays = differenceInDays(sEnd, sStart) + 1;
    const totalDurationWidth = (durationDays / totalDays) * 100;
    const leftOffset = (startOffsetDays / totalDays) * 100;

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
            style={{ left: `${Math.max(0, leftOffset)}%`, width: `${totalDurationWidth}%` }}
          >
            {fPct > 0 && <div style={{ width: `${fPct}%`, backgroundColor: stageColors.frontend }} title="Frontend" />}
            {bPct > 0 && <div style={{ width: `${bPct}%`, backgroundColor: stageColors.backend }} title="Backend" />}
            {qPct > 0 && <div style={{ width: `${qPct}%`, backgroundColor: stageColors.qa }} title="QA" />}
            {aPct > 0 && <div style={{ width: `${aPct}%`, backgroundColor: stageColors.author }} title="Authoring" />}
          </div>

          {/* Slippage (Hashed) */}
          {isDelayed && (
            <div
              className="absolute top-2 bottom-2 rounded-r-sm bg-red-400 opacity-60"
              style={{
                left: `${leftOffset + totalDurationWidth}%`,
                width: `${slippageWidth}%`,
                backgroundImage: 'repeating-linear-gradient(45deg, transparent, transparent 5px, rgba(0,0,0,0.1) 5px, rgba(0,0,0,0.1) 10px)'
              }}
              title="Delayed Slippage"
            />
          )}
        </div>
      </div>
    );
  };

  const renderPeopleRow = () => {
    // Group tasks by person assigned. A person might be assigned multiple stages across stories.
    // Simplified for demo: just list people and blocks.
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
                   left: `${Math.max(0, (startOffsetDays / totalDays) * 100)}%`,
                   width: `${(durationDays / totalDays) * 100}%`,
                   backgroundColor: (stageColors as any)[task.type]
                 }}
                 title={`${task.story.storyNumber} (${task.type})`}
               />
             );
           })}
        </div>
      </div>
    ));
  };

  return (
    <div className="w-full overflow-x-auto border rounded-md bg-white dark:bg-slate-900 shadow-sm relative">
      <div className="min-w-[800px]">
        {/* Header Dates */}
        <div className="flex border-b bg-slate-50 dark:bg-slate-800">
          <div className="w-48 flex-shrink-0 border-r px-2 py-2 text-xs font-semibold uppercase text-slate-500">
            {viewType === 'task' ? 'Stories' : 'Team Members'}
          </div>
          <div className="flex-1 flex relative">
            {daysArray.map((day, i) => {
              const isWknd = isWeekend(day);
              return (
                <div
                  key={i}
                  className={`flex-1 flex flex-col items-center justify-center py-1 border-r last:border-r-0 ${isWknd ? 'bg-slate-100 dark:bg-slate-800' : ''}`}
                >
                  <span className="text-[10px] text-slate-500">{format(day, 'EEE')}</span>
                  <span className="text-xs font-medium">{format(day, 'dd')}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Grid Background Lines */}
        <div className="absolute top-[41px] bottom-0 left-48 right-0 flex pointer-events-none opacity-20">
            {daysArray.map((_, i) => (
              <div key={i} className="flex-1 border-r border-slate-300 dark:border-slate-600 h-full" />
            ))}
        </div>

        {/* Rows */}
        <div className="relative z-0">
          {viewType === 'task'
            ? stories.map(s => renderTaskRow(s))
            : renderPeopleRow()
          }
        </div>

        {/* Legend */}
        <div className="p-3 border-t text-xs flex gap-4 text-slate-500 bg-slate-50 dark:bg-slate-800/50">
          <div className="flex items-center gap-1"><div className="w-3 h-3 rounded-sm" style={{backgroundColor: stageColors.frontend}}></div> Frontend</div>
          <div className="flex items-center gap-1"><div className="w-3 h-3 rounded-sm" style={{backgroundColor: stageColors.backend}}></div> Backend</div>
          <div className="flex items-center gap-1"><div className="w-3 h-3 rounded-sm" style={{backgroundColor: stageColors.qa}}></div> QA</div>
          <div className="flex items-center gap-1"><div className="w-3 h-3 rounded-sm" style={{backgroundColor: stageColors.author}}></div> Authoring</div>
          <div className="flex items-center gap-1 ml-4"><div className="w-3 h-3 rounded-sm bg-red-400 opacity-60" style={{backgroundImage: 'repeating-linear-gradient(45deg, transparent, transparent 5px, rgba(0,0,0,0.1) 5px, rgba(0,0,0,0.1) 10px)'}}></div> Slippage</div>
        </div>
      </div>
    </div>
  );
}
