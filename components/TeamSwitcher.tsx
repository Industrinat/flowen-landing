// components/TeamSwitcher.tsx
'use client'
import { useTeam } from '@/hooks/useTeam'
import { ChevronDown, Users, Plus, Settings, Crown, Shield } from 'lucide-react'
import { useState, useRef, useEffect } from 'react'

export function TeamSwitcher() {
  const { currentTeam, teams, switchTeam, createTeam } = useTeam()
  const [isOpen, setIsOpen] = useState(false)
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [newTeamName, setNewTeamName] = useState('')
  const [isCreating, setIsCreating] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
        setShowCreateForm(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleCreateTeam = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newTeamName.trim() || isCreating) return

    setIsCreating(true)
    try {
      const newTeam = await createTeam(newTeamName.trim())
      setNewTeamName('')
      setShowCreateForm(false)
      setIsOpen(false)
      // Auto-switch to new team
      switchTeam(newTeam.id)
    } catch (error) {
      alert('Kunde inte skapa team')
    } finally {
      setIsCreating(false)
    }
  }

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'owner': return <Crown className="w-3 h-3 text-yellow-500" />
      case 'admin': return <Shield className="w-3 h-3 text-blue-500" />
      default: return <Users className="w-3 h-3 text-gray-400" />
    }
  }

  const getRoleBadge = (role: string) => {
    const colors = {
      owner: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      admin: 'bg-blue-100 text-blue-800 border-blue-200', 
      member: 'bg-gray-100 text-gray-600 border-gray-200'
    }
    return colors[role as keyof typeof colors] || colors.member
  }

  if (!currentTeam && teams.length === 0) {
    return (
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-xl p-4 max-w-sm">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-10 h-10 bg-blue-500 rounded-xl flex items-center justify-center">
            <Users className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="font-semibold text-gray-900">Välkommen!</h3>
            <p className="text-sm text-gray-600">Skapa ditt första team</p>
          </div>
        </div>
        <button
          onClick={() => setShowCreateForm(true)}
          className="w-full bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors font-medium"
        >
          Kom igång →
        </button>
      </div>
    )
  }

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Main Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-3 px-4 py-3 bg-white border border-gray-200 rounded-xl hover:shadow-md hover:border-gray-300 transition-all duration-200 min-w-64"
      >
        {/* Team Avatar */}
        <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center text-white font-bold text-lg shadow-sm">
          {currentTeam?.name[0]?.toUpperCase() || 'T'}
        </div>
        
        {/* Team Info */}
        <div className="flex-1 text-left">
          <div className="font-semibold text-gray-900 truncate">
            {currentTeam?.name || 'Välj team'}
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-500">
            {getRoleIcon(currentTeam?.role || 'member')}
            <span className="capitalize">{currentTeam?.role || 'medlem'}</span>
            <span>•</span>
            <span>{teams.length} team{teams.length !== 1 ? 's' : ''}</span>
          </div>
        </div>
        
        {/* Dropdown Arrow */}
        <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute top-full mt-2 w-full bg-white border border-gray-200 rounded-xl shadow-xl z-50 py-2">
          
          {/* Header */}
          <div className="px-4 py-2 border-b border-gray-100">
            <div className="text-xs font-medium text-gray-500 uppercase tracking-wide">
              Dina Teams ({teams.length})
            </div>
          </div>

          {/* Teams List */}
          <div className="max-h-64 overflow-y-auto">
            {teams.map(team => (
              <button
                key={team.id}
                onClick={() => {
                  switchTeam(team.id)
                  setIsOpen(false)
                }}
                className={`w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-gray-50 transition-colors ${
                  team.id === currentTeam?.id 
                    ? 'bg-blue-50 border-r-2 border-blue-500' 
                    : ''
                }`}
              >
                {/* Team Avatar */}
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-sm font-semibold ${
                  team.id === currentTeam?.id
                    ? 'bg-blue-500 text-white'
                    : 'bg-gray-100 text-gray-600'
                }`}>
                  {team.name[0]?.toUpperCase()}
                </div>
                
                {/* Team Details */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className={`font-medium truncate ${
                      team.id === currentTeam?.id ? 'text-blue-900' : 'text-gray-900'
                    }`}>
                      {team.name}
                    </span>
                    {getRoleIcon(team.role)}
                  </div>
                  <div className="flex items-center gap-2 text-xs text-gray-500">
                    <span className={`px-2 py-0.5 rounded-full border text-xs font-medium ${getRoleBadge(team.role)}`}>
                      {team.role}
                    </span>
                    <span>•</span>
                    <span>{team.memberCount || 1} medlemmar</span>
                    <span>•</span>
                    <span>{team.fileCount || 0} filer</span>
                  </div>
                </div>

                {/* Current Team Indicator */}
                {team.id === currentTeam?.id && (
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                )}
              </button>
            ))}
          </div>

          {/* Actions */}
          <div className="border-t border-gray-100 pt-2">
            <button
              onClick={() => {
                setShowCreateForm(true)
                setIsOpen(false)
              }}
              className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-gray-50 transition-colors text-blue-600"
            >
              <div className="w-8 h-8 border-2 border-dashed border-blue-300 rounded-lg flex items-center justify-center">
                <Plus className="w-4 h-4" />
              </div>
              <div>
                <div className="font-medium">Skapa nytt team</div>
                <div className="text-xs text-gray-500">Starta ett nytt projekt</div>
              </div>
            </button>
            
            <button
              onClick={() => {
                // TODO: Implement team settings
                setIsOpen(false)
              }}
              className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-gray-50 transition-colors text-gray-600"
            >
              <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center">
                <Settings className="w-4 h-4" />
              </div>
              <div>
                <div className="font-medium">Team-inställningar</div>
                <div className="text-xs text-gray-500">Hantera medlemmar och behörigheter</div>
              </div>
            </button>
          </div>
        </div>
      )}

      {/* Create Team Modal */}
      {showCreateForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-md">
            {/* Header */}
            <div className="p-6 border-b border-gray-100">
              <h3 className="text-xl font-semibold text-gray-900">Skapa nytt team</h3>
              <p className="text-sm text-gray-600 mt-1">
                Starta ett nytt team för ditt projekt eller organisation
              </p>
            </div>
            
            {/* Form */}
            <form onSubmit={handleCreateTeam} className="p-6">
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Team namn
                </label>
                <input
                  type="text"
                  value={newTeamName}
                  onChange={(e) => setNewTeamName(e.target.value)}
                  placeholder="t.ex. Marknadsföring, Utveckling, Mitt Företag"
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                  autoFocus
                  disabled={isCreating}
                />
              </div>
              
              {/* Buttons */}
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setShowCreateForm(false)
                    setNewTeamName('')
                  }}
                  disabled={isCreating}
                  className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors disabled:opacity-50"
                >
                  Avbryt
                </button>
                <button
                  type="submit"
                  disabled={!newTeamName.trim() || isCreating}
                  className="flex-1 px-4 py-3 bg-blue-500 text-white rounded-xl hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium"
                >
                  {isCreating ? 'Skapar...' : 'Skapa team'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}