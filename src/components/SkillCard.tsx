import React from 'react'
import { Card, CardContent, CardHeader } from './ui/Card'
import { Button } from './ui/Button'
import { Badge } from './ui/Badge'
import { Star, User, MapPin } from 'lucide-react'

interface SkillCardProps {
  skill: {
    id: string
    name: string
    description: string
    category: string
    level: 'beginner' | 'intermediate' | 'advanced'
    user: {
      name: string
      location?: string
      profile_photo?: string
      rating?: number
    }
  }
  onRequestSwap?: () => void
  showUser?: boolean
}

export function SkillCard({ skill, onRequestSwap, showUser = true }: SkillCardProps) {
  const levelColors = {
    beginner: 'bg-green-100 text-green-800',
    intermediate: 'bg-yellow-100 text-yellow-800',
    advanced: 'bg-red-100 text-red-800'
  }

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader>
        <div className="flex justify-between items-start">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">{skill.name}</h3>
            <Badge className={levelColors[skill.level]}>
              {skill.level}
            </Badge>
          </div>
          <Badge variant="secondary">{skill.category}</Badge>
        </div>
      </CardHeader>

      <CardContent>
        <p className="text-gray-600 mb-4">{skill.description}</p>
        
        {showUser && (
          <div className="flex items-center space-x-3 mb-4 p-3 bg-gray-50 rounded-lg">
            <div className="flex-shrink-0">
              {skill.user.profile_photo ? (
                <img
                  src={skill.user.profile_photo}
                  alt={skill.user.name}
                  className="h-10 w-10 rounded-full object-cover"
                />
              ) : (
                <div className="h-10 w-10 bg-gray-300 rounded-full flex items-center justify-center">
                  <User className="h-5 w-5 text-gray-600" />
                </div>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900">{skill.user.name}</p>
              {skill.user.location && (
                <div className="flex items-center text-sm text-gray-500">
                  <MapPin className="h-3 w-3 mr-1" />
                  {skill.user.location}
                </div>
              )}
              {skill.user.rating && (
                <div className="flex items-center text-sm text-gray-500">
                  <Star className="h-3 w-3 mr-1 fill-current text-yellow-400" />
                  {skill.user.rating.toFixed(1)}
                </div>
              )}
            </div>
          </div>
        )}

        {onRequestSwap && (
          <Button onClick={onRequestSwap} className="w-full">
            Request Swap
          </Button>
        )}
      </CardContent>
    </Card>
  )
}