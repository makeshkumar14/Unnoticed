import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { 
  Users, 
  Heart, 
  Bell, 
  ClipboardList, 
  TrendingUp, 
  Calendar,
  Baby,
  Sparkles
} from 'lucide-react'
import { childrenAPI, healthAPI, remindersAPI, carePlansAPI, aiAPI } from '../services/api'
import toast from 'react-hot-toast'

const Dashboard = () => {
  const [stats, setStats] = useState({
    children: 0,
    upcomingAppointments: 0,
    activeReminders: 0,
    carePlans: 0
  })
  const [recentChildren, setRecentChildren] = useState([])
  const [upcomingReminders, setUpcomingReminders] = useState([])
  const [aiInsights, setAiInsights] = useState([])

  useEffect(() => {
    loadDashboardData()
  }, [])

  const loadDashboardData = async () => {
    try {
      const [childrenRes, remindersRes, carePlansRes] = await Promise.all([
        childrenAPI.getAll(),
        remindersAPI.getUpcoming(),
        carePlansAPI.getAll()
      ])

      const children = childrenRes.data
      const reminders = remindersRes.data
      const carePlans = carePlansRes.data

      setStats({
        children: children.length,
        upcomingAppointments: reminders.filter(r => r.type === 'appointment').length,
        activeReminders: reminders.length,
        carePlans: carePlans.length
      })

      setRecentChildren(children.slice(0, 3))
      setUpcomingReminders(reminders.slice(0, 5))

      // Load AI insights for the first child if available
      if (children.length > 0) {
        try {
          const insightsRes = await aiAPI.getInsights(children[0].id)
          setAiInsights(insightsRes.data.slice(0, 3))
        } catch (error) {
          console.error('Error loading AI insights:', error)
        }
      }
    } catch (error) {
      console.error('Error loading dashboard data:', error)
      toast.error('Failed to load dashboard data')
    }
  }

  const StatCard = ({ title, value, icon: Icon, color, link }) => (
    <Link to={link} className="block">
      <div className="card hover:shadow-md transition-shadow">
        <div className="flex items-center">
          <div className={`p-3 rounded-lg ${color}`}>
            <Icon className="h-6 w-6 text-white" />
          </div>
          <div className="ml-4">
            <p className="text-sm font-medium text-gray-600">{title}</p>
            <p className="text-2xl font-bold text-gray-900">{value}</p>
          </div>
        </div>
      </div>
    </Link>
  )

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600">Welcome to your AI Copilot for Parents</p>
        </div>
        <div className="flex items-center space-x-2 text-primary-600">
          <Sparkles className="h-5 w-5" />
          <span className="text-sm font-medium">AI Powered</span>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Children"
          value={stats.children}
          icon={Users}
          color="bg-blue-500"
          link="/children"
        />
        <StatCard
          title="Upcoming Appointments"
          value={stats.upcomingAppointments}
          icon={Calendar}
          color="bg-green-500"
          link="/health"
        />
        <StatCard
          title="Active Reminders"
          value={stats.activeReminders}
          icon={Bell}
          color="bg-yellow-500"
          link="/reminders"
        />
        <StatCard
          title="Care Plans"
          value={stats.carePlans}
          icon={ClipboardList}
          color="bg-purple-500"
          link="/care-plans"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Children */}
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Your Children</h2>
            <Link to="/children" className="text-primary-600 hover:text-primary-700 text-sm font-medium">
              View all
            </Link>
          </div>
          {recentChildren.length > 0 ? (
            <div className="space-y-3">
              {recentChildren.map((child) => (
                <Link
                  key={child.id}
                  to={`/children/${child.id}`}
                  className="flex items-center p-3 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <div className="p-2 bg-primary-100 rounded-full">
                    <Baby className="h-5 w-5 text-primary-600" />
                  </div>
                  <div className="ml-3">
                    <p className="font-medium text-gray-900">{child.name}</p>
                    <p className="text-sm text-gray-500">
                      {new Date().getFullYear() - new Date(child.dateOfBirth).getFullYear()} years old
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <Baby className="h-12 w-12 text-gray-400 mx-auto mb-3" />
              <p className="text-gray-500 mb-4">No children added yet</p>
              <Link to="/children" className="btn-primary">
                Add Your First Child
              </Link>
            </div>
          )}
        </div>

        {/* Upcoming Reminders */}
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Upcoming Reminders</h2>
            <Link to="/reminders" className="text-primary-600 hover:text-primary-700 text-sm font-medium">
              View all
            </Link>
          </div>
          {upcomingReminders.length > 0 ? (
            <div className="space-y-3">
              {upcomingReminders.map((reminder) => (
                <div key={reminder.id} className="flex items-center p-3 rounded-lg bg-gray-50">
                  <div className="p-2 bg-yellow-100 rounded-full">
                    <Bell className="h-4 w-4 text-yellow-600" />
                  </div>
                  <div className="ml-3 flex-1">
                    <p className="font-medium text-gray-900">{reminder.title}</p>
                    <p className="text-sm text-gray-500">
                      {reminder.date ? formatDate(reminder.date) : 'Daily at ' + reminder.time}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <Bell className="h-12 w-12 text-gray-400 mx-auto mb-3" />
              <p className="text-gray-500">No upcoming reminders</p>
            </div>
          )}
        </div>
      </div>

      {/* AI Insights */}
      {aiInsights.length > 0 && (
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">AI Insights</h2>
            <Link to="/ai-assistant" className="text-primary-600 hover:text-primary-700 text-sm font-medium">
              Get more insights
            </Link>
          </div>
          <div className="space-y-4">
            {aiInsights.map((insight) => (
              <div key={insight.id} className="p-4 bg-gradient-to-r from-primary-50 to-secondary-50 rounded-lg border border-primary-200">
                <div className="flex items-start">
                  <Sparkles className="h-5 w-5 text-primary-600 mt-0.5 mr-3 flex-shrink-0" />
                  <div>
                    <h3 className="font-medium text-gray-900 mb-1">{insight.title}</h3>
                    <p className="text-sm text-gray-600">{insight.content}</p>
                    <p className="text-xs text-gray-500 mt-2">
                      {new Date(insight.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Quick Actions */}
      <div className="card">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Link to="/children" className="btn-primary text-center">
            Add New Child
          </Link>
          <Link to="/health" className="btn-secondary text-center">
            Add Health Record
          </Link>
          <Link to="/ai-assistant" className="btn-primary text-center">
            Ask AI Assistant
          </Link>
        </div>
      </div>
    </div>
  )
}

export default Dashboard
