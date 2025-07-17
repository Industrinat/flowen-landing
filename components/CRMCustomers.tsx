// components/CRMCustomers.tsx
'use client'
import { useTeam } from '@/hooks/useTeam'
import { useState, useEffect } from 'react'
import { 
  Users, 
  Plus, 
  Search, 
  Mail, 
  Phone, 
  Building, 
  DollarSign,
  Calendar,
  Eye,
  Edit,
  Trash2
} from 'lucide-react'

interface Customer {
  id: string
  name: string
  email?: string
  phone?: string
  company?: string
  value?: number
  status: string
  _count: {
    deals: number
    files: number
    contacts: number
  }
  createdAt: string
}

export function CRMModule() {
  const { currentTeam } = useTeam()
  const [customers, setCustomers] = useState<Customer[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [showAddForm, setShowAddForm] = useState(false)

  useEffect(() => {
    if (currentTeam) {
      fetchCustomers()
    }
  }, [currentTeam])

  const fetchCustomers = async () => {
    if (!currentTeam) return

    setIsLoading(true)
    setError(null)

    try {
      const token = window.getAccessToken?.()
      if (!token) throw new Error('No access token')

      const response = await fetch('/api/customers', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'X-Team-Id': currentTeam.id,
          'Content-Type': 'application/json'
        }
      })

      if (!response.ok) {
        throw new Error(`Failed to fetch customers: ${response.status}`)
      }

      const data = await response.json()
      setCustomers(data.customers || [])
    } catch (error) {
      console.error('Error fetching customers:', error)
      setError('Kunde inte ladda kunder')
    } finally {
      setIsLoading(false)
    }
  }

  const formatValue = (value?: number) => {
    if (!value) return '-'
    return new Intl.NumberFormat('sv-SE', {
      style: 'currency',
      currency: 'SEK',
      minimumFractionDigits: 0
    }).format(value)
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800'
      case 'prospect': return 'bg-blue-100 text-blue-800'
      default: return 'bg-gray-100 text-gray-600'
    }
  }

  if (!currentTeam) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
        <div className="text-center">
          <Users className="h-12 w-12 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Välj ett team</h3>
          <p className="text-gray-500">Välj ett team för att hantera kunder</p>
        </div>
      </div>
    )
  }

  if (isLoading) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-500">Laddar kunder...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
        <div className="text-center">
          <Users className="h-12 w-12 text-red-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-red-900 mb-2">Fel vid laddning</h3>
          <p className="text-red-600 mb-4">{error}</p>
          <button 
            onClick={fetchCustomers}
            className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600"
          >
            Försök igen
          </button>
        </div>
      </div>
    )
  }

  const filteredCustomers = customers.filter(customer =>
    customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    customer.company?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200">
      {/* Header */}
      <div className="p-6 border-b border-gray-100">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
              <Users className="w-6 h-6 text-blue-500" />
              CRM - Kunder
            </h3>
            <p className="text-sm text-gray-500 mt-1">
              {customers.length} kunder för {currentTeam.name}
            </p>
          </div>
          <button
            onClick={() => setShowAddForm(true)}
            className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
          >
            <Plus className="w-4 h-4" />
            Lägg till kund
          </button>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Sök kunder..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      {/* Customers List */}
      {filteredCustomers.length === 0 ? (
        <div className="p-8 text-center">
          <Users className="h-12 w-12 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            {customers.length === 0 ? 'Inga kunder än' : 'Inga matchande kunder'}
          </h3>
          <p className="text-gray-500 mb-4">
            {customers.length === 0 
              ? `Lägg till din första kund för ${currentTeam.name}`
              : 'Prova att söka med andra termer'
            }
          </p>
          {customers.length === 0 && (
            <button
              onClick={() => setShowAddForm(true)}
              className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
            >
              Lägg till första kunden
            </button>
          )}
        </div>
      ) : (
        <div className="divide-y divide-gray-100">
          {filteredCustomers.map((customer) => (
            <div key={customer.id} className="p-6 hover:bg-gray-50">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h4 className="text-lg font-semibold text-gray-900">{customer.name}</h4>
                    <span className={`px-2 py-1 text-xs font-medium rounded ${getStatusColor(customer.status)}`}>
                      {customer.status}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-4 mb-3 text-sm text-gray-600">
                    {customer.company && (
                      <div className="flex items-center gap-2">
                        <Building className="w-4 h-4" />
                        {customer.company}
                      </div>
                    )}
                    {customer.email && (
                      <div className="flex items-center gap-2">
                        <Mail className="w-4 h-4" />
                        {customer.email}
                      </div>
                    )}
                    {customer.phone && (
                      <div className="flex items-center gap-2">
                        <Phone className="w-4 h-4" />
                        {customer.phone}
                      </div>
                    )}
                    {customer.value && (
                      <div className="flex items-center gap-2">
                        <DollarSign className="w-4 h-4" />
                        {formatValue(customer.value)}
                      </div>
                    )}
                  </div>

                  <div className="flex items-center gap-4 text-xs text-gray-500">
                    <span>{customer._count.deals} deals</span>
                    <span>{customer._count.files} filer</span>
                    <span>Skapad {new Date(customer.createdAt).toLocaleDateString('sv-SE')}</span>
                  </div>
                </div>

                <div className="flex items-center gap-2 ml-4">
                  <button className="p-2 text-gray-400 hover:text-blue-500 rounded-lg">
                    <Eye className="w-4 h-4" />
                  </button>
                  <button className="p-2 text-gray-400 hover:text-green-500 rounded-lg">
                    <Edit className="w-4 h-4" />
                  </button>
                  <button className="p-2 text-gray-400 hover:text-red-500 rounded-lg">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add Customer Modal */}
      {showAddForm && (
        <AddCustomerModal 
          teamId={currentTeam.id}
          onClose={() => setShowAddForm(false)}
          onSuccess={() => {
            setShowAddForm(false)
            fetchCustomers()
          }}
        />
      )}
    </div>
  )
}

function AddCustomerModal({ teamId, onClose, onSuccess }: {
  teamId: string
  onClose: () => void
  onSuccess: () => void
}) {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    company: '',
    value: '',
    status: 'prospect'
  })
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.name.trim() || isSubmitting) return

    setIsSubmitting(true)
    try {
      const token = window.getAccessToken?.()
      const response = await fetch('/api/customers', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'X-Team-Id': teamId,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          ...formData,
          value: formData.value ? parseFloat(formData.value) : null
        })
      })

      if (!response.ok) throw new Error('Failed to create customer')
      
      onSuccess()
    } catch (error) {
      console.error('Error creating customer:', error)
      alert('Kunde inte skapa kund')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl w-full max-w-md">
        <div className="p-6 border-b border-gray-100">
          <h3 className="text-xl font-semibold text-gray-900">Lägg till ny kund</h3>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Namn *</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Företag</label>
            <input
              type="text"
              value={formData.company}
              onChange={(e) => setFormData({ ...formData, company: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Värde (SEK)</label>
            <input
              type="number"
              value={formData.value}
              onChange={(e) => setFormData({ ...formData, value: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>
          
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
            >
              Avbryt
            </button>
            <button
              type="submit"
              disabled={!formData.name.trim() || isSubmitting}
              className="flex-1 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50"
            >
              {isSubmitting ? 'Skapar...' : 'Skapa kund'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}