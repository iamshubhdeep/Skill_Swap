import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader } from '../components/ui/Card'
import { Button } from '../components/ui/Button'
import { Badge } from '../components/ui/Badge'
import { supabase } from '../lib/supabase'
import { 
  Shield, 
  Users, 
  MessageSquare, 
  AlertTriangle, 
  Download, 
  Ban,
  CheckCircle,
  XCircle
} from 'lucide-react'

export function AdminPanel() {
  const [stats, setStats] = useState({
    totalUsers: 0,
    activeSwaps: 0,
    pendingSkills: 0,
    reportedContent: 0
  })
  const [pendingSkills, setPendingSkills] = useState([])
  const [reportedUsers, setReportedUsers] = useState([])
  const [activeTab, setActiveTab] = useState('overview')

  useEffect(() => {
    loadAdminData()
  }, [])

  const loadAdminData = async () => {
    try {
      // Load stats
      const { data: usersData } = await supabase.from('profiles').select('id')
      const { data: swapsData } = await supabase.from('swap_requests').select('id').in('status', ['pending', 'accepted'])
      const { data: skillsData } = await supabase.from('skills').select('id').eq('is_approved', false)

      setStats({
        totalUsers: usersData?.length || 0,
        activeSwaps: swapsData?.length || 0,
        pendingSkills: skillsData?.length || 0,
        reportedContent: 0 // Would come from reports table
      })

      // Load pending skills for review
      const { data: pendingSkillsData } = await supabase
        .from('skills')
        .select(`
          *,
          user:profiles!skills_user_id_fkey (name, email)
        `)
        .eq('is_approved', false)
        .order('created_at', { ascending: false })

      setPendingSkills(pendingSkillsData || [])
    } catch (error) {
      console.error('Error loading admin data:', error)
    }
  }

  const approveSkill = async (skillId: string) => {
    try {
      const { error } = await supabase
        .from('skills')
        .update({ is_approved: true })
        .eq('id', skillId)

      if (error) throw error
      loadAdminData()
    } catch (error) {
      console.error('Error approving skill:', error)
    }
  }

  const rejectSkill = async (skillId: string) => {
    try {
      const { error } = await supabase
        .from('skills')
        .delete()
        .eq('id', skillId)

      if (error) throw error
      loadAdminData()
    } catch (error) {
      console.error('Error rejecting skill:', error)
    }
  }

  const banUser = async (userId: string) => {
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ is_banned: true })
        .eq('id', userId)

      if (error) throw error
      loadAdminData()
    } catch (error) {
      console.error('Error banning user:', error)
    }
  }

  const tabs = [
    { key: 'overview', label: 'Overview', icon: Shield },
    { key: 'skills', label: 'Skill Reviews', icon: CheckCircle },
    { key: 'users', label: 'User Management', icon: Users },
    { key: 'reports', label: 'Reports', icon: AlertTriangle }
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center space-x-3">
        <Shield className="h-8 w-8 text-blue-600" />
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Admin Panel</h1>
          <p className="text-gray-600">Platform management and moderation tools</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          {tabs.map((tab) => {
            const Icon = tab.icon
            return (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`flex items-center space-x-2 py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === tab.key
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <Icon className="h-4 w-4" />
                <span>{tab.label}</span>
              </button>
            )
          })}
        </nav>
      </div>

      {/* Content */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Total Users</p>
                    <p className="text-2xl font-bold text-gray-900">{stats.totalUsers}</p>
                  </div>
                  <Users className="h-8 w-8 text-blue-600" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Active Swaps</p>
                    <p className="text-2xl font-bold text-gray-900">{stats.activeSwaps}</p>
                  </div>
                  <MessageSquare className="h-8 w-8 text-green-600" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Pending Reviews</p>
                    <p className="text-2xl font-bold text-gray-900">{stats.pendingSkills}</p>
                  </div>
                  <CheckCircle className="h-8 w-8 text-yellow-600" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Reports</p>
                    <p className="text-2xl font-bold text-gray-900">{stats.reportedContent}</p>
                  </div>
                  <AlertTriangle className="h-8 w-8 text-red-600" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <h2 className="text-xl font-semibold text-gray-900">Quick Actions</h2>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Button className="flex items-center justify-center space-x-2">
                  <Download className="h-4 w-4" />
                  <span>Export User Data</span>
                </Button>
                <Button variant="secondary" className="flex items-center justify-center space-x-2">
                  <MessageSquare className="h-4 w-4" />
                  <span>Send Platform Message</span>
                </Button>
                <Button variant="secondary" className="flex items-center justify-center space-x-2">
                  <AlertTriangle className="h-4 w-4" />
                  <span>View System Health</span>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {activeTab === 'skills' && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold text-gray-900">Skills Pending Review</h2>
            <Badge variant="warning">{pendingSkills.length} pending</Badge>
          </div>

          {pendingSkills.length > 0 ? (
            <div className="space-y-4">
              {pendingSkills.map((skill) => (
                <Card key={skill.id}>
                  <CardContent>
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          <h3 className="font-semibold text-gray-900">{skill.name}</h3>
                          <Badge variant="secondary">{skill.category}</Badge>
                          <Badge variant={skill.level === 'advanced' ? 'danger' : skill.level === 'intermediate' ? 'warning' : 'success'}>
                            {skill.level}
                          </Badge>
                        </div>
                        <p className="text-gray-600 mb-2">{skill.description}</p>
                        <p className="text-sm text-gray-500">
                          Submitted by: {skill.user.name} ({skill.user.email})
                        </p>
                        <p className="text-sm text-gray-500">
                          Date: {new Date(skill.created_at).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="flex space-x-2 ml-4">
                        <Button
                          variant="danger"
                          size="sm"
                          onClick={() => rejectSkill(skill.id)}
                        >
                          <XCircle className="h-4 w-4 mr-1" />
                          Reject
                        </Button>
                        <Button
                          variant="primary"
                          size="sm"
                          onClick={() => approveSkill(skill.id)}
                        >
                          <CheckCircle className="h-4 w-4 mr-1" />
                          Approve
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card>
              <CardContent>
                <div className="text-center py-8">
                  <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">All caught up!</h3>
                  <p className="text-gray-600">No skills pending review at this time.</p>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {activeTab === 'users' && (
        <Card>
          <CardHeader>
            <h2 className="text-xl font-semibold text-gray-900">User Management</h2>
          </CardHeader>
          <CardContent>
            <div className="text-center py-8">
              <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">User management tools</h3>
              <p className="text-gray-600">Search, ban, and manage user accounts.</p>
            </div>
          </CardContent>
        </Card>
      )}

      {activeTab === 'reports' && (
        <Card>
          <CardHeader>
            <h2 className="text-xl font-semibold text-gray-900">Content Reports</h2>
          </CardHeader>
          <CardContent>
            <div className="text-center py-8">
              <AlertTriangle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No reports</h3>
              <p className="text-gray-600">All reported content has been reviewed.</p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}