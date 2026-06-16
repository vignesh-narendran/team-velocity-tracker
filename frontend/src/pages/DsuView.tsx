import { useState, useEffect } from 'react'; import axios from 'axios'; import { API_URL, useAppStore } from '../store'; import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/card'; import { Button } from '../components/ui/button'; import { Input } from '../components/ui/input'; import { Label } from '../components/ui/label';

export default function DsuView() {
  const [members, setMembers] = useState<any[]>([]);
  const [activeStories, setActiveStories] = useState<any[]>([]);
  const { settings } = useAppStore();
  const [formData, setFormData] = useState({ memberId: '', storyId: '', statusUpdate: '', targetCompletion: '', isBlocked: false, stage: '' });
  const storyStages = settings?.storyStages ? JSON.parse(settings.storyStages) : ['Todo', 'In Progress', 'Done'];
  const [selectedStory, setSelectedStory] = useState<any>(null);

  const fetchData = async () => {
    const [meRes, stRes] = await Promise.all([
      axios.get(API_URL + '/members'),
      axios.get(API_URL + '/stories'),
    ]);
    setMembers(meRes.data);
    setActiveStories(stRes.data.filter((s: any) => !['done', 'complete'].includes(s.stage?.toLowerCase())));
  };

  useEffect(() => { fetchData(); }, []);

  // Determine role-specific end date for the selected member in the story
  const getRoleEndDate = (story: any, memberId: string) => {
    if (!story || !memberId) return story?.proposedEnd;
    const id = parseInt(memberId);
    if (story.frontendId === id && story.frontendEnd) return story.frontendEnd;
    if (story.backendId === id && story.backendEnd) return story.backendEnd;
    if (story.qaId === id && story.qaEnd) return story.qaEnd;
    if (story.authorId === id && story.authorEnd) return story.authorEnd;
    return story.proposedEnd;
  };

  useEffect(() => {
    if (formData.storyId) {
      const story = activeStories.find(s => s.id === parseInt(formData.storyId));
      setSelectedStory(story);
      if (story) {
        const roleEndDate = getRoleEndDate(story, formData.memberId);
        if (roleEndDate) {
          setFormData(prev => ({ ...prev, targetCompletion: roleEndDate.split('T')[0] }));
        }
      }
    } else {
      setSelectedStory(null);
    }
  }, [formData.storyId, formData.memberId, activeStories]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await axios.post(API_URL + '/dsus', {
      ...formData,
      memberId: parseInt(formData.memberId),
      storyId: parseInt(formData.storyId),
    });
    alert('DSU Update Recorded!');
    setFormData({ memberId: '', storyId: '', statusUpdate: '', targetCompletion: '', isBlocked: false, stage: '' });
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Daily Status Update</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid gap-2">
              <Label>Who are you?</Label>
              <select required className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm" value={formData.memberId} onChange={e => setFormData({ ...formData, memberId: e.target.value })}>
                <option value="">Select Member</option>
                {members.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
              </select>
            </div>
            <div className="grid gap-2">
              <Label>Select Story</Label>
              <select required className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm" value={formData.storyId} onChange={e => setFormData({ ...formData, storyId: e.target.value })}>
                <option value="">Select Task</option>
                {activeStories.map(s => <option key={s.id} value={s.id}>{s.storyNumber} - {s.name}</option>)}
              </select>
            </div>
            {selectedStory && (
              <div className="p-4 bg-slate-100 dark:bg-slate-800 rounded text-sm space-y-1">
                <p><strong>Story Proposed End:</strong> {new Date(selectedStory.proposedEnd).toLocaleDateString()}</p>
                {formData.memberId && (() => {
                  const id = parseInt(formData.memberId);
                  if (selectedStory.frontendId === id && selectedStory.frontendEnd)
                    return <p><strong>Your Role End (Frontend):</strong> {new Date(selectedStory.frontendEnd).toLocaleDateString()}</p>;
                  if (selectedStory.backendId === id && selectedStory.backendEnd)
                    return <p><strong>Your Role End (Backend):</strong> {new Date(selectedStory.backendEnd).toLocaleDateString()}</p>;
                  if (selectedStory.qaId === id && selectedStory.qaEnd)
                    return <p><strong>Your Role End (QA):</strong> {new Date(selectedStory.qaEnd).toLocaleDateString()}</p>;
                  if (selectedStory.authorId === id && selectedStory.authorEnd)
                    return <p><strong>Your Role End (Authoring):</strong> {new Date(selectedStory.authorEnd).toLocaleDateString()}</p>;
                  return null;
                })()}
                <p><strong>Current Stage:</strong> {selectedStory.stage}</p>
              </div>
            )}
            <div className="grid gap-2">
              <Label>Your Task Stage</Label>
              <select required className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm" value={formData.stage} onChange={e => setFormData({ ...formData, stage: e.target.value })}>
                <option value="">Select Stage</option>
                {storyStages.map((s: string) => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
            <div className="grid gap-2">
              <Label>Your Target Completion Date <span className="text-slate-400 font-normal text-xs">(for your part of this task)</span></Label>
              <Input type="date" required value={formData.targetCompletion} onChange={e => setFormData({ ...formData, targetCompletion: e.target.value })} />
            </div>
            <div className="grid gap-2">
              <Label>Status Update / Comments</Label>
              <Input required value={formData.statusUpdate} onChange={e => setFormData({ ...formData, statusUpdate: e.target.value })} />
            </div>
            <div className="flex items-center gap-2 mt-4">
              <input type="checkbox" id="isBlocked" checked={formData.isBlocked} onChange={e => setFormData({ ...formData, isBlocked: e.target.checked })} />
              <Label htmlFor="isBlocked">I am blocked on this task</Label>
            </div>
            <Button type="submit" className="w-full">Submit Update</Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
