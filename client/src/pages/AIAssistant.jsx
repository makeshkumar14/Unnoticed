import React, { useState, useEffect } from 'react'
import { Send, Bot, User, Sparkles, Heart, Brain, MessageCircle } from 'lucide-react'
import { aiAPI, childrenAPI } from '../services/api'
import toast from 'react-hot-toast'

const AIAssistant = () => {
  const [children, setChildren] = useState([])
  const [selectedChild, setSelectedChild] = useState('')
  const [message, setMessage] = useState('')
  const [chatHistory, setChatHistory] = useState([])
  const [loading, setLoading] = useState(false)
  const [aiInsights, setAiInsights] = useState([])
  const [showInsights, setShowInsights] = useState(false)

  useEffect(() => {
    loadChildren()
  }, [])

  const loadChildren = async () => {
    try {
      const response = await childrenAPI.getAll()
      setChildren(response.data)
      if (response.data.length > 0) {
        setSelectedChild(response.data[0].id)
        loadAIInsights(response.data[0].id)
      }
    } catch (error) {
      console.error('Error loading children:', error)
      toast.error('Failed to load children')
    }
  }

  const loadAIInsights = async (childId) => {
    try {
      const response = await aiAPI.getInsights(childId)
      setAiInsights(response.data)
    } catch (error) {
      console.error('Error loading AI insights:', error)
    }
  }

  const handleSendMessage = async (e) => {
    e.preventDefault()
    if (!message.trim()) return

    const userMessage = {
      id: Date.now(),
      type: 'user',
      content: message,
      timestamp: new Date().toISOString()
    }

    setChatHistory(prev => [...prev, userMessage])
    setMessage('')
    setLoading(true)

    try {
      const response = await aiAPI.chat(selectedChild, message, 'General parenting question')
      const aiMessage = {
        id: Date.now() + 1,
        type: 'ai',
        content: response.data.response,
        timestamp: response.data.timestamp
      }
      setChatHistory(prev => [...prev, aiMessage])
    } catch (error) {
      console.error('Error sending message:', error)
      toast.error('Failed to send message')
      const errorMessage = {
        id: Date.now() + 1,
        type: 'ai',
        content: 'I apologize, but I encountered an error. Please try again.',
        timestamp: new Date().toISOString()
      }
      setChatHistory(prev => [...prev, errorMessage])
    } finally {
      setLoading(false)
    }
  }

  const generatePersonalizedTip = async () => {
    if (!selectedChild) {
      toast.error('Please select a child first')
      return
    }

    setLoading(true)
    try {
      const response = await aiAPI.generateTip(selectedChild, 'Generate a personalized health tip')
      toast.success('New AI tip generated!')
      loadAIInsights(selectedChild)
    } catch (error) {
      console.error('Error generating tip:', error)
      toast.error('Failed to generate AI tip')
    } finally {
      setLoading(false)
    }
  }

  const generateDailySummary = async () => {
    if (!selectedChild) {
      toast.error('Please select a child first')
      return
    }

    setLoading(true)
    try {
      const response = await aiAPI.generateDailySummary(selectedChild)
      const summaryMessage = {
        id: Date.now(),
        type: 'ai',
        content: response.data.summary,
        timestamp: response.data.timestamp
      }
      setChatHistory(prev => [...prev, summaryMessage])
    } catch (error) {
      console.error('Error generating daily summary:', error)
      toast.error('Failed to generate daily summary')
    } finally {
      setLoading(false)
    }
  }

  const quickQuestions = [
    "What are the key developmental milestones for my child's age?",
    "How can I encourage healthy eating habits?",
    "What safety measures should I take at home?",
    "How much sleep does my child need?",
    "What are signs of a healthy child development?"
  ]

  const handleQuickQuestion = (question) => {
    setMessage(question)
  }

  const formatTime = (timestamp) => {
    return new Date(timestamp).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">AI Assistant</h1>
          <p className="text-gray-600">Get personalized parenting advice powered by AI</p>
        </div>
        <div className="flex items-center space-x-2 text-primary-600">
          <Sparkles className="h-5 w-5" />
          <span className="text-sm font-medium">Powered by Gemini AI</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Chat Interface */}
        <div className="lg:col-span-2 space-y-6">
          {/* Child Selection */}
          {children.length > 0 && (
            <div className="card">
              <label className="label">Select Child for Personalized Advice</label>
              <select
                value={selectedChild}
                onChange={(e) => {
                  setSelectedChild(e.target.value)
                  loadAIInsights(e.target.value)
                }}
                className="input-field"
              >
                {children.map((child) => (
                  <option key={child.id} value={child.id}>
                    {child.name}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Quick Actions */}
          <div className="card">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <button
                onClick={generatePersonalizedTip}
                disabled={loading || !selectedChild}
                className="btn-primary flex items-center justify-center space-x-2"
              >
                <Heart className="h-4 w-4" />
                <span>Get Health Tip</span>
              </button>
              <button
                onClick={generateDailySummary}
                disabled={loading || !selectedChild}
                className="btn-primary flex items-center justify-center space-x-2"
              >
                <Brain className="h-4 w-4" />
                <span>Daily Summary</span>
              </button>
            </div>
          </div>

          {/* Quick Questions */}
          <div className="card">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Questions</h2>
            <div className="space-y-2">
              {quickQuestions.map((question, index) => (
                <button
                  key={index}
                  onClick={() => handleQuickQuestion(question)}
                  className="w-full text-left p-3 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors text-sm"
                >
                  {question}
                </button>
              ))}
            </div>
          </div>

          {/* Chat History */}
          <div className="card">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Chat with AI</h2>
            <div className="h-96 overflow-y-auto space-y-4 mb-4">
              {chatHistory.length === 0 ? (
                <div className="text-center py-8">
                  <MessageCircle className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                  <p className="text-gray-500">Start a conversation with your AI assistant</p>
                </div>
              ) : (
                chatHistory.map((msg) => (
                  <div
                    key={msg.id}
                    className={`flex ${msg.type === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                        msg.type === 'user'
                          ? 'bg-primary-600 text-white'
                          : 'bg-gray-100 text-gray-900'
                      }`}
                    >
                      <div className="flex items-start space-x-2">
                        {msg.type === 'ai' && (
                          <Bot className="h-4 w-4 mt-0.5 flex-shrink-0" />
                        )}
                        <div className="flex-1">
                          <p className="text-sm">{msg.content}</p>
                          <p className={`text-xs mt-1 ${
                            msg.type === 'user' ? 'text-primary-100' : 'text-gray-500'
                          }`}>
                            {formatTime(msg.timestamp)}
                          </p>
                        </div>
                        {msg.type === 'user' && (
                          <User className="h-4 w-4 mt-0.5 flex-shrink-0" />
                        )}
                      </div>
                    </div>
                  </div>
                ))
              )}
              {loading && (
                <div className="flex justify-start">
                  <div className="bg-gray-100 text-gray-900 px-4 py-2 rounded-lg">
                    <div className="flex items-center space-x-2">
                      <Bot className="h-4 w-4" />
                      <div className="flex space-x-1">
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Message Input */}
            <form onSubmit={handleSendMessage} className="flex space-x-2">
              <input
                type="text"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Ask your AI assistant anything..."
                className="flex-1 input-field"
                disabled={loading}
              />
              <button
                type="submit"
                disabled={loading || !message.trim()}
                className="btn-primary flex items-center space-x-2"
              >
                <Send className="h-4 w-4" />
                <span>Send</span>
              </button>
            </form>
          </div>
        </div>

        {/* AI Insights Sidebar */}
        <div className="space-y-6">
          <div className="card">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900">AI Insights</h2>
              <button
                onClick={() => setShowInsights(!showInsights)}
                className="text-primary-600 hover:text-primary-700 text-sm font-medium"
              >
                {showInsights ? 'Hide' : 'Show All'}
              </button>
            </div>
            {aiInsights.length > 0 ? (
              <div className="space-y-3">
                {(showInsights ? aiInsights : aiInsights.slice(0, 3)).map((insight) => (
                  <div key={insight.id} className="p-3 bg-gradient-to-r from-primary-50 to-secondary-50 rounded-lg border border-primary-200">
                    <h3 className="font-medium text-gray-900 text-sm mb-1">{insight.title}</h3>
                    <p className="text-xs text-gray-600 mb-2">{insight.content}</p>
                    <div className="flex items-center justify-between text-xs text-gray-500">
                      <span>Confidence: {Math.round(insight.confidence * 100)}%</span>
                      <span>{new Date(insight.createdAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-6">
                <Sparkles className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                <p className="text-gray-500 text-sm">No AI insights yet</p>
                <button
                  onClick={generatePersonalizedTip}
                  disabled={loading || !selectedChild}
                  className="btn-primary text-sm mt-2"
                >
                  Generate First Insight
                </button>
              </div>
            )}
          </div>

          {/* Tips */}
          <div className="card">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Tips for Better Results</h2>
            <div className="space-y-3 text-sm text-gray-600">
              <div className="flex items-start space-x-2">
                <div className="w-2 h-2 bg-primary-500 rounded-full mt-2 flex-shrink-0"></div>
                <p>Be specific about your child's age and situation</p>
              </div>
              <div className="flex items-start space-x-2">
                <div className="w-2 h-2 bg-primary-500 rounded-full mt-2 flex-shrink-0"></div>
                <p>Ask about developmental milestones and health concerns</p>
              </div>
              <div className="flex items-start space-x-2">
                <div className="w-2 h-2 bg-primary-500 rounded-full mt-2 flex-shrink-0"></div>
                <p>Request practical, actionable advice</p>
              </div>
              <div className="flex items-start space-x-2">
                <div className="w-2 h-2 bg-primary-500 rounded-full mt-2 flex-shrink-0"></div>
                <p>Always consult healthcare professionals for medical concerns</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default AIAssistant
