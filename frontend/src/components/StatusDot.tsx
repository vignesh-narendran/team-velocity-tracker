

export default function StatusDot({ story }: { story: any }) {
  if (!story) return null;

  const stage = story.stage ? story.stage.toLowerCase() : 'todo';

  let color = 'bg-blue-500';
  let glow = 'shadow-[0_0_8px_rgba(59,130,246,0.8)]'; // blue
  let animate = 'animate-pulse';
  let title = 'Todo';

  if (['done', 'complete', 'completed'].includes(stage)) {
    color = 'bg-slate-400';
    glow = '';
    animate = '';
    title = 'Completed';
  } else if (stage === 'blocked') {
    color = 'bg-red-500';
    glow = 'shadow-[0_0_8px_rgba(239,68,68,0.8)]';
    title = 'Blocked';
  } else if (stage === 'in progress') {
    color = 'bg-green-500';
    glow = 'shadow-[0_0_8px_rgba(34,197,94,0.8)]';
    title = 'In Progress';
  } else {
    // Check if delayed
    const latestDsu = story.dsus && story.dsus.length > 0 ? story.dsus[0] : null;
    if (latestDsu && new Date(latestDsu.targetCompletion) > new Date(story.proposedEnd)) {
      color = 'bg-orange-500';
      glow = 'shadow-[0_0_8px_rgba(249,115,22,0.8)]';
      title = 'Delayed';
    }
  }

  // Also if DSU says blocked but stage isn't updated for some reason
  if (!['done', 'complete', 'completed'].includes(stage)) {
    const latestDsu = story.dsus && story.dsus.length > 0 ? story.dsus[0] : null;
    if (latestDsu?.isBlocked) {
      color = 'bg-red-500';
      glow = 'shadow-[0_0_8px_rgba(239,68,68,0.8)]';
      title = 'Blocked';
    }
  }

  return (
    <div
      className={`inline-block w-3 h-3 rounded-full ${color} ${glow} ${animate}`}
      title={title}
    />
  );
}
