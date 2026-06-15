import { useState, useEffect } from 'react';
import axios from 'axios';
import { API_URL, useAppStore } from '../store';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../components/ui/dialog';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';

export default function StoriesView() {
  const [stories, setStories] = useState<any[]>([]);
  const [sprints, setSprints] = useState<any[]>([]);
  const [members, setMembers] = useState<any[]>([]);
  const [open, setOpen] = useState(false);
  const [overloadWarning, setOverloadWarning] = useState<string | null>(null);

  const { settings } = useAppStore();
  const complexities = settings?.complexities ? JSON.parse(settings.complexities) : ['Easy', 'Medium', 'Hard'];

  const initData = {
    id: null, sprintId: '', storyNumber: '', name: '', stage: 'todo',
    frontendId: '', frontendStart: '', frontendEnd: '', backendId: '', backendStart: '', backendEnd: '',
    qaId: '', qaStart: '', qaEnd: '', authorId: '', authorStart: '', authorEnd: '', complexity: complexities[0],
    proposedStart: '', proposedEnd: ''
  };
  const [formData, setFormData] = useState<any>(initData);

  const fetchData = async () => {
    const [stRes, spRes, meRes] = await Promise.all([
      axios.get(`${API_URL}/stories`),
      axios.get(`${API_URL}/sprints`),
      axios.get(`${API_URL}/members`),
    ]);
    setStories(stRes.data);
    setSprints(spRes.data);
    setMembers(meRes.data);
  };

  useEffect(() => { fetchData(); }, []);

  const checkAvailability = async () => {
    if (!formData.proposedStart || !formData.proposedEnd) return;

    const res = await axios.get(`${API_URL}/analytics/team-availability`);
    const availability = res.data;

    const assignedIds = [formData.frontendId, formData.backendId, formData.qaId, formData.authorId].filter(id => id && id !== '');

    let warning = null;
    const pStart = new Date(formData.proposedStart).getTime();
    const pEnd = new Date(formData.proposedEnd).getTime();

    for (const id of assignedIds) {
      const memStatus = availability.find((a: any) => a.member.id === parseInt(id));
      if (!memStatus) continue;

      // 1. Check if the member is on leave during this timeframe
      const leaves = memStatus.allLeaves || [];
      const hasConflictLeave = leaves.some((l: any) => {
        const lStart = new Date(l.startDate).getTime();
        const lEnd = new Date(l.endDate).getTime();
        // Overlap condition
        return pStart <= lEnd && pEnd >= lStart;
      });

      if (hasConflictLeave) {
        warning = `Warning: Member ${memStatus.member.name} is on leave during the proposed story timeframe!`;
        break;
      }

      // 2. Check general "already busy" metric just as a friendly FYI
      if (memStatus.status === 'busy' && !warning) {
        warning = `Warning: Member ${memStatus.member.name} is already highly loaded.`;
      }
    }
    setOverloadWarning(warning);
  };

  useEffect(() => {
    if (open) checkAvailability();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formData.frontendId, formData.backendId, formData.qaId, formData.authorId, formData.proposedStart, formData.proposedEnd]);


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const payload = {
      ...formData,
      sprintId: parseInt(formData.sprintId),
      frontendId: formData.frontendId ? parseInt(formData.frontendId) : null,
      backendId: formData.backendId ? parseInt(formData.backendId) : null,
      qaId: formData.qaId ? parseInt(formData.qaId) : null,
      authorId: formData.authorId ? parseInt(formData.authorId) : null,
      frontendStart: formData.frontendStart || null, frontendEnd: formData.frontendEnd || null,
      backendStart: formData.backendStart || null, backendEnd: formData.backendEnd || null,
      qaStart: formData.qaStart || null, qaEnd: formData.qaEnd || null,
      authorStart: formData.authorStart || null, authorEnd: formData.authorEnd || null,
    };
    if (formData.id) {
      await axios.put(`${API_URL}/stories/${formData.id}`, payload);
    } else {
      await axios.post(`${API_URL}/stories`, payload);
    }
    setOpen(false);
    fetchData();
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Stories</CardTitle>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => setFormData(initData)}>Add Story</Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{formData.id ? 'Edit' : 'Add'} Story</DialogTitle>
            </DialogHeader>
            {overloadWarning && <div className="p-3 bg-red-100 text-red-800 rounded">{overloadWarning}</div>}
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label>Sprint</Label>
                  <select required className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm" value={formData.sprintId} onChange={e => setFormData({ ...formData, sprintId: e.target.value })}>
                    <option value="">Select Sprint</option>
                    {sprints.map(s => <option key={s.id} value={s.id}>Sprint {s.sprintNumber}</option>)}
                  </select>
                </div>
                <div className="grid gap-2">
                  <Label>Story Number</Label>
                  <Input required value={formData.storyNumber} onChange={e => setFormData({ ...formData, storyNumber: e.target.value })} />
                </div>
                <div className="grid gap-2 col-span-2">
                  <Label>Story Name</Label>
                  <Input required value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} />
                </div>
                <div className="grid gap-2">
                  <Label>Proposed Start Date</Label>
                  <Input type="date" required value={formData.proposedStart.split('T')[0]} onChange={e => setFormData({ ...formData, proposedStart: e.target.value })} />
                </div>
                <div className="grid gap-2">
                  <Label>Proposed End Date</Label>
                  <Input type="date" required value={formData.proposedEnd.split('T')[0]} onChange={e => setFormData({ ...formData, proposedEnd: e.target.value })} />
                </div>

                {/* Effort Blocks */}
                <div className="col-span-2 border rounded p-4 space-y-4">
                  <h4 className="font-semibold">Effort & Allocations</h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="grid gap-2">
                      <Label>Frontend Dev</Label>
                      <select className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm" value={formData.frontendId} onChange={e => setFormData({ ...formData, frontendId: e.target.value })}>
                        <option value="">None</option>
                        {members.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
                      </select>
                    </div>

                      <div className="col-span-2 grid grid-cols-2 gap-4">
                      <div className="grid gap-2">
                        <Label>Frontend Start</Label>
                        <Input type="date" min={formData.proposedStart ? formData.proposedStart.split('T')[0] : ''} max={formData.proposedEnd ? formData.proposedEnd.split('T')[0] : ''} value={formData.frontendStart ? formData.frontendStart.split('T')[0] : ''} onChange={e => setFormData({ ...formData, frontendStart: e.target.value })} />
                      </div>
                      <div className="grid gap-2">
                        <Label>Frontend End</Label>
                        <Input type="date" min={formData.proposedStart ? formData.proposedStart.split('T')[0] : ''} max={formData.proposedEnd ? formData.proposedEnd.split('T')[0] : ''} value={formData.frontendEnd ? formData.frontendEnd.split('T')[0] : ''} onChange={e => setFormData({ ...formData, frontendEnd: e.target.value })} />
                      </div>
                    </div>

                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="grid gap-2">
                      <Label>Backend Dev</Label>
                      <select className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm" value={formData.backendId} onChange={e => setFormData({ ...formData, backendId: e.target.value })}>
                        <option value="">None</option>
                        {members.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
                      </select>
                    </div>

                      <div className="col-span-2 grid grid-cols-2 gap-4">
                      <div className="grid gap-2">
                        <Label>Backend Start</Label>
                        <Input type="date" min={formData.proposedStart ? formData.proposedStart.split('T')[0] : ''} max={formData.proposedEnd ? formData.proposedEnd.split('T')[0] : ''} value={formData.backendStart ? formData.backendStart.split('T')[0] : ''} onChange={e => setFormData({ ...formData, backendStart: e.target.value })} />
                      </div>
                      <div className="grid gap-2">
                        <Label>Backend End</Label>
                        <Input type="date" min={formData.proposedStart ? formData.proposedStart.split('T')[0] : ''} max={formData.proposedEnd ? formData.proposedEnd.split('T')[0] : ''} value={formData.backendEnd ? formData.backendEnd.split('T')[0] : ''} onChange={e => setFormData({ ...formData, backendEnd: e.target.value })} />
                      </div>
                    </div>

                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="grid gap-2">
                      <Label>QA Dev</Label>
                      <select className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm" value={formData.qaId} onChange={e => setFormData({ ...formData, qaId: e.target.value })}>
                        <option value="">None</option>
                        {members.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
                      </select>
                    </div>

                      <div className="col-span-2 grid grid-cols-2 gap-4">
                      <div className="grid gap-2">
                        <Label>QA Start</Label>
                        <Input type="date" min={formData.proposedStart ? formData.proposedStart.split('T')[0] : ''} max={formData.proposedEnd ? formData.proposedEnd.split('T')[0] : ''} value={formData.qaStart ? formData.qaStart.split('T')[0] : ''} onChange={e => setFormData({ ...formData, qaStart: e.target.value })} />
                      </div>
                      <div className="grid gap-2">
                        <Label>QA End</Label>
                        <Input type="date" min={formData.proposedStart ? formData.proposedStart.split('T')[0] : ''} max={formData.proposedEnd ? formData.proposedEnd.split('T')[0] : ''} value={formData.qaEnd ? formData.qaEnd.split('T')[0] : ''} onChange={e => setFormData({ ...formData, qaEnd: e.target.value })} />
                      </div>
                    </div>

                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="grid gap-2">
                      <Label>Author</Label>
                      <select className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm" value={formData.authorId} onChange={e => setFormData({ ...formData, authorId: e.target.value })}>
                        <option value="">None</option>
                        {members.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
                      </select>
                    </div>

                      <div className="col-span-2 grid grid-cols-2 gap-4">
                      <div className="grid gap-2">
                        <Label>Author Start</Label>
                        <Input type="date" min={formData.proposedStart ? formData.proposedStart.split('T')[0] : ''} max={formData.proposedEnd ? formData.proposedEnd.split('T')[0] : ''} value={formData.authorStart ? formData.authorStart.split('T')[0] : ''} onChange={e => setFormData({ ...formData, authorStart: e.target.value })} />
                      </div>
                      <div className="grid gap-2">
                        <Label>Author End</Label>
                        <Input type="date" min={formData.proposedStart ? formData.proposedStart.split('T')[0] : ''} max={formData.proposedEnd ? formData.proposedEnd.split('T')[0] : ''} value={formData.authorEnd ? formData.authorEnd.split('T')[0] : ''} onChange={e => setFormData({ ...formData, authorEnd: e.target.value })} />
                      </div>
                    </div>

                  </div>
                </div>

                <div className="grid gap-2">
                  <Label>Complexity</Label>
                  <select className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm" value={formData.complexity} onChange={e => setFormData({ ...formData, complexity: e.target.value })}>
                    {complexities.map((c: string) => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
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
              <TableHead>No.</TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Sprint</TableHead>
              <TableHead>Stage</TableHead>
              <TableHead>Points</TableHead>
              <TableHead>Complexity</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {stories.map(s => (
              <TableRow key={s.id}>
                <TableCell>{s.storyNumber}</TableCell>
                <TableCell className="font-medium">{s.name}</TableCell>
                <TableCell>Sprint {sprints.find(sp => sp.id === s.sprintId)?.sprintNumber}</TableCell>
                <TableCell>{s.stage}</TableCell>
                <TableCell>{s.storyPoints}</TableCell>
                <TableCell>{s.complexity}</TableCell>

                <TableCell>
                  <Button variant="outline" size="sm" className="mr-2" onClick={() => { setFormData({...s}); setOpen(true); }}>Edit</Button>
                  <Button variant="destructive" size="sm" onClick={async () => { if(confirm('Are you sure?')) { await axios.delete(`${API_URL}/stories/${s.id}`); fetchData(); } }}>Delete</Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
