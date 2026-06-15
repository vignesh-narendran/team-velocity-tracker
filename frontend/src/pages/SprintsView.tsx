import { useState, useEffect } from 'react';
import axios from 'axios';
import { API_URL, useAppStore } from '../store';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../components/ui/dialog';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';

export default function SprintsView() {
  const [sprints, setSprints] = useState<any[]>([]);
  const [projects, setProjects] = useState<any[]>([]);
  const [members, setMembers] = useState<any[]>([]);
  const [open, setOpen] = useState(false);

  const { settings } = useAppStore();
  const statuses = settings?.sprintStatuses ? JSON.parse(settings.sprintStatuses) : ['Planning'];

  const [formData, setFormData] = useState<any>({
    id: null, sprintNumber: '', projectId: '', startDate: '', endDate: '', proposedVelocity: '', status: statuses[0], memberIds: []
  });

  const fetchData = async () => {
    const [spRes, prRes, meRes] = await Promise.all([
      axios.get(`${API_URL}/sprints`),
      axios.get(`${API_URL}/projects`),
      axios.get(`${API_URL}/members`),
    ]);
    setSprints(spRes.data);
    setProjects(prRes.data);
    setMembers(meRes.data);
  };

  useEffect(() => { fetchData(); }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const payload = {
      ...formData,
      sprintNumber: formData.sprintNumber ? parseInt(formData.sprintNumber) : null,
      projectId: parseInt(formData.projectId),
      proposedVelocity: formData.proposedVelocity ? parseInt(formData.proposedVelocity) : null,
    };
    if (formData.id) {
      await axios.put(`${API_URL}/sprints/${formData.id}`, payload);
    } else {
      await axios.post(`${API_URL}/sprints`, payload);
    }
    setOpen(false);
    fetchData();
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Sprints</CardTitle>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => setFormData({ id: null, sprintNumber: '', projectId: projects[0]?.id || '', startDate: '', endDate: '', proposedVelocity: '', status: statuses[0], memberIds: [] })}>Add Sprint</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{formData.id ? 'Edit' : 'Add'} Sprint</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid gap-2">
                <Label>Project</Label>
                <select className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm" required value={formData.projectId} onChange={e => setFormData({ ...formData, projectId: e.target.value })}>
                  <option value="">Select Project</option>
                  {projects.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                </select>
              </div>
              <div className="grid gap-2">
                <Label>Sprint Number (Auto if empty)</Label>
                <Input type="number" value={formData.sprintNumber} onChange={e => setFormData({ ...formData, sprintNumber: e.target.value })} />
              </div>
              <div className="grid gap-2">
                <Label>Start Date</Label>
                <Input type="date" required value={formData.startDate.split('T')[0]} onChange={e => setFormData({ ...formData, startDate: e.target.value })} />
              </div>
              <div className="grid gap-2">
                <Label>End Date</Label>
                <Input type="date" required value={formData.endDate.split('T')[0]} onChange={e => setFormData({ ...formData, endDate: e.target.value })} />
              </div>
              <div className="grid gap-2">
                <Label>Proposed Velocity (Optional)</Label>
                <Input type="number" value={formData.proposedVelocity} onChange={e => setFormData({ ...formData, proposedVelocity: e.target.value })} />
              </div>
              <div className="grid gap-2">
                <Label>Status</Label>
                <select className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm" value={formData.status} onChange={e => setFormData({ ...formData, status: e.target.value })}>
                  {statuses.map((s: string) => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
              <div className="grid gap-2">
                <Label>Team Members</Label>
                <select multiple className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm" value={formData.memberIds.map(String)} onChange={e => {
                  const options = e.target.options;
                  const value = [];
                  for (let i = 0, l = options.length; i < l; i++) {
                    if (options[i].selected) {
                      value.push(parseInt(options[i].value));
                    }
                  }
                  setFormData({ ...formData, memberIds: value });
                }}>
                  {members.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
                </select>
              </div>
              <Button type="submit">Save</Button>
            </form>
          </DialogContent>
        </Dialog>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Sprint</TableHead>
              <TableHead>Project</TableHead>
              <TableHead>Dates</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sprints.map(s => (
              <TableRow key={s.id}>
                <TableCell className="font-medium">Sprint {s.sprintNumber}</TableCell>
                <TableCell>{projects.find(p => p.id === s.projectId)?.name}</TableCell>
                <TableCell>{new Date(s.startDate).toLocaleDateString()} - {new Date(s.endDate).toLocaleDateString()}</TableCell>
                <TableCell>{s.status}</TableCell>
                <TableCell>
                  <Button variant="outline" size="sm" className="mr-2" onClick={() => { setFormData({...s, memberIds: s.members?.map((m:any) => m.memberId) || []}); setOpen(true); }}>Edit</Button>
                  <Button variant="destructive" size="sm" onClick={async () => { if(confirm('Are you sure?')) { await axios.delete(`${API_URL}/sprints/${s.id}`); fetchData(); } }}>Delete</Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
