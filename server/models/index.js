const mongoose = require('mongoose');

// Parent Schema
const parentSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  email: { type: String, required: true },
  phone: { type: String, required: true },
  preferences: {
    notifications: { type: Boolean, default: true },
    reminderFrequency: { type: String, default: 'daily' },
    language: { type: String, default: 'en' }
  },
  createdAt: { type: Date, default: Date.now }
});

// Child Schema
const childSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  dateOfBirth: { type: String, required: true },
  gender: { type: String, required: true, enum: ['male', 'female', 'other'] },
  parentId: { type: String, required: true },
  medicalHistory: {
    allergies: [{ type: String }],
    chronicConditions: [{ type: String }],
    medications: [{ type: String }]
  },
  developmentMilestones: {
    physical: {
      height: { type: Number, default: 0 },
      weight: { type: Number, default: 0 },
      lastUpdated: { type: Date, default: Date.now }
    },
    cognitive: {
      milestones: [{ type: String }],
      lastUpdated: { type: Date, default: Date.now }
    }
  },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

// Health Record Schema
const healthRecordSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  childId: { type: String, required: true },
  type: { type: String, required: true },
  title: { type: String, required: true },
  date: { type: String, required: true },
  status: { type: String, default: 'scheduled', enum: ['scheduled', 'completed', 'cancelled'] },
  notes: { type: String, default: '' },
  completedAt: { type: Date },
  createdAt: { type: Date, default: Date.now }
});

// Reminder Schema
const reminderSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  childId: { type: String, required: true },
  type: { type: String, required: true },
  title: { type: String, required: true },
  time: { type: String },
  date: { type: String },
  frequency: { type: String, default: 'once' },
  notes: { type: String, default: '' },
  isActive: { type: Boolean, default: true },
  lastTriggered: { type: Date },
  createdAt: { type: Date, default: Date.now }
});

// Care Plan Task Schema
const carePlanTaskSchema = new mongoose.Schema({
  id: { type: String, required: true },
  title: { type: String, required: true },
  completed: { type: Boolean, default: false },
  dueDate: { type: String },
  completedAt: { type: Date }
});

// Care Plan Schema
const carePlanSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  childId: { type: String, required: true },
  title: { type: String, required: true },
  description: { type: String, default: '' },
  tasks: [carePlanTaskSchema],
  aiGenerated: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

// AI Insight Schema
const aiInsightSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  childId: { type: String, required: true },
  type: { type: String, required: true },
  title: { type: String, required: true },
  content: { type: String, required: true },
  confidence: { type: Number, required: true },
  createdAt: { type: Date, default: Date.now }
});

// Create models
const Parent = mongoose.model('Parent', parentSchema);
const Child = mongoose.model('Child', childSchema);
const HealthRecord = mongoose.model('HealthRecord', healthRecordSchema);
const Reminder = mongoose.model('Reminder', reminderSchema);
const CarePlan = mongoose.model('CarePlan', carePlanSchema);
const AIInsight = mongoose.model('AIInsight', aiInsightSchema);

module.exports = {
  Parent,
  Child,
  HealthRecord,
  Reminder,
  CarePlan,
  AIInsight
};
