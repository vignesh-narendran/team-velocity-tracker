import { useState, useEffect } from 'react';
import axios from 'axios';
import { API_URL } from '../store';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/card';
import { BarChart, Bar, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer, CartesianGrid } from 'recharts';
import GanttChart from '../components/GanttChart';
import { Button } from '../components/ui/button';
import { Bell, Check } from 'lucide-react';
import { format } from 'date-fns';

export default function DashboardView() {
  const [insights, setInsights] = useState({ blockers: [], driftingTasks: [] });
  const [availability, setAvailability] = useState([]);
  const [sprints, setSprints] = useState([]);
  const [stories, setStories] = useState([]);
  const [reminders, setReminders] = useState([]);
  const [ganttView, setGanttView] = useState<'task' | 'people'>('task');

  useEffect(() => {
    const fetchDash = async () => {
      const [inRes, avRes, spRes, stRes, remRes] = await Promise.all([
        axios.get(API_URL + '/analytics/insights'),
        axios.get(API_URL + '/analytics/team-availability'),
        axios.get(API_URL + '/sprints'),
        axios.get(API_URL + '/stories'),
        axios.get(API_URL + '/reminders'),
      ]);
      setInsights(inRes.data);
      setAvailability(avRes.data);
      setSprints(spRes.data);
      setStories(stRes.data);
      setReminders(remRes.data);
    };
    fetchDash();
  }, []);

  const availMap = {
    'free': { color: '#22c55e', text: 'Free' },
    'about-to-free': { color: '#f59e0b', text: 'Ending Soon' },
    'busy': { color: '#ef4444', text: 'Busy' },
    'leave': { color: '#9ca3af', text: 'On Leave' }
  };

  // For Gantt Demo: just take first sprint dates or arbitrary range if no sprints
  const ganttStart = sprints[0] ? new Date((sprints[0] as any).startDate) : new Date();
  const ganttEnd = sprints[0] ? new Date((sprints[0] as any).endDate) : new Date(new Date().setDate(new Date().getDate() + 14));

  const activeReminders = reminders.filter(r => !r.completed);

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
            <BarChart data={sprints.map((s:any) => ({ name: 'Sprint '+s.sprintNumber, proposed: s.proposedVelocity || 0, actual: s.stories?.filter((st:any)=>st.stage==='complete').reduce((acc:any, st:any)=>acc+st.storyPoints, 0) || 0 }))}>
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
    </div>
  );
}
