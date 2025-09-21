import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Plus, Bell, Clock, CheckCircle, X, Edit } from 'lucide-react'
import { remindersAPI, childrenAPI } from '../services/api'
import toast from 'react-hot-toast'

const Reminders = () => {
  const [reminders, setReminders] = useState([])
  const [children, setChildren] = useState([])
  const [loading, setLoading] = useState(true)
  const [showAddForm, setShowAddForm] = useState(false)
  const [formData, setFormData] = useState({
    childId: '',
    type: 'medication',
    title: '',
    time: '',
    date: '',
    frequency: 'once',
    notes: ''
  })

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      const [remindersRes, childrenRes] = await Promise.all([
        remindersAPI.getAll(),
        childrenAPI.getAll()
      ])
      setReminders(remindersRes.data)
      setChildren(childrenRes.data)
    } catch (error) {
      console.error('Error loading data:', error)
      toast.error('Failed to load reminders')
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      await remindersAPI.create(formData)
      toast.success('Reminder added successfully!')
      setShowAddForm(false)
      setFormData({
        childId: '',
        type: 'medication',
        title: '',
        time: '',
        date: '',
        frequency: 'once',
        notes: ''
      })
      loadData()
    } catch (error) {
      console.error('Error creating reminder:', error)
      toast.error('Failed to add reminder')
    }
  }

  const handleToggle = async (id) => {
    try {
      await remindersAPI.toggle(id)
      toast.success('Reminder status updated!')
      loadData()
    } catch (error) {
      console.error('Error toggling reminder:', error)
      toast.error('Failed to update reminder')
    }
  }

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this reminder?')) {
      try {
        await remindersAPI.delete(id)
        toast.success('Reminder deleted successfully!')
        loadData()
      } catch (error) {
        console.error('Error deleting reminder:', error)
        toast.error('Failed to delete reminder')
      }
    }
  }

  const getTypeIcon = (type) => {
    switch (type) {
      case 'medication':
        return '💊'
      case 'appointment':
        return '📅'
      case 'meal':
        return '🍽️'
      case 'activity':
        return '🎯'
      default:
        return '⏰'
    }
  }

  const getChildName = (childId) => {
    const child = children.find(c => c.id === childId)
    return child ? child.name : 'Unknown Child'
  }

  const activeReminders = reminders.filter(r => r.isActive)
  const upcomingReminders = reminders.filter(r => {
    if (!r.isActive) return false
    if (r.frequency === 'daily') return true
    if (r.date) {
      const reminderDate = new Date(r.date)
      const today = new Date()
      const tomorrow = new Date(today.getTime() + 24 * 60 * 60 * 1000)
      return reminderDate >= today && reminderDate <= tomorrow
    }
    return false
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
          <h1 className="text-3xl font-bold text-gray-900">Reminders</h1>
          <p className="text-gray-600">Manage health reminders and notifications</p>
        </div>
        <button
          onClick={() => setShowAddForm(true)}
          className="btn-primary flex items-center space-x-2"
        >
          <Plus className="h-5 w-5" />
          <span>Add Reminder</span>
        </button>
      </div>

      {/* Add Reminder Form */}
      {showAddForm && (
        <div className="card">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Add New Reminder</h2>
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
                  <option value="medication">Medication</option>
                  <option value="appointment">Appointment</option>
                  <option value="meal">Meal</option>
                  <option value="activity">Activity</option>
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
                <label className="label">Frequency</label>
                <select
                  value={formData.frequency}
                  onChange={(e) => setFormData({ ...formData, frequency: e.target.value })}
                  className="input-field"
                  required
                >
                  <option value="once">Once</option>
                  <option value="daily">Daily</option>
                  <option value="weekly">Weekly</option>
                  <option value="monthly">Monthly</option>
                </select>
              </div>
              {formData.frequency === 'once' && (
                <div>
                  <label className="label">Date</label>
                  <input
                    type="date"
                    value={formData.date}
                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                    className="input-field"
                  />
                </div>
              )}
              <div>
                <label className="label">Time</label>
                <input
                  type="time"
                  value={formData.time}
                  onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                  className="input-field"
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
                Add Reminder
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

      {/* Upcoming Reminders */}
      {upcomingReminders.length > 0 && (
        <div className="card">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Upcoming Reminders</h2>
          <div className="space-y-3">
            {upcomingReminders.map((reminder) => (
              <div key={reminder.id} className="flex items-center justify-between p-4 bg-blue-50 rounded-lg border border-blue-200">
                <div className="flex items-center space-x-3">
                  <span className="text-2xl">{getTypeIcon(reminder.type)}</span>
                  <div>
                    <h3 className="font-medium text-gray-900">{reminder.title}</h3>
                    <p className="text-sm text-gray-600">
                      {getChildName(reminder.childId)} • {reminder.frequency}
                      {reminder.time && ` at ${reminder.time}`}
                      {reminder.date && ` on ${new Date(reminder.date).toLocaleDateString()}`}
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => handleToggle(reminder.id)}
                    className={`px-3 py-1 rounded-full text-xs font-medium ${
                      reminder.isActive 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-gray-100 text-gray-800'
                    }`}
                  >
                    {reminder.isActive ? 'Active' : 'Inactive'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* All Reminders */}
      <div className="card">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">All Reminders</h2>
        {reminders.length > 0 ? (
          <div className="space-y-4">
            {reminders
              .sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt))
              .map((reminder) => (
                <div key={reminder.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                  <div className="flex items-center space-x-4">
                    <span className="text-2xl">{getTypeIcon(reminder.type)}</span>
                    <div>
                      <h3 className="font-medium text-gray-900">{reminder.title}</h3>
                      <div className="flex items-center space-x-4 text-sm text-gray-600">
                        <span>{getChildName(reminder.childId)}</span>
                        <span>•</span>
                        <span className="capitalize">{reminder.type}</span>
                        <span>•</span>
                        <span className="capitalize">{reminder.frequency}</span>
                        {reminder.time && (
                          <>
                            <span>•</span>
                            <span>{reminder.time}</span>
                          </>
                        )}
                        {reminder.date && (
                          <>
                            <span>•</span>
                            <span>{new Date(reminder.date).toLocaleDateString()}</span>
                          </>
                        )}
                      </div>
                      {reminder.notes && (
                        <p className="text-sm text-gray-500 mt-1">{reminder.notes}</p>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => handleToggle(reminder.id)}
                      className={`px-2 py-1 rounded-full text-xs font-medium ${
                        reminder.isActive 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-gray-100 text-gray-800'
                      }`}
                    >
                      {reminder.isActive ? 'Active' : 'Inactive'}
                    </button>
                    <button
                      onClick={() => handleDelete(reminder.id)}
                      className="p-1 text-gray-400 hover:text-red-600 transition-colors"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <Bell className="h-12 w-12 text-gray-400 mx-auto mb-3" />
            <p className="text-gray-500">No reminders set yet</p>
            <button
              onClick={() => setShowAddForm(true)}
              className="btn-primary mt-4"
            >
              Add First Reminder
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

export default Reminders
