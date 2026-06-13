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
  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState({ id: null, name: '', role: '' });
  const { settings } = useAppStore();

  const fetchMembers = async () => {
    const res = await axios.get(`${API_URL}/members`);
    setMembers(res.data);
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
    setFormData(m);
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
            <Button onClick={() => setFormData({ id: null, name: '', role: roles[0] })}>Add Member</Button>
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
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {members.map(m => (
              <TableRow key={m.id}>
                <TableCell className="font-medium">{m.name}</TableCell>
                <TableCell>{m.role}</TableCell>
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
