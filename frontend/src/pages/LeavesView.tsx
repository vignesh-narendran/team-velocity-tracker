import { useState, useEffect } from 'react';
import axios from 'axios';
import { API_URL } from '../store';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../components/ui/dialog';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';

export default function LeavesView() {
  const [leaves, setLeaves] = useState<any[]>([]);
  const [projects, setProjects] = useState<any[]>([]);
  const [members, setMembers] = useState<any[]>([]);
  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState({ memberIds: [], projectId: '', startDate: '', endDate: '', reason: '' });

  const fetchData = async () => {
    const [lvRes, prRes, meRes] = await Promise.all([
      axios.get(`${API_URL}/leaves`),
      axios.get(`${API_URL}/projects`),
      axios.get(`${API_URL}/members`),
    ]);
    setLeaves(lvRes.data);
    setProjects(prRes.data);
    setMembers(meRes.data);
  };

  useEffect(() => { fetchData(); }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const payload = {
      ...formData,
      projectId: formData.projectId ? parseInt(formData.projectId) : null,
    };
    await axios.post(`${API_URL}/leaves`, payload);
    setOpen(false);
    fetchData();
  };

  const handleDelete = async (id: number) => {
    await axios.delete(`${API_URL}/leaves/${id}`);
    fetchData();
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Leaves & Holidays</CardTitle>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => setFormData({ memberIds: [], projectId: '', startDate: '', endDate: '', reason: '' })}>Add Leave/Holiday</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add Leave or Group Holiday</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid gap-2">
                <Label>Project (Optional, for group holiday)</Label>
                <select className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm" value={formData.projectId} onChange={e => setFormData({ ...formData, projectId: e.target.value })}>
                  <option value="">Global / All</option>
                  {projects.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                </select>
              </div>
              <div className="grid gap-2">
                <Label>Members (Leave empty for group holiday)</Label>
                <select multiple className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm" value={formData.memberIds.map(String)} onChange={e => {
                  const options = e.target.options;
                  const value = [];
                  for (let i = 0, l = options.length; i < l; i++) {
                    if (options[i].selected) {
                      value.push(parseInt(options[i].value));
                    }
                  }
                  setFormData({ ...formData, memberIds: value as any });
                }}>
                  {members.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
                </select>
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
                <Label>Reason</Label>
                <Input value={formData.reason} onChange={e => setFormData({ ...formData, reason: e.target.value })} />
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
              <TableHead>Type</TableHead>
              <TableHead>Member / Project</TableHead>
              <TableHead>Dates</TableHead>
              <TableHead>Reason</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {leaves.map(l => (
              <TableRow key={l.id}>
                <TableCell>{l.memberId ? 'Individual' : 'Group'}</TableCell>
                <TableCell>{l.memberId ? l.member?.name : (l.projectId ? projects.find(p=>p.id===l.projectId)?.name : 'Global')}</TableCell>
                <TableCell>{new Date(l.startDate).toLocaleDateString()} - {new Date(l.endDate).toLocaleDateString()}</TableCell>
                <TableCell>{l.reason}</TableCell>
                <TableCell className="text-right">
                  <Button variant="destructive" size="sm" onClick={() => handleDelete(l.id)}>Delete</Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
