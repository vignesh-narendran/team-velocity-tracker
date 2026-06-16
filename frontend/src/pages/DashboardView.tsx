import { useState, useEffect } from 'react';
import axios from 'axios';
import { API_URL, useAppStore } from '../store';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/card';
import { BarChart, Bar, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer, CartesianGrid } from 'recharts';
import GanttChart from '../components/GanttChart';
import { Button } from '../components/ui/button';
import { Bell, Check } from 'lucide-react';
import { format } from 'date-fns';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../components/ui/dialog';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';

export default function DashboardView() {
  const [insights, setInsights] = useState({ blockers: [], driftingTasks: [] });
  const [availability, setAvailability] = useState([]);
  const [sprints, setSprints] = useState([]);
  const [stories, setStories] = useState([]);
  const [members, setMembers] = useState([]);
  const [reminders, setReminders] = useState([]);
  const [ganttView, setGanttView] = useState<'task' | 'people'>('task');
  const [editingStory, setEditingStory] = useState<any>(null);
  const [storyEditOpen, setStoryEditOpen] = useState(false);

  const { settings } = useAppStore();
  const complexities = settings?.complexities ? JSON.parse(settings.complexities) : ['Easy', 'Medium', 'Hard'];
  const storyStages = settings?.storyStages ? JSON.parse(settings.storyStages) : ['Todo', 'In Progress', 'Done'];

  const fetchDash = async () => {
    const [inRes, avRes, spRes, stRes, remRes, meRes] = await Promise.all([
      axios.get(API_URL + '/analytics/insights'),
      axios.get(API_URL + '/analytics/team-availability'),
      axios.get(API_URL + '/sprints'),
      axios.get(API_URL + '/stories'),
      axios.get(API_URL + '/reminders'),
      axios.get(API_URL + '/members'),
    ]);
    setInsights(inRes.data);
    setAvailability(avRes.data);
    setSprints(spRes.data);
    setStories(stRes.data);
    setReminders(remRes.data);
    setMembers(meRes.data);
  };

  useEffect(() => { fetchDash(); }, []);

  const availMap = {
    'free': { color: '#22c55e', text: 'Free' },
    'busy': { color: '#ef4444', text: 'Busy' },
    'leave': { color: '#9ca3af', text: 'On Leave' }
  };

  const activeSprint = (sprints as any[]).find((s: any) => s.status === 'Active') || sprints[0];
  const activeSprintStories = activeSprint?.id ? stories.filter((s: any) => s.sprintId === (activeSprint as any).id) : [];
  const totalSprintPoints = activeSprintStories.reduce((acc: number, s: any) => acc + (s.storyPoints || 0), 0);

  const ganttStart = activeSprint ? new Date((activeSprint as any).startDate) : new Date();
  const ganttEnd = activeSprint ? new Date((activeSprint as any).endDate) : new Date(new Date().setDate(new Date().getDate() + 14));

  const activeReminders = reminders.filter(r => !r.completed);

  const handleStoryClick = (story: any) => {
    setEditingStory({ ...story });
    setStoryEditOpen(true);
  };

  const handleStorySave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingStory?.id) return;
    const payload = {
      ...editingStory,
      sprintId: parseInt(editingStory.sprintId),
      frontendId: editingStory.frontendId ? parseInt(editingStory.frontendId) : null,
      backendId: editingStory.backendId ? parseInt(editingStory.backendId) : null,
      qaId: editingStory.qaId ? parseInt(editingStory.qaId) : null,
      authorId: editingStory.authorId ? parseInt(editingStory.authorId) : null,
      frontendStart: editingStory.frontendStart || null, frontendEnd: editingStory.frontendEnd || null,
      backendStart: editingStory.backendStart || null, backendEnd: editingStory.backendEnd || null,
      qaStart: editingStory.qaStart || null, qaEnd: editingStory.qaEnd || null,
      authorStart: editingStory.authorStart || null, authorEnd: editingStory.authorEnd || null,
    };
    await axios.put(`${API_URL}/stories/${editingStory.id}`, payload);
    setStoryEditOpen(false);
    fetchDash();
  };

  return (
    <div className="space-y-6">
      {activeReminders.length > 0 && (
        <Card className="border-blue-200 bg-blue-50 dark:bg-blue-900/10">
          <CardHeader>
            <CardTitle className="text-blue-700 dark:text-blue-400 flex items-center gap-2">
              <Bell className="w-5 h-5" />
              Active Reminders ({activeReminders.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {activeReminders.slice(0, 5).map((reminder: any) => (
                <div key={reminder.id} className="flex items-start justify-between p-3 bg-white dark:bg-slate-800 rounded border border-blue-200 dark:border-blue-800">
                  <div className="flex-1">
                    <p className="font-medium text-sm">{reminder.title}</p>
                    {reminder.description && <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">{reminder.description}</p>}
                    <div className="flex gap-4 mt-2 text-xs text-gray-500">
                      <span>Due: {format(new Date(reminder.dueDate), 'MMM dd, yyyy')}</span>
                      {reminder.story && <span>Story: {reminder.story.storyNumber}</span>}
                      {reminder.member && <span>Assigned to: {reminder.member.name}</span>}
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      axios.patch(`${API_URL}/reminders/${reminder.id}/toggle`);
                      setReminders(reminders.map(r => r.id === reminder.id ? { ...r, completed: true } : r));
                    }}
                    className="ml-4 p-1 hover:bg-blue-100 rounded flex-shrink-0"
                    title="Mark as complete"
                  >
                    <Check className="w-4 h-4 text-blue-600" />
                  </button>
                </div>
              ))}
              {activeReminders.length > 5 && (
                <p className="text-xs text-gray-500 text-center">+{activeReminders.length - 5} more reminders</p>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* KPI Tiles */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <p className="text-xs text-slate-500 uppercase tracking-wide">Active Sprint SP</p>
            <p className="text-3xl font-bold mt-1">{totalSprintPoints}</p>
            <p className="text-xs text-slate-400 mt-1">{activeSprint ? `Sprint ${(activeSprint as any).sprintNumber}` : 'No active sprint'}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <p className="text-xs text-slate-500 uppercase tracking-wide">Stories in Sprint</p>
            <p className="text-3xl font-bold mt-1">{activeSprintStories.length}</p>
            <p className="text-xs text-slate-400 mt-1">Total assigned</p>
          </CardContent>
        </Card>
        <Card className="border-amber-200">
          <CardContent className="pt-6">
            <p className="text-xs text-amber-600 uppercase tracking-wide">Drifting</p>
            <p className="text-3xl font-bold mt-1 text-amber-600">{insights.driftingTasks.length}</p>
            <p className="text-xs text-slate-400 mt-1">Tasks past deadline</p>
          </CardContent>
        </Card>
        <Card className="border-red-200">
          <CardContent className="pt-6">
            <p className="text-xs text-red-600 uppercase tracking-wide">Blockers</p>
            <p className="text-3xl font-bold mt-1 text-red-600">{insights.blockers.length}</p>
            <p className="text-xs text-slate-400 mt-1">Need action</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="border-red-200 bg-red-50 dark:bg-red-900/10">
          <CardHeader>
            <CardTitle className="text-red-700 dark:text-red-400">Blockers Action Needed</CardTitle>
          </CardHeader>
          <CardContent>
            {insights.blockers.length === 0 ? <p className="text-sm">No blockers currently.</p> : (
              <ul className="list-disc pl-4 text-sm space-y-1 text-red-900 dark:text-red-200">
                {insights.blockers.map((b: any) => (
                  <li key={b.id}>
                    <strong>{b.storyNumber}</strong>: {b.name} (Sprint {b.sprint?.sprintNumber})
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>

        <Card className="border-amber-200 bg-amber-50 dark:bg-amber-900/10">
          <CardHeader>
            <CardTitle className="text-amber-700 dark:text-amber-400">Drifting Tasks</CardTitle>
          </CardHeader>
          <CardContent>
            {insights.driftingTasks.length === 0 ? <p className="text-sm">No tasks are drifting.</p> : (
              <ul className="list-disc pl-4 text-sm space-y-1 text-amber-900 dark:text-amber-200">
                {insights.driftingTasks.map((b: any) => (
                  <li key={b.id}>
                    <strong>{b.storyNumber}</strong>: {b.name} (Proposed End: {new Date(b.proposedEnd).toLocaleDateString()})
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle>Team Availability</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {availability.map((a: any) => (
                <div key={a.member.id} className="flex items-center justify-between">
                  <span className="text-sm font-medium">{a.member.name} ({a.member.role})</span>
                  <div className="flex items-center gap-2">
                    {(a.availableSP > 0 || a.storyPoints > 0) && (
                      <span className="text-xs bg-slate-100 dark:bg-slate-700 px-1.5 py-0.5 rounded font-mono">
                        {Math.round(a.storyPoints)} / {a.availableSP} SP
                      </span>
                    )}
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: (availMap as any)[a.status].color }} />
                    <span className="text-xs text-slate-500">{(availMap as any)[a.status].text}</span>
                  </div>
                </div>
              ))}
              {availability.length === 0 && <p className="text-sm text-slate-500">No members configured.</p>}
            </div>
          </CardContent>
        </Card>

        <Card className="lg:col-span-3">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Active Sprint Gantt</CardTitle>
            <div className="space-x-2">
              <Button variant={ganttView === 'task' ? 'default' : 'outline'} size="sm" onClick={() => setGanttView('task')}>Task View</Button>
              <Button variant={ganttView === 'people' ? 'default' : 'outline'} size="sm" onClick={() => setGanttView('people')}>People View</Button>
            </div>
          </CardHeader>
          <CardContent>
            <GanttChart
              stories={stories}
              sprintStart={ganttStart}
              sprintEnd={ganttEnd}
              viewType={ganttView}
              availability={availability}
              onStoryClick={handleStoryClick}
            />
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Sprint Capacity: Proposed vs Actual Completion</CardTitle>
          <Button variant="outline" size="sm" onClick={() => window.open(API_URL + '/export/csv', '_blank')}>Export CSV</Button>
        </CardHeader>
        <CardContent className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={(sprints as any[]).map((s: any) => ({
              name: 'Sprint ' + s.sprintNumber,
              proposed: s.proposedVelocity || 0,
              actual: s.stories?.filter((st: any) => ['done', 'complete'].includes(st.stage?.toLowerCase())).reduce((acc: number, st: any) => acc + st.storyPoints, 0) || 0
            }))}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="proposed" fill="#8b5cf6" name="Proposed Capacity (SP)" />
              <Bar dataKey="actual" fill="#10b981" name="Actual Completed (SP)" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Story Edit Dialog (opened from Gantt click) */}
      <Dialog open={storyEditOpen} onOpenChange={setStoryEditOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Story: {editingStory?.storyNumber}</DialogTitle>
          </DialogHeader>
          {editingStory && (
            <form onSubmit={handleStorySave} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label>Sprint</Label>
                  <select required className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm" value={editingStory.sprintId} onChange={e => setEditingStory({ ...editingStory, sprintId: e.target.value })}>
                    {(sprints as any[]).map((s: any) => <option key={s.id} value={s.id}>Sprint {s.sprintNumber}</option>)}
                  </select>
                </div>
                <div className="grid gap-2">
                  <Label>Story Number</Label>
                  <Input required value={editingStory.storyNumber} onChange={e => setEditingStory({ ...editingStory, storyNumber: e.target.value })} />
                </div>
                <div className="grid gap-2 col-span-2">
                  <Label>Story Name</Label>
                  <Input required value={editingStory.name} onChange={e => setEditingStory({ ...editingStory, name: e.target.value })} />
                </div>
                <div className="grid gap-2 col-span-2">
                  <Label>Status Override</Label>
                  <select className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm" value={editingStory.stage} onChange={e => setEditingStory({ ...editingStory, stage: e.target.value })}>
                    {storyStages.map((s: string) => <option key={s} value={s}>{s}</option>)}
                    <option value="blocked">Blocked</option>
                  </select>
                </div>
                <div className="grid gap-2">
                  <Label>Proposed Start</Label>
                  <Input type="date" required value={editingStory.proposedStart?.split('T')[0]} onChange={e => setEditingStory({ ...editingStory, proposedStart: e.target.value })} />
                </div>
                <div className="grid gap-2">
                  <Label>Proposed End</Label>
                  <Input type="date" required value={editingStory.proposedEnd?.split('T')[0]} onChange={e => setEditingStory({ ...editingStory, proposedEnd: e.target.value })} />
                </div>

                <div className="col-span-2 border rounded p-4 space-y-4">
                  <h4 className="font-semibold text-sm">Role Assignments & Dates</h4>

                  {[
                    { label: 'Frontend Dev', idKey: 'frontendId', startKey: 'frontendStart', endKey: 'frontendEnd' },
                    { label: 'Backend Dev', idKey: 'backendId', startKey: 'backendStart', endKey: 'backendEnd' },
                    { label: 'QA Dev', idKey: 'qaId', startKey: 'qaStart', endKey: 'qaEnd' },
                    { label: 'Author', idKey: 'authorId', startKey: 'authorStart', endKey: 'authorEnd' },
                  ].map(role => (
                    <div key={role.idKey} className="grid grid-cols-3 gap-3 items-end">
                      <div className="grid gap-2">
                        <Label>{role.label}</Label>
                        <select className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm" value={editingStory[role.idKey] || ''} onChange={e => setEditingStory({ ...editingStory, [role.idKey]: e.target.value })}>
                          <option value="">None</option>
                          {(members as any[]).map((m: any) => <option key={m.id} value={m.id}>{m.name}</option>)}
                        </select>
                      </div>
                      <div className="grid gap-2">
                        <Label>Start</Label>
                        <Input type="date" value={editingStory[role.startKey]?.split('T')[0] || ''} onChange={e => setEditingStory({ ...editingStory, [role.startKey]: e.target.value })} />
                      </div>
                      <div className="grid gap-2">
                        <Label>End</Label>
                        <Input type="date" value={editingStory[role.endKey]?.split('T')[0] || ''} onChange={e => setEditingStory({ ...editingStory, [role.endKey]: e.target.value })} />
                      </div>
                    </div>
                  ))}
                </div>

                <div className="grid gap-2">
                  <Label>Complexity</Label>
                  <select className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm" value={editingStory.complexity} onChange={e => setEditingStory({ ...editingStory, complexity: e.target.value })}>
                    {complexities.map((c: string) => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
              </div>
              <div className="flex gap-3">
                <Button type="submit">Save Changes</Button>
                <Button type="button" variant="outline" onClick={() => setStoryEditOpen(false)}>Cancel</Button>
              </div>
            </form>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
