import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../hooks/useAuth';
import { Card, CardContent, CardHeader } from '../components/ui/Card';
import { Input } from '../components/ui/Input';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { Trash2 } from 'lucide-react';

export function Profile() {
  const { user } = useAuth();
  const [profile, setProfile] = useState<any>(null);
  const [skills, setSkills] = useState<any[]>([]);
  const [isEditing, setIsEditing] = useState(false);
  const [newSkill, setNewSkill] = useState('');
  const [editForm, setEditForm] = useState({
    name: '',
    bio: ''
  });

  // Load all data
  useEffect(() => {
    if (user?.id) {
      fetchProfile();
      fetchSkills();
    }
  }, [user]);

  const fetchProfile = async () => {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single();

    if (!error) {
      setProfile(data);
      setEditForm({
        name: data.name || '',
        bio: data.bio || ''
      });
    }
  };

  const fetchSkills = async () => {
    const { data, error } = await supabase
      .from('skills')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (!error) setSkills(data || []);
  };

  const handleSaveProfile = async () => {
    const { error } = await supabase
      .from('profiles')
      .upsert({
        id: user.id,
        name: editForm.name,
        bio: editForm.bio,
        updated_at: new Date().toISOString()
      });

    if (!error) {
      setIsEditing(false);
      fetchProfile();
    }
  };

  const handleAddSkill = async () => {
    if (!newSkill.trim()) return;
    
    const { error } = await supabase
      .from('skills')
      .insert({
        user_id: user.id,
        name: newSkill.trim()
      });

    if (!error) {
      setNewSkill('');
      fetchSkills();
    }
  };

  const handleDeleteSkill = async (skillId: string) => {
    const { error } = await supabase
      .from('skills')
      .delete()
      .eq('id', skillId);

    if (!error) fetchSkills();
  };

  if (!user) return <div className="p-6">Please log in to view your profile.</div>;

  return (
    <div className="p-6 space-y-6 max-w-3xl mx-auto">
      {/* Profile Card */}
      <Card>
        <CardHeader className="border-b">
          <h2 className="text-xl font-bold">My Profile</h2>
        </CardHeader>
        <CardContent className="pt-4">
          {isEditing ? (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Name</label>
                <Input
                  value={editForm.name}
                  onChange={(e) => setEditForm({...editForm, name: e.target.value})}
                  placeholder="Your name"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Bio</label>
                <textarea
                  className="w-full p-2 border rounded-md min-h-[100px]"
                  value={editForm.bio}
                  onChange={(e) => setEditForm({...editForm, bio: e.target.value})}
                  placeholder="Tell us about yourself"
                />
              </div>
              <div className="flex gap-2">
                <Button onClick={handleSaveProfile}>Save Profile</Button>
                <Button variant="outline" onClick={() => setIsEditing(false)}>
                  Cancel
                </Button>
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              <div>
                <h3 className="text-lg font-semibold">{profile?.name || 'No name set'}</h3>
                <p className="text-gray-600">{profile?.bio || 'No bio yet'}</p>
              </div>
              <Button onClick={() => setIsEditing(true)}>Edit Profile</Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Skills Card */}
      <Card>
        <CardHeader className="border-b">
          <h2 className="text-xl font-bold">My Skills</h2>
        </CardHeader>
        <CardContent className="pt-4">
          <div className="flex gap-2 mb-4">
            <Input
              value={newSkill}
              onChange={(e) => setNewSkill(e.target.value)}
              placeholder="Add a new skill"
              onKeyDown={(e) => e.key === 'Enter' && handleAddSkill()}
            />
            <Button onClick={handleAddSkill}>Add</Button>
          </div>
          <div className="flex flex-wrap gap-2">
            {skills.length > 0 ? (
              skills.map((skill) => (
                <Badge key={skill.id} className="flex items-center gap-1">
                  {skill.name}
                  <Trash2
                    size={14}
                    className="cursor-pointer hover:text-red-500"
                    onClick={() => handleDeleteSkill(skill.id)}
                  />
                </Badge>
              ))
            ) : (
              <p className="text-gray-500">No skills added yet</p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
