import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Plus, Heart, Calendar, CheckCircle, Clock, AlertCircle } from 'lucide-react'
import { healthAPI, childrenAPI } from '../services/api'
import toast from 'react-hot-toast'

const HealthRecords = () => {
  const [records, setRecords] = useState([])
  const [children, setChildren] = useState([])
  const [loading, setLoading] = useState(true)
  const [showAddForm, setShowAddForm] = useState(false)
  const [formData, setFormData] = useState({
    childId: '',
    type: 'checkup',
    title: '',
    date: '',
    notes: ''
  })

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      const [recordsRes, childrenRes] = await Promise.all([
        healthAPI.getAll(),
        childrenAPI.getAll()
      ])
      setRecords(recordsRes.data)
      setChildren(childrenRes.data)
    } catch (error) {
      console.error('Error loading data:', error)
      toast.error('Failed to load health records')
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      await healthAPI.create({
        ...formData,
        status: 'scheduled'
      })
      toast.success('Health record added successfully!')
      setShowAddForm(false)
      setFormData({
        childId: '',
        type: 'checkup',
        title: '',
        date: '',
        notes: ''
      })
      loadData()
    } catch (error) {
      console.error('Error creating health record:', error)
      toast.error('Failed to add health record')
    }
  }

  const handleComplete = async (id) => {
    try {
      await healthAPI.complete(id)
      toast.success('Record marked as completed!')
      loadData()
    } catch (error) {
      console.error('Error completing record:', error)
      toast.error('Failed to complete record')
    }
  }

  const getStatusIcon = (status) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-5 w-5 text-green-500" />
      case 'scheduled':
        return <Clock className="h-5 w-5 text-yellow-500" />
      case 'cancelled':
        return <AlertCircle className="h-5 w-5 text-red-500" />
      default:
        return <Clock className="h-5 w-5 text-gray-500" />
    }
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800'
      case 'scheduled':
        return 'bg-yellow-100 text-yellow-800'
      case 'cancelled':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getTypeIcon = (type) => {
    switch (type) {
      case 'vaccination':
        return '💉'
      case 'checkup':
        return '🩺'
      case 'medication':
        return '💊'
      case 'emergency':
        return '🚨'
      default:
        return '📋'
    }
  }

  const getChildName = (childId) => {
    const child = children.find(c => c.id === childId)
    return child ? child.name : 'Unknown Child'
  }

  const upcomingRecords = records.filter(record => {
    const recordDate = new Date(record.date)
    const today = new Date()
    const nextWeek = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000)
    return recordDate >= today && recordDate <= nextWeek && record.status === 'scheduled'
  })

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
          <h1 className="text-3xl font-bold text-gray-900">Health Records</h1>
          <p className="text-gray-600">Track and manage your children's health records</p>
        </div>
        <button
          onClick={() => setShowAddForm(true)}
          className="btn-primary flex items-center space-x-2"
        >
          <Plus className="h-5 w-5" />
          <span>Add Record</span>
        </button>
      </div>

      {/* Add Record Form */}
      {showAddForm && (
        <div className="card">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Add Health Record</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="label">Child</label>
                <select
                  value={formData.childId}
                  onChange={(e) => setFormData({ ...formData, childId: e.target.value })}
                  className="input-field"
                  required
                >
                  <option value="">Select child</option>
                  {children.map((child) => (
                    <option key={child.id} value={child.id}>
                      {child.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="label">Type</label>
                <select
                  value={formData.type}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                  className="input-field"
                  required
                >
                  <option value="checkup">Checkup</option>
                  <option value="vaccination">Vaccination</option>
                  <option value="medication">Medication</option>
                  <option value="emergency">Emergency</option>
                </select>
              </div>
              <div>
                <label className="label">Title</label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="input-field"
                  required
                />
              </div>
              <div>
                <label className="label">Date</label>
                <input
                  type="date"
                  value={formData.date}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                  className="input-field"
                  required
                />
              </div>
            </div>
            <div>
              <label className="label">Notes</label>
              <textarea
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                className="input-field"
                rows="3"
              />
            </div>
            <div className="flex space-x-3">
              <button type="submit" className="btn-primary">
                Add Record
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

      {/* Upcoming Records */}
      {upcomingRecords.length > 0 && (
        <div className="card">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Upcoming This Week</h2>
          <div className="space-y-3">
            {upcomingRecords.map((record) => (
              <div key={record.id} className="flex items-center justify-between p-4 bg-yellow-50 rounded-lg border border-yellow-200">
                <div className="flex items-center space-x-3">
                  <span className="text-2xl">{getTypeIcon(record.type)}</span>
                  <div>
                    <h3 className="font-medium text-gray-900">{record.title}</h3>
                    <p className="text-sm text-gray-600">
                      {getChildName(record.childId)} • {new Date(record.date).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(record.status)}`}>
                    {record.status}
                  </span>
                  {record.status === 'scheduled' && (
                    <button
                      onClick={() => handleComplete(record.id)}
                      className="btn-primary text-sm"
                    >
                      Mark Complete
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* All Records */}
      <div className="card">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">All Health Records</h2>
        {records.length > 0 ? (
          <div className="space-y-4">
            {records
              .sort((a, b) => new Date(b.date) - new Date(a.date))
              .map((record) => (
                <div key={record.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                  <div className="flex items-center space-x-4">
                    <span className="text-2xl">{getTypeIcon(record.type)}</span>
                    <div>
                      <h3 className="font-medium text-gray-900">{record.title}</h3>
                      <div className="flex items-center space-x-4 text-sm text-gray-600">
                        <span>{getChildName(record.childId)}</span>
                        <span>•</span>
                        <span>{new Date(record.date).toLocaleDateString()}</span>
                        <span>•</span>
                        <span className="capitalize">{record.type}</span>
                      </div>
                      {record.notes && (
                        <p className="text-sm text-gray-500 mt-1">{record.notes}</p>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    {getStatusIcon(record.status)}
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(record.status)}`}>
                      {record.status}
                    </span>
                    {record.status === 'scheduled' && (
                      <button
                        onClick={() => handleComplete(record.id)}
                        className="btn-primary text-sm"
                      >
                        Complete
                      </button>
                    )}
                  </div>
                </div>
              ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <Heart className="h-12 w-12 text-gray-400 mx-auto mb-3" />
            <p className="text-gray-500">No health records yet</p>
            <button
              onClick={() => setShowAddForm(true)}
              className="btn-primary mt-4"
            >
              Add First Record
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

export default HealthRecords
