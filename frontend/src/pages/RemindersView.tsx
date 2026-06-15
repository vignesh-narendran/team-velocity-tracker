import { useState, useEffect } from 'react';
import axios from 'axios';
import { API_URL } from '../store';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../components/ui/dialog';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Trash2, Check } from 'lucide-react';
import { format } from 'date-fns';

export default function RemindersView() {
  const [reminders, setReminders] = useState<any[]>([]);
  const [stories, setStories] = useState<any[]>([]);
  const [members, setMembers] = useState<any[]>([]);
  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    dueDate: '',
    priority: 'medium',
    memberId: '',
    storyId: ''
  });

  const fetchData = async () => {
    try {
      const [remRes, stRes, meRes] = await Promise.all([
        axios.get(`${API_URL}/reminders`),
        axios.get(`${API_URL}/stories`),
        axios.get(`${API_URL}/members`),
      ]);
      setReminders(remRes.data);
      setStories(stRes.data);
      setMembers(meRes.data);
    } catch (error) {
      console.error('Failed to fetch data', error);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const payload = {
        title: formData.title,
        description: formData.description || null,
        dueDate: formData.dueDate,
        priority: formData.priority,
        memberId: formData.memberId ? parseInt(formData.memberId) : null,
        storyId: formData.storyId ? parseInt(formData.storyId) : null,
      };
      await axios.post(`${API_URL}/reminders`, payload);
      setOpen(false);
      setFormData({
        title: '',
        description: '',
        dueDate: '',
        priority: 'medium',
        memberId: '',
        storyId: ''
      });
      fetchData();
    } catch (error) {
      console.error('Failed to create reminder', error);
    }
  };

  const handleToggle = async (id: number) => {
    try {
      await axios.patch(`${API_URL}/reminders/${id}/toggle`);
      fetchData();
    } catch (error) {
      console.error('Failed to toggle reminder', error);
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await axios.delete(`${API_URL}/reminders/${id}`);
      fetchData();
    } catch (error) {
      console.error('Failed to delete reminder', error);
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'text-red-600 bg-red-50';
      case 'medium':
        return 'text-yellow-600 bg-yellow-50';
      case 'low':
        return 'text-green-600 bg-green-50';
      default:
        return 'text-gray-600 bg-gray-50';
    }
  };

  const activeReminders = reminders.filter(r => !r.completed);
  const completedReminders = reminders.filter(r => r.completed);

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Active Reminders</CardTitle>
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button onClick={() => setFormData({
                title: '',
                description: '',
                dueDate: '',
                priority: 'medium',
                memberId: '',
                storyId: ''
              })}>Add Reminder</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create New Reminder</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid gap-2">
                  <Label>Title *</Label>
                  <Input
                    required
                    value={formData.title}
                    onChange={e => setFormData({ ...formData, title: e.target.value })}
                    placeholder="Reminder title"
                  />
                </div>
                <div className="grid gap-2">
                  <Label>Description</Label>
                  <textarea
                    className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                    value={formData.description}
                    onChange={e => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Add details"
                  />
                </div>
                <div className="grid gap-2">
                  <Label>Due Date *</Label>
                  <Input
                    type="date"
                    required
                    value={formData.dueDate}
                    onChange={e => setFormData({ ...formData, dueDate: e.target.value })}
                  />
                </div>
                <div className="grid gap-2">
                  <Label>Priority</Label>
                  <select
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                    value={formData.priority}
                    onChange={e => setFormData({ ...formData, priority: e.target.value })}
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                  </select>
                </div>
                <div className="grid gap-2">
                  <Label>Assigned To</Label>
                  <select
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                    value={formData.memberId}
                    onChange={e => setFormData({ ...formData, memberId: e.target.value })}
                  >
                    <option value="">Unassigned</option>
                    {members.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
                  </select>
                </div>
                <div className="grid gap-2">
                  <Label>Related Story</Label>
                  <select
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                    value={formData.storyId}
                    onChange={e => setFormData({ ...formData, storyId: e.target.value })}
                  >
                    <option value="">No story</option>
                    {stories.map(s => <option key={s.id} value={s.id}>{s.storyNumber} - {s.name}</option>)}
                  </select>
                </div>
                <Button type="submit" className="w-full">Create Reminder</Button>
              </form>
            </DialogContent>
          </Dialog>
        </CardHeader>
        <CardContent>
          {activeReminders.length === 0 ? (
            <p className="text-sm text-slate-500">No active reminders.</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Title</TableHead>
                  <TableHead>Due Date</TableHead>
                  <TableHead>Priority</TableHead>
                  <TableHead>Story</TableHead>
                  <TableHead>Assigned To</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {activeReminders.map(reminder => (
                  <TableRow key={reminder.id}>
                    <TableCell className="font-medium">{reminder.title}</TableCell>
                    <TableCell>{format(new Date(reminder.dueDate), 'MMM dd, yyyy')}</TableCell>
                    <TableCell>
                      <span className={`px-2 py-1 rounded text-xs font-medium capitalize ${getPriorityColor(reminder.priority)}`}>
                        {reminder.priority}
                      </span>
                    </TableCell>
                    <TableCell>{reminder.story ? `${reminder.story.storyNumber}` : '-'}</TableCell>
                    <TableCell>{reminder.member?.name || '-'}</TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleToggle(reminder.id)}
                          className="p-1 hover:bg-green-100 rounded"
                          title="Mark as complete"
                        >
                          <Check className="w-4 h-4 text-green-600" />
                        </button>
                        <button
                          onClick={() => handleDelete(reminder.id)}
                          className="p-1 hover:bg-red-100 rounded"
                          title="Delete"
                        >
                          <Trash2 className="w-4 h-4 text-red-600" />
                        </button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {completedReminders.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Completed Reminders ({completedReminders.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Title</TableHead>
                  <TableHead>Due Date</TableHead>
                  <TableHead>Priority</TableHead>
                  <TableHead>Story</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {completedReminders.map(reminder => (
                  <TableRow key={reminder.id} className="opacity-50">
                    <TableCell className="font-medium line-through">{reminder.title}</TableCell>
                    <TableCell>{format(new Date(reminder.dueDate), 'MMM dd, yyyy')}</TableCell>
                    <TableCell>
                      <span className={`px-2 py-1 rounded text-xs font-medium capitalize ${getPriorityColor(reminder.priority)}`}>
                        {reminder.priority}
                      </span>
                    </TableCell>
                    <TableCell>{reminder.story ? `${reminder.story.storyNumber}` : '-'}</TableCell>
                    <TableCell>
                      <button
                        onClick={() => handleDelete(reminder.id)}
                        className="p-1 hover:bg-red-100 rounded"
                        title="Delete"
                      >
                        <Trash2 className="w-4 h-4 text-red-600" />
                      </button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
