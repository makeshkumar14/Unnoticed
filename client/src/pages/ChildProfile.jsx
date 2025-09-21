import React, { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { 
  Baby, 
  Calendar, 
  Heart, 
  Bell, 
  ClipboardList, 
  Sparkles,
  Edit,
  Plus,
  TrendingUp
} from 'lucide-react'
import { childrenAPI, healthAPI, remindersAPI, carePlansAPI, aiAPI } from '../services/api'
import toast from 'react-hot-toast'

const ChildProfile = () => {
  const { id } = useParams()
  const [child, setChild] = useState(null)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('overview')
  const [aiInsights, setAiInsights] = useState([])
  const [showAddRecord, setShowAddRecord] = useState(false)
  const [newRecord, setNewRecord] = useState({
    type: 'checkup',
    title: '',
    date: '',
    notes: ''
  })

  useEffect(() => {
    if (id) {
      loadChildData()
    }
  }, [id])

  const loadChildData = async () => {
    try {
      const response = await childrenAPI.getById(id)
      setChild(response.data)
      
      // Load AI insights
      const insightsResponse = await aiAPI.getInsights(id)
      setAiInsights(insightsResponse.data)
    } catch (error) {
      console.error('Error loading child data:', error)
      toast.error('Failed to load child data')
    } finally {
      setLoading(false)
    }
  }

  const handleAddRecord = async (e) => {
    e.preventDefault()
    try {
      await healthAPI.create({
        ...newRecord,
        childId: id,
        status: 'scheduled'
      })
      toast.success('Health record added successfully!')
      setShowAddRecord(false)
      setNewRecord({
        type: 'checkup',
        title: '',
        date: '',
        notes: ''
      })
      loadChildData()
    } catch (error) {
      console.error('Error adding health record:', error)
      toast.error('Failed to add health record')
    }
  }

  const generateAITip = async () => {
    try {
      const response = await aiAPI.generateTip(id, 'General health and development advice')
      toast.success('New AI insight generated!')
      loadChildData()
    } catch (error) {
      console.error('Error generating AI tip:', error)
      toast.error('Failed to generate AI tip')
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

  if (!child) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">Child not found</p>
        <Link to="/children" className="btn-primary mt-4">
          Back to Children
        </Link>
      </div>
    )
  }

  const tabs = [
    { id: 'overview', name: 'Overview', icon: Baby },
    { id: 'health', name: 'Health Records', icon: Heart },
    { id: 'reminders', name: 'Reminders', icon: Bell },
    { id: 'care-plans', name: 'Care Plans', icon: ClipboardList },
    { id: 'ai-insights', name: 'AI Insights', icon: Sparkles },
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Link to="/children" className="text-gray-400 hover:text-gray-600">
            ← Back to Children
          </Link>
        </div>
      </div>

      {/* Child Info Card */}
      <div className="card">
        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-4">
            <div className="p-4 bg-primary-100 rounded-full">
              <Baby className="h-8 w-8 text-primary-600" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">{child.name}</h1>
              <div className="flex items-center space-x-4 text-gray-600 mt-1">
                <span>{calculateAge(child.dateOfBirth)} years old</span>
                <span>•</span>
                <span className="capitalize">{child.gender}</span>
                <span>•</span>
                <span>Born {new Date(child.dateOfBirth).toLocaleDateString()}</span>
              </div>
            </div>
          </div>
          <button
            onClick={generateAITip}
            className="btn-primary flex items-center space-x-2"
          >
            <Sparkles className="h-4 w-4" />
            <span>Get AI Tip</span>
          </button>
        </div>

        {/* Medical History */}
        {child.medicalHistory && (
          <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 bg-red-50 rounded-lg">
              <h3 className="font-medium text-red-800 mb-2">Allergies</h3>
              <p className="text-red-600">
                {child.medicalHistory.allergies.length > 0 
                  ? child.medicalHistory.allergies.join(', ')
                  : 'None recorded'
                }
              </p>
            </div>
            <div className="p-4 bg-yellow-50 rounded-lg">
              <h3 className="font-medium text-yellow-800 mb-2">Chronic Conditions</h3>
              <p className="text-yellow-600">
                {child.medicalHistory.chronicConditions.length > 0 
                  ? child.medicalHistory.chronicConditions.join(', ')
                  : 'None recorded'
                }
              </p>
            </div>
            <div className="p-4 bg-blue-50 rounded-lg">
              <h3 className="font-medium text-blue-800 mb-2">Medications</h3>
              <p className="text-blue-600">
                {child.medicalHistory.medications.length > 0 
                  ? child.medicalHistory.medications.join(', ')
                  : 'None recorded'
                }
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          {tabs.map((tab) => {
            const Icon = tab.icon
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center space-x-2 py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === tab.id
                    ? 'border-primary-500 text-primary-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <Icon className="h-4 w-4" />
                <span>{tab.name}</span>
              </button>
            )
          })}
        </nav>
      </div>

      {/* Tab Content */}
      <div className="space-y-6">
        {activeTab === 'overview' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Development Milestones */}
            <div className="card">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Development Milestones</h2>
              {child.developmentMilestones ? (
                <div className="space-y-4">
                  <div>
                    <h3 className="font-medium text-gray-700 mb-2">Physical Development</h3>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-gray-500">Height:</span>
                        <span className="ml-2 font-medium">{child.developmentMilestones.physical?.height || 'N/A'} cm</span>
                      </div>
                      <div>
                        <span className="text-gray-500">Weight:</span>
                        <span className="ml-2 font-medium">{child.developmentMilestones.physical?.weight || 'N/A'} kg</span>
                      </div>
                    </div>
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-700 mb-2">Cognitive Development</h3>
                    <div className="space-y-1">
                      {child.developmentMilestones.cognitive?.milestones?.map((milestone, index) => (
                        <div key={index} className="flex items-center text-sm">
                          <TrendingUp className="h-4 w-4 text-green-500 mr-2" />
                          <span>{milestone}</span>
                        </div>
                      )) || <p className="text-gray-500 text-sm">No milestones recorded</p>}
                    </div>
                  </div>
                </div>
              ) : (
                <p className="text-gray-500">No development milestones recorded yet</p>
              )}
            </div>

            {/* Recent AI Insights */}
            <div className="card">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Recent AI Insights</h2>
              {aiInsights.length > 0 ? (
                <div className="space-y-3">
                  {aiInsights.slice(0, 3).map((insight) => (
                    <div key={insight.id} className="p-3 bg-gradient-to-r from-primary-50 to-secondary-50 rounded-lg">
                      <h3 className="font-medium text-gray-900 text-sm mb-1">{insight.title}</h3>
                      <p className="text-xs text-gray-600">{insight.content}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500">No AI insights yet</p>
              )}
            </div>
          </div>
        )}

        {activeTab === 'health' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900">Health Records</h2>
              <button
                onClick={() => setShowAddRecord(true)}
                className="btn-primary flex items-center space-x-2"
              >
                <Plus className="h-4 w-4" />
                <span>Add Record</span>
              </button>
            </div>

            {/* Add Record Form */}
            {showAddRecord && (
              <div className="card">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Add Health Record</h3>
                <form onSubmit={handleAddRecord} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="label">Type</label>
                      <select
                        value={newRecord.type}
                        onChange={(e) => setNewRecord({ ...newRecord, type: e.target.value })}
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
                      <label className="label">Date</label>
                      <input
                        type="date"
                        value={newRecord.date}
                        onChange={(e) => setNewRecord({ ...newRecord, date: e.target.value })}
                        className="input-field"
                        required
                      />
                    </div>
                  </div>
                  <div>
                    <label className="label">Title</label>
                    <input
                      type="text"
                      value={newRecord.title}
                      onChange={(e) => setNewRecord({ ...newRecord, title: e.target.value })}
                      className="input-field"
                      required
                    />
                  </div>
                  <div>
                    <label className="label">Notes</label>
                    <textarea
                      value={newRecord.notes}
                      onChange={(e) => setNewRecord({ ...newRecord, notes: e.target.value })}
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
                      onClick={() => setShowAddRecord(false)}
                      className="btn-secondary"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* Health Records List */}
            <div className="space-y-4">
              {child.healthRecords && child.healthRecords.length > 0 ? (
                child.healthRecords.map((record) => (
                  <div key={record.id} className="card">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-semibold text-gray-900">{record.title}</h3>
                        <p className="text-sm text-gray-600">
                          {new Date(record.date).toLocaleDateString()} • {record.type}
                        </p>
                        {record.notes && (
                          <p className="text-sm text-gray-500 mt-1">{record.notes}</p>
                        )}
                      </div>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        record.status === 'completed' 
                          ? 'bg-green-100 text-green-800'
                          : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {record.status}
                      </span>
                    </div>
                  </div>
                ))
              ) : (
                <div className="card text-center py-8">
                  <Heart className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                  <p className="text-gray-500">No health records yet</p>
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'reminders' && (
          <div className="space-y-4">
            <h2 className="text-lg font-semibold text-gray-900">Reminders</h2>
            {child.reminders && child.reminders.length > 0 ? (
              child.reminders.map((reminder) => (
                <div key={reminder.id} className="card">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <Bell className="h-5 w-5 text-yellow-500" />
                      <div>
                        <h3 className="font-semibold text-gray-900">{reminder.title}</h3>
                        <p className="text-sm text-gray-600">
                          {reminder.frequency} • {reminder.time || 'No specific time'}
                        </p>
                      </div>
                    </div>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      reminder.isActive 
                        ? 'bg-green-100 text-green-800'
                        : 'bg-gray-100 text-gray-800'
                    }`}>
                      {reminder.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                </div>
              ))
            ) : (
              <div className="card text-center py-8">
                <Bell className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                <p className="text-gray-500">No reminders set</p>
              </div>
            )}
          </div>
        )}

        {activeTab === 'care-plans' && (
          <div className="space-y-4">
            <h2 className="text-lg font-semibold text-gray-900">Care Plans</h2>
            {child.carePlans && child.carePlans.length > 0 ? (
              child.carePlans.map((plan) => (
                <div key={plan.id} className="card">
                  <h3 className="font-semibold text-gray-900 mb-2">{plan.title}</h3>
                  <p className="text-sm text-gray-600 mb-4">{plan.description}</p>
                  <div className="space-y-2">
                    {plan.tasks && plan.tasks.map((task) => (
                      <div key={task.id} className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          checked={task.completed}
                          readOnly
                          className="rounded"
                        />
                        <span className={`text-sm ${task.completed ? 'line-through text-gray-500' : 'text-gray-900'}`}>
                          {task.title}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              ))
            ) : (
              <div className="card text-center py-8">
                <ClipboardList className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                <p className="text-gray-500">No care plans created yet</p>
              </div>
            )}
          </div>
        )}

        {activeTab === 'ai-insights' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900">AI Insights</h2>
              <button
                onClick={generateAITip}
                className="btn-primary flex items-center space-x-2"
              >
                <Sparkles className="h-4 w-4" />
                <span>Generate New Insight</span>
              </button>
            </div>
            {aiInsights.length > 0 ? (
              <div className="space-y-4">
                {aiInsights.map((insight) => (
                  <div key={insight.id} className="card">
                    <div className="flex items-start space-x-3">
                      <Sparkles className="h-5 w-5 text-primary-600 mt-0.5" />
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-900 mb-1">{insight.title}</h3>
                        <p className="text-gray-600 mb-2">{insight.content}</p>
                        <div className="flex items-center justify-between text-sm text-gray-500">
                          <span>Confidence: {Math.round(insight.confidence * 100)}%</span>
                          <span>{new Date(insight.createdAt).toLocaleDateString()}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="card text-center py-8">
                <Sparkles className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                <p className="text-gray-500">No AI insights yet</p>
                <button
                  onClick={generateAITip}
                  className="btn-primary mt-4"
                >
                  Generate First Insight
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

export default ChildProfile
