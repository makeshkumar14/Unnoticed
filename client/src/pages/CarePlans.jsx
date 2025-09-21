import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Plus, ClipboardList, CheckCircle, Circle, Sparkles, Trash2 } from 'lucide-react'
import { carePlansAPI, childrenAPI } from '../services/api'
import toast from 'react-hot-toast'

const CarePlans = () => {
  const [carePlans, setCarePlans] = useState([])
  const [children, setChildren] = useState([])
  const [loading, setLoading] = useState(true)
  const [showAddForm, setShowAddForm] = useState(false)
  const [formData, setFormData] = useState({
    childId: '',
    title: '',
    description: '',
    specificNeeds: ''
  })

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      const [carePlansRes, childrenRes] = await Promise.all([
        carePlansAPI.getAll(),
        childrenAPI.getAll()
      ])
      setCarePlans(carePlansRes.data)
      setChildren(childrenRes.data)
    } catch (error) {
      console.error('Error loading data:', error)
      toast.error('Failed to load care plans')
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      await carePlansAPI.create(formData)
      toast.success('Care plan created successfully!')
      setShowAddForm(false)
      setFormData({
        childId: '',
        title: '',
        description: '',
        specificNeeds: ''
      })
      loadData()
    } catch (error) {
      console.error('Error creating care plan:', error)
      toast.error('Failed to create care plan')
    }
  }

  const handleTaskToggle = async (planId, taskId, completed) => {
    try {
      await carePlansAPI.updateTask(planId, taskId, { completed: !completed })
      toast.success('Task updated!')
      loadData()
    } catch (error) {
      console.error('Error updating task:', error)
      toast.error('Failed to update task')
    }
  }

  const handleRegenerate = async (planId, specificNeeds) => {
    try {
      await carePlansAPI.regenerate(planId, specificNeeds)
      toast.success('Care plan regenerated with AI!')
      loadData()
    } catch (error) {
      console.error('Error regenerating care plan:', error)
      toast.error('Failed to regenerate care plan')
    }
  }

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this care plan?')) {
      try {
        await carePlansAPI.delete(id)
        toast.success('Care plan deleted successfully!')
        loadData()
      } catch (error) {
        console.error('Error deleting care plan:', error)
        toast.error('Failed to delete care plan')
      }
    }
  }

  const getChildName = (childId) => {
    const child = children.find(c => c.id === childId)
    return child ? child.name : 'Unknown Child'
  }

  const getTaskProgress = (tasks) => {
    if (!tasks || tasks.length === 0) return 0
    const completed = tasks.filter(task => task.completed).length
    return Math.round((completed / tasks.length) * 100)
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
          <h1 className="text-3xl font-bold text-gray-900">Care Plans</h1>
          <p className="text-gray-600">AI-generated personalized care plans for your children</p>
        </div>
        <button
          onClick={() => setShowAddForm(true)}
          className="btn-primary flex items-center space-x-2"
        >
          <Plus className="h-5 w-5" />
          <span>Create Plan</span>
        </button>
      </div>

      {/* Add Care Plan Form */}
      {showAddForm && (
        <div className="card">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Create New Care Plan</h2>
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
                <label className="label">Title</label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="input-field"
                  required
                />
              </div>
            </div>
            <div>
              <label className="label">Description</label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="input-field"
                rows="3"
              />
            </div>
            <div>
              <label className="label">Specific Needs (Optional)</label>
              <textarea
                value={formData.specificNeeds}
                onChange={(e) => setFormData({ ...formData, specificNeeds: e.target.value })}
                className="input-field"
                rows="2"
                placeholder="Describe any specific needs or concerns for AI to consider..."
              />
            </div>
            <div className="flex space-x-3">
              <button type="submit" className="btn-primary">
                Create Care Plan
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

      {/* Care Plans Grid */}
      {carePlans.length > 0 ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {carePlans.map((plan) => (
            <div key={plan.id} className="card hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="font-semibold text-gray-900">{plan.title}</h3>
                  <p className="text-sm text-gray-600">{getChildName(plan.childId)}</p>
                  {plan.description && (
                    <p className="text-sm text-gray-500 mt-1">{plan.description}</p>
                  )}
                </div>
                <div className="flex space-x-1">
                  <button
                    onClick={() => handleRegenerate(plan.id, '')}
                    className="p-1 text-gray-400 hover:text-primary-600 transition-colors"
                    title="Regenerate with AI"
                  >
                    <Sparkles className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(plan.id)}
                    className="p-1 text-gray-400 hover:text-red-600 transition-colors"
                    title="Delete plan"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>

              {/* Progress Bar */}
              {plan.tasks && plan.tasks.length > 0 && (
                <div className="mb-4">
                  <div className="flex items-center justify-between text-sm text-gray-600 mb-1">
                    <span>Progress</span>
                    <span>{getTaskProgress(plan.tasks)}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-primary-600 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${getTaskProgress(plan.tasks)}%` }}
                    />
                  </div>
                </div>
              )}

              {/* Tasks */}
              {plan.tasks && plan.tasks.length > 0 ? (
                <div className="space-y-2">
                  {plan.tasks.slice(0, 5).map((task) => (
                    <div key={task.id} className="flex items-center space-x-2">
                      <button
                        onClick={() => handleTaskToggle(plan.id, task.id, task.completed)}
                        className="flex-shrink-0"
                      >
                        {task.completed ? (
                          <CheckCircle className="h-5 w-5 text-green-500" />
                        ) : (
                          <Circle className="h-5 w-5 text-gray-400 hover:text-primary-500" />
                        )}
                      </button>
                      <span className={`text-sm flex-1 ${
                        task.completed ? 'line-through text-gray-500' : 'text-gray-900'
                      }`}>
                        {task.title}
                      </span>
                    </div>
                  ))}
                  {plan.tasks.length > 5 && (
                    <p className="text-xs text-gray-500 mt-2">
                      +{plan.tasks.length - 5} more tasks
                    </p>
                  )}
                </div>
              ) : (
                <p className="text-gray-500 text-sm">No tasks in this plan</p>
              )}

              {/* AI Generated Badge */}
              {plan.aiGenerated && (
                <div className="mt-4 flex items-center space-x-2">
                  <Sparkles className="h-4 w-4 text-primary-600" />
                  <span className="text-xs text-primary-600 font-medium">AI Generated</span>
                </div>
              )}

              {/* Actions */}
              <div className="mt-4 flex space-x-2">
                <Link
                  to={`/children/${plan.childId}`}
                  className="flex-1 btn-primary text-center text-sm"
                >
                  View Child Profile
                </Link>
                <button
                  onClick={() => handleRegenerate(plan.id, '')}
                  className="btn-secondary text-sm flex items-center space-x-1"
                >
                  <Sparkles className="h-3 w-3" />
                  <span>Regenerate</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="card text-center py-12">
          <ClipboardList className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No care plans created yet</h3>
          <p className="text-gray-600 mb-6">
            Create personalized care plans powered by AI to help manage your child's health and development.
          </p>
          <button
            onClick={() => setShowAddForm(true)}
            className="btn-primary"
          >
            Create Your First Care Plan
          </button>
        </div>
      )}
    </div>
  )
}

export default CarePlans
