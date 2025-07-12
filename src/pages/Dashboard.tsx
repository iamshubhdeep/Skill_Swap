import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader } from '../components/ui/Card'
import { Button } from '../components/ui/Button'
import { Badge } from '../components/ui/Badge'
import { supabase } from '../lib/supabase'
import { useAuth } from '../hooks/useAuth'
import { 
  Plus, 
  TrendingUp, 
  Users, 
  MessageSquare, 
  Star,
  BookOpen,
  Target,
  Clock
} from 'lucide-react'
import { Link } from 'react-router-dom'

export function Dashboard() {
  const { user } = useAuth()
  const [stats, setStats] = useState({
    skillsOffered: 0,
    skillsWanted: 0,
    activeSwaps: 0,
    completedSwaps: 0,
    averageRating: 0
  })
  const [recentActivity, setRecentActivity] = useState([])

  useEffect(() => {
    if (user) {
      loadDashboardData()
    }
  }, [user])

  const loadDashboardData = async () => {
    try {
      // Load user stats
      const { data: skillsData } = await supabase
        .from('skills')
        .select('*')
        .eq('user_id', user?.id)

      const offeredSkills = skillsData?.filter(skill => skill.is_offered) || []
      const wantedSkills = skillsData?.filter(skill => skill.is_wanted) || []

      const { data: swapsData } = await supabase
        .from('swap_requests')
        .select('*')
        .or(`requester_id.eq.${user?.id},provider_id.eq.${user?.id}`)

      const activeSwaps = swapsData?.filter(swap => 
        ['pending', 'accepted'].includes(swap.status)
      ) || []
      
      const completedSwaps = swapsData?.filter(swap => 
        swap.status === 'completed'
      ) || []

      const { data: ratingsData } = await supabase
        .from('ratings')
        .select('rating')
        .eq('rated_user_id', user?.id)

      const avgRating = ratingsData?.length > 0
        ? ratingsData.reduce((sum, r) => sum + r.rating, 0) / ratingsData.length
        : 0

      setStats({
        skillsOffered: offeredSkills.length,
        skillsWanted: wantedSkills.length,
        activeSwaps: activeSwaps.length,
        completedSwaps: completedSwaps.length,
        averageRating: avgRating
      })
    } catch (error) {
      console.error('Error loading dashboard data:', error)
    }
  }

  const statCards = [
    {
      title: 'Skills Offered',
      value: stats.skillsOffered,
      icon: BookOpen,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50'
    },
    {
      title: 'Skills Wanted',
      value: stats.skillsWanted,
      icon: Target,
      color: 'text-green-600',
      bgColor: 'bg-green-50'
    },
    {
      title: 'Active Swaps',
      value: stats.activeSwaps,
      icon: MessageSquare,
      color: 'text-orange-600',
      bgColor: 'bg-orange-50'
    },
    {
      title: 'Completed Swaps',
      value: stats.completedSwaps,
      icon: TrendingUp,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50'
    }
  ]

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600 mt-1">Welcome back! Here's what's happening with your skills.</p>
        </div>
        <div className="flex space-x-3">
          <Link to="/profile/skills">
            <Button className="flex items-center space-x-2">
              <Plus className="h-4 w-4" />
              <span>Add Skill</span>
            </Button>
          </Link>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat, index) => {
          const Icon = stat.icon
          return (
            <Card key={index} className="hover:shadow-md transition-shadow">
              <CardContent>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                    <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                  </div>
                  <div className={`${stat.bgColor} ${stat.color} p-3 rounded-lg`}>
                    <Icon className="h-6 w-6" />
                  </div>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Rating Display */}
      {stats.averageRating > 0 && (
        <Card>
          <CardContent>
            <div className="flex items-center space-x-4">
              <div className="bg-yellow-50 p-3 rounded-lg">
                <Star className="h-6 w-6 text-yellow-600 fill-current" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Your Average Rating</p>
                <p className="text-2xl font-bold text-gray-900">{stats.averageRating.toFixed(1)}</p>
              </div>
              <Badge variant="success">
                {stats.averageRating >= 4.5 ? 'Excellent' : 
                 stats.averageRating >= 4.0 ? 'Great' : 
                 stats.averageRating >= 3.5 ? 'Good' : 'Average'}
              </Badge>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Quick Actions */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card className="hover:shadow-md transition-shadow">
          <CardHeader>
            <h3 className="text-lg font-semibold text-gray-900">Browse Skills</h3>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600 mb-4">Discover new skills offered by our community</p>
            <Link to="/browse">
              <Button variant="secondary" className="w-full">
                Start Browsing
              </Button>
            </Link>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow">
          <CardHeader>
            <h3 className="text-lg font-semibold text-gray-900">Manage Profile</h3>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600 mb-4">Update your skills and preferences</p>
            <Link to="/profile">
              <Button variant="secondary" className="w-full">
                Edit Profile
              </Button>
            </Link>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow">
          <CardHeader>
            <h3 className="text-lg font-semibold text-gray-900">Active Swaps</h3>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600 mb-4">Check your ongoing skill exchanges</p>
            <Link to="/swaps">
              <Button variant="secondary" className="w-full">
                View Swaps
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}