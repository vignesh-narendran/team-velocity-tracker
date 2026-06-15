import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';
import { format } from 'date-fns';

interface TimelineProps {
  story: any;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function StoryTimeline({ story, open, onOpenChange }: TimelineProps) {
  if (!story) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Activity Timeline: {story.storyNumber}</DialogTitle>
        </DialogHeader>
        <div className="space-y-6 mt-4 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-slate-300 before:to-transparent">

          {/* Creation Event */}
          <div className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
            <div className="flex items-center justify-center w-10 h-10 rounded-full border border-white bg-slate-300 text-slate-500 shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path d="M10 2a8 8 0 100 16 8 8 0 000-16zm0 14a6 6 0 110-12 6 6 0 010 12z" /></svg>
            </div>
            <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] p-4 rounded border border-slate-200 bg-white dark:bg-slate-800 shadow">
              <div className="flex items-center justify-between space-x-2 mb-1">
                <div className="font-bold text-slate-900 dark:text-slate-100">Story Created</div>
                <time className="font-caveat font-medium text-indigo-500">
                  Proposed Start: {format(new Date(story.proposedStart), 'MMM d, yyyy')}
                </time>
              </div>
              <div className="text-slate-500 text-sm">
                Expected Completion: {format(new Date(story.proposedEnd), 'MMM d, yyyy')}
              </div>
            </div>
          </div>

          {/* DSU Updates */}
          {story.dsus?.sort((a: any, b: any) => new Date(a.date).getTime() - new Date(b.date).getTime()).map((dsu: any) => (
            <div key={dsu.id} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
              <div className={`flex items-center justify-center w-10 h-10 rounded-full border border-white shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 ${dsu.isBlocked ? 'bg-red-100 text-red-500' : 'bg-blue-100 text-blue-500'}`}>
                {dsu.isBlocked ? (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                ) : (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"></path></svg>
                )}
              </div>
              <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] p-4 rounded border border-slate-200 bg-white dark:bg-slate-800 shadow">
                <div className="flex items-center justify-between space-x-2 mb-1">
                  <div className="font-bold text-slate-900 dark:text-slate-100">DSU Update {dsu.stageUpdate ? `(${dsu.stageUpdate})` : ''}</div>
                  <time className="font-caveat font-medium text-indigo-500">{format(new Date(dsu.date), 'MMM d, h:mm a')}</time>
                </div>
                <div className="text-slate-700 dark:text-slate-300 text-sm mb-2">{dsu.statusUpdate}</div>
                {dsu.isBlocked && <div className="text-red-500 text-xs font-semibold uppercase mt-1">Blocked</div>}
                <div className="text-slate-500 text-xs mt-2">
                  Target Completion: {format(new Date(dsu.targetCompletion), 'MMM d, yyyy')}
                </div>
              </div>
            </div>
          ))}

          {/* Completion Event */}
          {['complete', 'done'].includes(story.stage.toLowerCase()) && (
            <div className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
              <div className="flex items-center justify-center w-10 h-10 rounded-full border border-white bg-green-100 text-green-500 shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
              </div>
              <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] p-4 rounded border border-slate-200 bg-white dark:bg-slate-800 shadow">
                <div className="flex items-center justify-between space-x-2 mb-1">
                  <div className="font-bold text-slate-900 dark:text-slate-100">Completed</div>
                </div>
                <div className="text-slate-500 text-sm">
                  Story marked as {story.stage}.
                </div>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
