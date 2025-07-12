import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader } from '../components/ui/Card'
import { Button } from '../components/ui/Button'
import { Input } from '../components/ui/Input'
import { Badge } from '../components/ui/Badge'
import { supabase } from '../lib/supabase'
import { useAuth } from '../hooks/useAuth'
import { User, MapPin, Camera, Plus, Edit, Trash2 } from 'lucide-react'

export function Profile() {
  const { user } = useAuth()
  const [profile, setProfile] = useState(null)
  const [skills, setSkills] = useState([])
  const [isEditing, setIsEditing] = useState(false)
  const [editForm, setEditForm] = useState({
    name: '',
    location: '',
    bio: '',
    is_public: true,
    availability: []
  })

  useEffect(() => {
    if (user) {
      loadProfile()
      loadSkills()
    }
  }, [user])

  const loadProfile = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user?.id)
        .single()

      if (error) throw error
      setProfile(data)
      setEditForm({
        name: data.name || '',
        location: data.location || '',
        bio: data.bio || '',
        is_public: data.is_public,
        availability: data.availability || []
      })
    } catch (error) {
      console.error('Error loading profile:', error)
    }
  }

  const loadSkills = async () => {
    try {
      const { data, error } = await supabase
        .from('skills')
        .select('*')
        .eq('user_id', user?.id)
        .order('created_at', { ascending: false })

      if (error) throw error
      setSkills(data || [])
    } catch (error) {
      console.error('Error loading skills:', error)
    }
  }

  const updateProfile = async () => {
    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          ...editForm,
          updated_at: new Date().toISOString()
        })
        .eq('id', user?.id)

      if (error) throw error
      setIsEditing(false)
      loadProfile()
    } catch (error) {
      console.error('Error updating profile:', error)
    }
  }

  const deleteSkill = async (skillId: string) => {
    try {
      const { error } = await supabase
        .from('skills')
        .delete()
        .eq('id', skillId)

      if (error) throw error
      loadSkills()
    } catch (error) {
      console.error('Error deleting skill:', error)
    }
  }

  const availabilityOptions = [
    'Weekdays (Morning)',
    'Weekdays (Afternoon)', 
    'Weekdays (Evening)',
    'Weekends (Morning)',
    'Weekends (Afternoon)',
    'Weekends (Evening)'
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900">Profile</h1>
        <Button
          onClick={() => setIsEditing(!isEditing)}
          variant={isEditing ? 'secondary' : 'primary'}
        >
          {isEditing ? 'Cancel' : 'Edit Profile'}
        </Button>
      </div>

      {/* Profile Info */}
      <Card>
        <CardHeader>
          <h2 className="text-xl font-semibold text-gray-900">Personal Information</h2>
        </CardHeader>
        <CardContent>
          {isEditing ? (
            <div className="space-y-4">
              <Input
                label="Name"
                value={editForm.name}
                onChange={(e) => setEditForm({...editForm, name: e.target.value})}
              />
              <Input
                label="Location (Optional)"
                value={editForm.location}
                onChange={(e) => setEditForm({...editForm, location: e.target.value})}
                placeholder="City, Country"
              />
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Bio</label>
                <textarea
                  value={editForm.bio}
                  onChange={(e) => setEditForm({...editForm, bio: e.target.value})}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Tell others about yourself..."
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Availability</label>
                <div className="grid grid-cols-2 gap-2">
                  {availabilityOptions.map((option) => (
                    <label key={option} className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        checked={editForm.availability.includes(option)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setEditForm({
                              ...editForm,
                              availability: [...editForm.availability, option]
                            })
                          } else {
                            setEditForm({
                              ...editForm,
                              availability: editForm.availability.filter(a => a !== option)
                            })
                          }
                        }}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <span className="text-sm text-gray-700">{option}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="is_public"
                  checked={editForm.is_public}
                  onChange={(e) => setEditForm({...editForm, is_public: e.target.checked})}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <label htmlFor="is_public" className="text-sm font-medium text-gray-700">
                  Make my profile public (visible to other users)
                </label>
              </div>

              <div className="flex space-x-3">
                <Button onClick={updateProfile}>Save Changes</Button>
                <Button variant="secondary" onClick={() => setIsEditing(false)}>
                  Cancel
                </Button>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center space-x-4">
                <div className="flex-shrink-0">
                  {profile?.profile_photo ? (
                    <img
                      src={profile.profile_photo}
                      alt={profile.name}
                      className="h-20 w-20 rounded-full object-cover"
                    />
                  ) : (
                    <div className="h-20 w-20 bg-gray-300 rounded-full flex items-center justify-center">
                      <User className="h-8 w-8 text-gray-600" />
                    </div>
                  )}
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-gray-900">{profile?.name}</h3>
                  {profile?.location && (
                    <div className="flex items-center text-gray-600 mt-1">
                      <MapPin className="h-4 w-4 mr-1" />
                      {profile.location}
                    </div>
                  )}
                  <Badge variant={profile?.is_public ? 'success' : 'secondary'} className="mt-2">
                    {profile?.is_public ? 'Public Profile' : 'Private Profile'}
                  </Badge>
                </div>
              </div>

              {profile?.bio && (
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">About Me</h4>
                  <p className="text-gray-700">{profile.bio}</p>
                </div>
              )}

              {profile?.availability && profile.availability.length > 0 && (
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Availability</h4>
                  <div className="flex flex-wrap gap-2">
                    {profile.availability.map((time, index) => (
                      <Badge key={index} variant="secondary">{time}</Badge>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Skills Section */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold text-gray-900">My Skills</h2>
            <Button size="sm" className="flex items-center space-x-1">
              <Plus className="h-4 w-4" />
              <span>Add Skill</span>
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {skills.length > 0 ? (
            <div className="space-y-4">
              {skills.map((skill) => (
                <div key={skill.id} className="p-4 border border-gray-200 rounded-lg">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <h4 className="font-semibold text-gray-900">{skill.name}</h4>
                        <Badge variant="secondary">{skill.category}</Badge>
                        <Badge variant={skill.level === 'advanced' ? 'danger' : skill.level === 'intermediate' ? 'warning' : 'success'}>
                          {skill.level}
                        </Badge>
                        {skill.is_offered && <Badge variant="primary">Offered</Badge>}
                        {skill.is_wanted && <Badge variant="secondary">Wanted</Badge>}
                      </div>
                      <p className="text-gray-600">{skill.description}</p>
                    </div>
                    <div className="flex space-x-2 ml-4">
                      <Button variant="ghost" size="sm">
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="sm" onClick={() => deleteSkill(skill.id)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <User className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No skills added yet</h3>
              <p className="text-gray-600 mb-4">Start by adding your first skill to connect with others</p>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Add Your First Skill
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}