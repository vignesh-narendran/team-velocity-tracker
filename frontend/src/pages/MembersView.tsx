import { useState, useEffect } from 'react';
import axios from 'axios';
import { API_URL, useAppStore } from '../store';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../components/ui/dialog';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';

export default function MembersView() {
  const [members, setMembers] = useState<any[]>([]);
  const [projects, setProjects] = useState<any[]>([]);
  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState({ id: null, name: '', role: '', projectId: '', allocationStart: '', allocationEnd: '' });
  const { settings } = useAppStore();

  const fetchMembers = async () => {
    const [memRes, prjRes] = await Promise.all([
      axios.get(`${API_URL}/members`),
      axios.get(`${API_URL}/projects`)
    ]);
    setMembers(memRes.data);
    setProjects(prjRes.data);
  };

  useEffect(() => { fetchMembers(); }, []);

  const roles = settings?.roles ? JSON.parse(settings.roles) : ['Developer', 'QA'];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.id) {
      await axios.put(`${API_URL}/members/${formData.id}`, formData);
    } else {
      await axios.post(`${API_URL}/members`, formData);
    }
    setOpen(false);
    fetchMembers();
  };

  const handleEdit = (m: any) => {
    const proj = m.projects && m.projects.length > 0 ? m.projects[0] : null;
    setFormData({
      id: m.id,
      name: m.name,
      role: m.role,
      projectId: proj ? proj.projectId.toString() : '',
      allocationStart: proj ? new Date(proj.allocationStart).toISOString().split('T')[0] : '',
      allocationEnd: proj ? new Date(proj.allocationEnd).toISOString().split('T')[0] : ''
    });
    setOpen(true);
  };

  const handleDelete = async (id: number) => {
    await axios.delete(`${API_URL}/members/${id}`);
    fetchMembers();
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Team Members</CardTitle>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => setFormData({ id: null, name: '', role: roles[0], projectId: '', allocationStart: '', allocationEnd: '' })}>Add Member</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{formData.id ? 'Edit' : 'Add'} Member</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid gap-2">
                <Label>Name</Label>
                <Input required value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} />
              </div>
              <div className="grid gap-2">
                <Label>Role</Label>
                <select
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background"
                  value={formData.role}
                  onChange={e => setFormData({ ...formData, role: e.target.value })}
                >
                  {roles.map((r: string) => <option key={r} value={r}>{r}</option>)}
                </select>
              </div>

              <div className="pt-4 border-t space-y-4 mt-4">
                <h4 className="font-semibold text-sm text-slate-700 dark:text-slate-300">Project Allocation (Optional)</h4>
                <div className="grid gap-2">
                  <Label>Project</Label>
                  <select
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background"
                    value={formData.projectId}
                    onChange={e => setFormData({ ...formData, projectId: e.target.value })}
                  >
                    <option value="">None</option>
                    {projects.map((p: any) => <option key={p.id} value={p.id}>{p.name}</option>)}
                  </select>
                </div>
                {formData.projectId && (
                  <div className="grid grid-cols-2 gap-4">
                    <div className="grid gap-2">
                      <Label>Allocation Start</Label>
                      <Input type="date" required value={formData.allocationStart} onChange={e => setFormData({ ...formData, allocationStart: e.target.value })} />
                    </div>
                    <div className="grid gap-2">
                      <Label>Allocation End</Label>
                      <Input type="date" required value={formData.allocationEnd} onChange={e => setFormData({ ...formData, allocationEnd: e.target.value })} />
                    </div>
                  </div>
                )}
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
              <TableHead>Role</TableHead>
              <TableHead>Primary Allocation</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {members.map(m => (
              <TableRow key={m.id}>
                <TableCell className="font-medium">{m.name}</TableCell>
                <TableCell>{m.role}</TableCell>
                <TableCell>
                   {m.projects && m.projects.length > 0
                     ? `${m.projects[0].project.name} (${new Date(m.projects[0].allocationStart).toLocaleDateString()} - ${new Date(m.projects[0].allocationEnd).toLocaleDateString()})`
                     : 'Unassigned'}
                </TableCell>
                <TableCell className="text-right">
                  <Button variant="outline" size="sm" className="mr-2" onClick={() => handleEdit(m)}>Edit</Button>
                  <Button variant="destructive" size="sm" onClick={() => handleDelete(m.id)}>Delete</Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
