import { useState, useEffect } from 'react';
import axios from 'axios';
import { API_URL, useAppStore } from '../store';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/card';
import { Input } from '../components/ui/input';
import { Button } from '../components/ui/button';
import { Label } from '../components/ui/label';

export default function SettingsView() {
  const { settings, fetchSettings } = useAppStore();
  const [formData, setFormData] = useState({
    companyName: '',
    accentColor: '#333333',
    roles: '',
    sprintStatuses: '',
    projectStatuses: '',
    complexities: '',
    spToHours: 8,
    ignoreLeaves: false,
  });
  const [logoFile, setLogoFile] = useState<File | null>(null);

  useEffect(() => {
    if (settings) {
      setFormData({
        companyName: settings.companyName,
        accentColor: settings.accentColor,
        roles: settings.roles,
        sprintStatuses: settings.sprintStatuses,
        projectStatuses: settings.projectStatuses,
        complexities: settings.complexities,
        spToHours: settings.spToHours,
        ignoreLeaves: settings.ignoreLeaves,
      });
    }
  }, [settings]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const data = new FormData();
    Object.entries(formData).forEach(([key, value]) => {
      data.append(key, String(value));
    });
    if (logoFile) {
      data.append('logo', logoFile);
    }

    await axios.put(`${API_URL}/settings`, data);
    fetchSettings();
    alert("Settings saved!");
  };

  return (
    <Card className="max-w-2xl">
      <CardHeader>
        <CardTitle>Application Settings</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid gap-2">
            <Label>Company Name</Label>
            <Input
              value={formData.companyName}
              onChange={e => setFormData({ ...formData, companyName: e.target.value })}
            />
          </div>
          <div className="grid gap-2">
            <Label>Company Logo (Upload)</Label>
            <Input type="file" accept="image/*" onChange={e => setLogoFile(e.target.files?.[0] || null)} />
            {settings?.logoUrl && <img src={`http://localhost:3001${settings.logoUrl}`} alt="Logo" className="h-12 w-auto mt-2" />}
          </div>
          <div className="grid gap-2">
            <Label>Accent Color (Hex)</Label>
            <div className="flex gap-2">
              <input
                type="color"
                value={formData.accentColor}
                onChange={e => setFormData({ ...formData, accentColor: e.target.value })}
                className="w-10 h-10 p-0 border-0 rounded"
              />
              <Input
                value={formData.accentColor}
                onChange={e => setFormData({ ...formData, accentColor: e.target.value })}
              />
            </div>
          </div>
          <div className="grid gap-2">
            <Label>Team Roles (JSON Array)</Label>
            <Input
              value={formData.roles}
              onChange={e => setFormData({ ...formData, roles: e.target.value })}
            />
          </div>
          <div className="grid gap-2">
            <Label>Sprint Statuses (JSON Array)</Label>
            <Input
              value={formData.sprintStatuses}
              onChange={e => setFormData({ ...formData, sprintStatuses: e.target.value })}
            />
          </div>
          <div className="grid gap-2">
            <Label>Project Statuses (JSON Array)</Label>
            <Input
              value={formData.projectStatuses}
              onChange={e => setFormData({ ...formData, projectStatuses: e.target.value })}
            />
          </div>
          <div className="grid gap-2">
            <Label>Story Complexities (JSON Array)</Label>
            <Input
              value={formData.complexities}
              onChange={e => setFormData({ ...formData, complexities: e.target.value })}
            />
          </div>
          <div className="grid gap-2">
            <Label>1 Story Point = X Hours</Label>
            <Input
              type="number"
              value={formData.spToHours}
              onChange={e => setFormData({ ...formData, spToHours: parseInt(e.target.value) })}
            />
          </div>
          <div className="flex items-center gap-2 mt-4">
            <input
              type="checkbox"
              id="ignoreLeaves"
              checked={formData.ignoreLeaves}
              onChange={e => setFormData({ ...formData, ignoreLeaves: e.target.checked })}
            />
            <Label htmlFor="ignoreLeaves">Ignore leaves in capacity calculation</Label>
          </div>
          <Button type="submit" className="mt-4">Save Settings</Button>
        </form>
      </CardContent>
    </Card>
  );
}
