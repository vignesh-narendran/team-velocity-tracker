
import { differenceInDays, addDays, format, isWeekend } from 'date-fns';
import StatusDot from './StatusDot';

interface GanttProps {
  stories: any[];
  availability?: any[];
  sprintStart: Date;
  sprintEnd: Date;
  viewType: 'task' | 'people'; // "team view" excluded per request
}

export default function GanttChart({ stories, sprintStart, sprintEnd, viewType, availability }: GanttProps) {
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
          style={{ left: `${Math.max(0, bLeft)}%`, width: `${bWidth}%`, backgroundColor: color }}
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
          <div className="flex items-center gap-2"><StatusDot story={story} /> {story.storyNumber}</div>
        </div>
        <div className="flex-1 relative h-full">
          {/* Main proposed overall story border indicator (optional, maybe helpful for context) */}
          <div
            className="absolute top-1 bottom-1 border border-slate-300 dark:border-slate-600 rounded-sm opacity-30"
            style={{ left: `${Math.max(0, leftOffset)}%`, width: `${totalDurationWidth}%` }}
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
        { id: s.frontendId, name: s.frontendMember?.name || 'Unassigned (FE)', type: 'frontend', start: s.frontendStart, end: s.frontendEnd },
        { id: s.backendId, name: s.backendMember?.name || 'Unassigned (BE)', type: 'backend', start: s.backendStart, end: s.backendEnd },
        { id: s.qaId, name: s.qaMember?.name || 'Unassigned (QA)', type: 'qa', start: s.qaStart, end: s.qaEnd },
        { id: s.authorId, name: s.authorMember?.name || 'Unassigned (Auth)', type: 'author', start: s.authorStart, end: s.authorEnd },
      ].forEach(assignment => {
        if (!assignment.id || !assignment.start || !assignment.end) return;
        if (!peopleMap.has(assignment.id)) {
          peopleMap.set(assignment.id, { id: assignment.id, name: assignment.name, tasks: [] });
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
           {/* Tasks */ }
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
                   left: `${Math.max(0, (startOffsetDays / totalDays) * 100)}%`,
                   width: `${(durationDays / totalDays) * 100}%`,
                   backgroundColor: (stageColors as any)[task.type]
                 }}
                 title={`${task.story.storyNumber} (${task.type})`}
               />
             );
           })}
           {/* Leaves */}
           {availability?.find(a => a.member.id === person.id)?.allLeaves?.map((leave: any, lIdx: number) => {
             const lStart = new Date(leave.startDate);
             const lEnd = new Date(leave.endDate);
             const startOffsetDays = differenceInDays(lStart, sprintStart);
             const durationDays = differenceInDays(lEnd, lStart) + 1;

             return (
               <div
                 key={`leave-${lIdx}`}
                 className="absolute top-2 bottom-2 rounded opacity-50 bg-slate-400"
                 style={{
                   left: `${Math.max(0, (startOffsetDays / totalDays) * 100)}%`,
                   width: `${(durationDays / totalDays) * 100}%`,
                   backgroundImage: 'repeating-linear-gradient(45deg, transparent, transparent 5px, rgba(0,0,0,0.2) 5px, rgba(0,0,0,0.2) 10px)'
                 }}
                 title={`On Leave: ${leave.reason || 'Not specified'}`}
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
