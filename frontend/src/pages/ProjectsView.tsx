import { useState, useEffect } from 'react';
import axios from 'axios';
import { API_URL } from '../store';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../components/ui/dialog';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';

export default function ProjectsView() {
  const [projects, setProjects] = useState<any[]>([]);
  const [members, setMembers] = useState<any[]>([]);
  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState({ id: null, name: '', startDate: '', endDate: '', managerId: '', architectId: '', projectType: '' });

  const fetchProjects = async () => {
    const res = await axios.get(`${API_URL}/projects`);
    setProjects(res.data);
  };
  const fetchMembers = async () => {
    const res = await axios.get(`${API_URL}/members`);
    setMembers(res.data);
  };

  useEffect(() => {
    fetchProjects();
    fetchMembers();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const payload = {
      ...formData,
      managerId: formData.managerId ? parseInt(formData.managerId) : null,
      architectId: formData.architectId ? parseInt(formData.architectId) : null,
    };
    if (formData.id) {
      await axios.put(`${API_URL}/projects/${formData.id}`, payload);
    } else {
      await axios.post(`${API_URL}/projects`, payload);
    }
    setOpen(false);
    fetchProjects();
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Projects</CardTitle>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => setFormData({ id: null, name: '', startDate: '', endDate: '', managerId: '', architectId: '', projectType: '' })}>Add Project</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{formData.id ? 'Edit' : 'Add'} Project</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid gap-2">
                <Label>Name</Label>
                <Input required value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} />
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
                <Label>Project Manager</Label>
                <select className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm" value={formData.managerId} onChange={e => setFormData({ ...formData, managerId: e.target.value })}>
                  <option value="">None</option>
                  {members.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
                </select>
              </div>
              <div className="grid gap-2">
                <Label>Project Architect</Label>
                <select className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm" value={formData.architectId} onChange={e => setFormData({ ...formData, architectId: e.target.value })}>
                  <option value="">None</option>
                  {members.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
                </select>
              </div>
              <div className="grid gap-2">
                <Label>Project Type</Label>
                <Input required value={formData.projectType} onChange={e => setFormData({ ...formData, projectType: e.target.value })} />
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
              <TableHead>Name</TableHead>
              <TableHead>Dates</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {projects.map(p => (
              <TableRow key={p.id}>
                <TableCell className="font-medium">{p.name}</TableCell>
                <TableCell>{new Date(p.startDate).toLocaleDateString()} - {new Date(p.endDate).toLocaleDateString()}</TableCell>
                <TableCell>{p.projectType}</TableCell>
                <TableCell>
                  <Button variant="outline" size="sm" className="mr-2" onClick={() => { setFormData({...p, managerId: p.managerId || '', architectId: p.architectId || ''}); setOpen(true); }}>Edit</Button>
                  <Button variant="destructive" size="sm" onClick={async () => { if(confirm('Are you sure?')) { await axios.delete(`${API_URL}/projects/${p.id}`); fetchProjects(); } }}>Delete</Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
