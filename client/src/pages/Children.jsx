import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Plus, Baby, Edit, Trash2, Calendar, Heart } from 'lucide-react'
import { childrenAPI } from '../services/api'
import toast from 'react-hot-toast'

const Children = () => {
  const [children, setChildren] = useState([])
  const [loading, setLoading] = useState(true)
  const [showAddForm, setShowAddForm] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    dateOfBirth: '',
    gender: '',
    parentId: 'parent-1', // Default parent ID
    medicalHistory: {
      allergies: [],
      chronicConditions: [],
      medications: []
    }
  })

  useEffect(() => {
    loadChildren()
  }, [])

  const loadChildren = async () => {
    try {
      const response = await childrenAPI.getAll()
      setChildren(response.data)
    } catch (error) {
      console.error('Error loading children:', error)
      toast.error('Failed to load children')
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      await childrenAPI.create(formData)
      toast.success('Child added successfully!')
      setShowAddForm(false)
      setFormData({
        name: '',
        dateOfBirth: '',
        gender: '',
        parentId: 'parent-1',
        medicalHistory: {
          allergies: [],
          chronicConditions: [],
          medications: []
        }
      })
      loadChildren()
    } catch (error) {
      console.error('Error creating child:', error)
      toast.error('Failed to add child')
    }
  }

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this child? This will also delete all related records.')) {
      try {
        await childrenAPI.delete(id)
        toast.success('Child deleted successfully!')
        loadChildren()
      } catch (error) {
        console.error('Error deleting child:', error)
        toast.error('Failed to delete child')
      }
    }
  }

  const calculateAge = (dateOfBirth) => {
    const today = new Date()
    const birthDate = new Date(dateOfBirth)
    let age = today.getFullYear() - birthDate.getFullYear()
    const monthDiff = today.getMonth() - birthDate.getMonth()
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--
    }
    
    return age
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Children</h1>
          <p className="text-gray-600">Manage your children's profiles and health information</p>
        </div>
        <button
          onClick={() => setShowAddForm(true)}
          className="btn-primary flex items-center space-x-2"
        >
          <Plus className="h-5 w-5" />
          <span>Add Child</span>
        </button>
      </div>

      {/* Add Child Form */}
      {showAddForm && (
        <div className="card">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Add New Child</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="label">Name</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="input-field"
                  required
                />
              </div>
              <div>
                <label className="label">Date of Birth</label>
                <input
                  type="date"
                  value={formData.dateOfBirth}
                  onChange={(e) => setFormData({ ...formData, dateOfBirth: e.target.value })}
                  className="input-field"
                  required
                />
              </div>
              <div>
                <label className="label">Gender</label>
                <select
                  value={formData.gender}
                  onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                  className="input-field"
                  required
                >
                  <option value="">Select gender</option>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="other">Other</option>
                </select>
              </div>
            </div>
            <div className="flex space-x-3">
              <button type="submit" className="btn-primary">
                Add Child
              </button>
              <button
                type="button"
                onClick={() => setShowAddForm(false)}
                className="btn-secondary"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Children Grid */}
      {children.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {children.map((child) => (
            <div key={child.id} className="card hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div className="p-3 bg-primary-100 rounded-full">
                    <Baby className="h-6 w-6 text-primary-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">{child.name}</h3>
                    <p className="text-sm text-gray-500">
                      {calculateAge(child.dateOfBirth)} years old • {child.gender}
                    </p>
                  </div>
                </div>
                <div className="flex space-x-1">
                  <button
                    onClick={() => handleDelete(child.id)}
                    className="p-1 text-gray-400 hover:text-red-600 transition-colors"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>

              <div className="space-y-2 mb-4">
                <div className="flex items-center text-sm text-gray-600">
                  <Calendar className="h-4 w-4 mr-2" />
                  Born: {new Date(child.dateOfBirth).toLocaleDateString()}
                </div>
                {child.medicalHistory.allergies.length > 0 && (
                  <div className="flex items-center text-sm text-red-600">
                    <Heart className="h-4 w-4 mr-2" />
                    Allergies: {child.medicalHistory.allergies.join(', ')}
                  </div>
                )}
              </div>

              <div className="flex space-x-2">
                <Link
                  to={`/children/${child.id}`}
                  className="flex-1 btn-primary text-center"
                >
                  View Profile
                </Link>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="card text-center py-12">
          <Baby className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No children added yet</h3>
          <p className="text-gray-600 mb-6">
            Start by adding your first child to begin tracking their health and development.
          </p>
          <button
            onClick={() => setShowAddForm(true)}
            className="btn-primary"
          >
            Add Your First Child
          </button>
        </div>
      )}
    </div>
  )
}

export default Children
