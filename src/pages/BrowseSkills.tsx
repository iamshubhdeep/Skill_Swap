import React, { useState, useEffect } from 'react'
import { Input } from '../components/ui/Input'
import { Button } from '../components/ui/Button'
import { SkillCard } from '../components/SkillCard'
import { supabase } from '../lib/supabase'
import { Search, Filter } from 'lucide-react'

export function BrowseSkills() {
  const [skills, setSkills] = useState([])
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('')
  const [selectedLevel, setSelectedLevel] = useState('')
  const [loading, setLoading] = useState(true)

  const categories = [
    'Programming', 'Design', 'Marketing', 'Music', 'Languages', 
    'Cooking', 'Photography', 'Writing', 'Teaching', 'Other'
  ]

  const levels = ['beginner', 'intermediate', 'advanced']

  useEffect(() => {
    loadSkills()
  }, [searchTerm, selectedCategory, selectedLevel])

  const loadSkills = async () => {
    try {
      setLoading(true)
      let query = supabase
        .from('skills')
        .select(`
          *,
          user:profiles!skills_user_id_fkey (
            name,
            location,
            profile_photo,
            is_public
          )
        `)
        .eq('is_offered', true)
        .eq('is_approved', true)
        .eq('user.is_public', true)

      if (searchTerm) {
        query = query.or(`name.ilike.%${searchTerm}%,description.ilike.%${searchTerm}%`)
      }

      if (selectedCategory) {
        query = query.eq('category', selectedCategory)
      }

      if (selectedLevel) {
        query = query.eq('level', selectedLevel)
      }

      const { data, error } = await query.order('created_at', { ascending: false })

      if (error) throw error
      setSkills(data || [])
    } catch (error) {
      console.error('Error loading skills:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleRequestSwap = (skillId: string) => {
    // Navigate to swap request modal/page
    console.log('Request swap for skill:', skillId)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Browse Skills</h1>
        <p className="text-gray-600 mt-1">Discover skills offered by our community members</p>
      </div>

      {/* Search and Filters */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="md:col-span-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
              <Input
                placeholder="Search skills..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
          
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="">All Categories</option>
            {categories.map(category => (
              <option key={category} value={category}>{category}</option>
            ))}
          </select>

          <select
            value={selectedLevel}
            onChange={(e) => setSelectedLevel(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="">All Levels</option>
            {levels.map(level => (
              <option key={level} value={level}>
                {level.charAt(0).toUpperCase() + level.slice(1)}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Results */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="bg-gray-200 animate-pulse rounded-xl h-64"></div>
          ))}
        </div>
      ) : skills.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {skills.map((skill) => (
            <SkillCard
              key={skill.id}
              skill={{
                ...skill,
                user: skill.user
              }}
              onRequestSwap={() => handleRequestSwap(skill.id)}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <Search className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No skills found</h3>
          <p className="text-gray-600">Try adjusting your search criteria</p>
        </div>
      )}
    </div>
  )
}