import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader } from '../components/ui/Card'
import { Button } from '../components/ui/Button'
import { Badge } from '../components/ui/Badge'
import { supabase } from '../lib/supabase'
import { useAuth } from '../hooks/useAuth'
import { MessageSquare, Clock, CheckCircle, XCircle, Star } from 'lucide-react'

export function MySwaps() {
  const { user } = useAuth()
  const [swaps, setSwaps] = useState([])
  const [activeTab, setActiveTab] = useState('all')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (user) {
      loadSwaps()
    }
  }, [user, activeTab])

  const loadSwaps = async () => {
    try {
      setLoading(true)
      let query = supabase
        .from('swap_requests')
        .select(`
          *,
          requester:profiles!swap_requests_requester_id_fkey (name, profile_photo),
          provider:profiles!swap_requests_provider_id_fkey (name, profile_photo),
          requested_skill:skills!swap_requests_requested_skill_id_fkey (name, description),
          offered_skill:skills!swap_requests_offered_skill_id_fkey (name, description)
        `)
        .or(`requester_id.eq.${user?.id},provider_id.eq.${user?.id}`)

      if (activeTab !== 'all') {
        query = query.eq('status', activeTab)
      }

      const { data, error } = await query.order('created_at', { ascending: false })

      if (error) throw error
      setSwaps(data || [])
    } catch (error) {
      console.error('Error loading swaps:', error)
    } finally {
      setLoading(false)
    }
  }

  const updateSwapStatus = async (swapId: string, status: string) => {
    try {
      const { error } = await supabase
        .from('swap_requests')
        .update({ status, updated_at: new Date().toISOString() })
        .eq('id', swapId)

      if (error) throw error
      loadSwaps()
    } catch (error) {
      console.error('Error updating swap status:', error)
    }
  }

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      pending: { variant: 'warning' as const, text: 'Pending' },
      accepted: { variant: 'success' as const, text: 'Accepted' },
      rejected: { variant: 'danger' as const, text: 'Rejected' },
      completed: { variant: 'primary' as const, text: 'Completed' },
      cancelled: { variant: 'secondary' as const, text: 'Cancelled' }
    }
    
    const config = statusConfig[status as keyof typeof statusConfig] || { variant: 'secondary' as const, text: status }
    return <Badge variant={config.variant}>{config.text}</Badge>
  }

  const tabs = [
    { key: 'all', label: 'All Swaps' },
    { key: 'pending', label: 'Pending' },
    { key: 'accepted', label: 'Accepted' },
    { key: 'completed', label: 'Completed' }
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">My Swaps</h1>
        <p className="text-gray-600 mt-1">Manage your skill exchange requests</p>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === tab.key
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Swaps List */}
      {loading ? (
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="bg-gray-200 animate-pulse rounded-xl h-32"></div>
          ))}
        </div>
      ) : swaps.length > 0 ? (
        <div className="space-y-4">
          {swaps.map((swap) => {
            const isRequester = swap.requester_id === user?.id
            const otherUser = isRequester ? swap.provider : swap.requester
            
            return (
              <Card key={swap.id} className="hover:shadow-md transition-shadow">
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div className="flex items-center space-x-3">
                      <div className="flex-shrink-0">
                        {otherUser.profile_photo ? (
                          <img
                            src={otherUser.profile_photo}
                            alt={otherUser.name}
                            className="h-10 w-10 rounded-full object-cover"
                          />
                        ) : (
                          <div className="h-10 w-10 bg-gray-300 rounded-full flex items-center justify-center">
                            <span className="text-sm font-medium text-gray-600">
                              {otherUser.name.charAt(0)}
                            </span>
                          </div>
                        )}
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">
                          {isRequester ? 'Swap Request to' : 'Swap Request from'} {otherUser.name}
                        </h3>
                        <p className="text-sm text-gray-500">
                          {new Date(swap.created_at).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    {getStatusBadge(swap.status)}
                  </div>
                </CardHeader>

                <CardContent>
                  <div className="grid md:grid-cols-2 gap-4 mb-4">
                    <div className="p-4 bg-blue-50 rounded-lg">
                      <h4 className="font-medium text-blue-900 mb-2">
                        {isRequester ? 'You want to learn:' : 'They want to learn:'}
                      </h4>
                      <p className="text-blue-800 font-semibold">{swap.requested_skill.name}</p>
                      <p className="text-blue-700 text-sm mt-1">{swap.requested_skill.description}</p>
                    </div>
                    
                    <div className="p-4 bg-green-50 rounded-lg">
                      <h4 className="font-medium text-green-900 mb-2">
                        {isRequester ? 'You will teach:' : 'They will teach:'}
                      </h4>
                      <p className="text-green-800 font-semibold">{swap.offered_skill.name}</p>
                      <p className="text-green-700 text-sm mt-1">{swap.offered_skill.description}</p>
                    </div>
                  </div>

                  {swap.message && (
                    <div className="p-4 bg-gray-50 rounded-lg mb-4">
                      <h4 className="font-medium text-gray-900 mb-2">Message:</h4>
                      <p className="text-gray-700">{swap.message}</p>
                    </div>
                  )}

                  {/* Action Buttons */}
                  <div className="flex justify-end space-x-3">
                    {!isRequester && swap.status === 'pending' && (
                      <>
                        <Button
                          variant="danger"
                          size="sm"
                          onClick={() => updateSwapStatus(swap.id, 'rejected')}
                        >
                          <XCircle className="h-4 w-4 mr-1" />
                          Reject
                        </Button>
                        <Button
                          variant="primary"
                          size="sm"
                          onClick={() => updateSwapStatus(swap.id, 'accepted')}
                        >
                          <CheckCircle className="h-4 w-4 mr-1" />
                          Accept
                        </Button>
                      </>
                    )}
                    
                    {swap.status === 'accepted' && (
                      <Button
                        variant="primary"
                        size="sm"
                        onClick={() => updateSwapStatus(swap.id, 'completed')}
                      >
                        <Star className="h-4 w-4 mr-1" />
                        Mark Complete
                      </Button>
                    )}
                    
                    {isRequester && swap.status === 'pending' && (
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => updateSwapStatus(swap.id, 'cancelled')}
                      >
                        Cancel Request
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      ) : (
        <div className="text-center py-12">
          <MessageSquare className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No swaps found</h3>
          <p className="text-gray-600">Start by browsing skills and requesting swaps</p>
        </div>
      )}
    </div>
  )
}