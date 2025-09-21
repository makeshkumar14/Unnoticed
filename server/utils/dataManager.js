const { Parent, Child, HealthRecord, Reminder, CarePlan, AIInsight } = require('../models');

class DataManager {
  constructor() {
    // No need to load data on initialization with MongoDB
  }

  // Generic CRUD operations
  async create(collection, item) {
    try {
      const Model = this.getModel(collection);
      const newItem = new Model(item);
      const savedItem = await newItem.save();
      return savedItem.toObject();
    } catch (error) {
      console.error(`Error creating ${collection}:`, error);
      throw error;
    }
  }

  async findById(collection, id) {
    try {
      const Model = this.getModel(collection);
      const item = await Model.findOne({ id });
      return item ? item.toObject() : null;
    } catch (error) {
      console.error(`Error finding ${collection} by id:`, error);
      return null;
    }
  }

  async findByChildId(collection, childId) {
    try {
      const Model = this.getModel(collection);
      const items = await Model.find({ childId });
      return items.map(item => item.toObject());
    } catch (error) {
      console.error(`Error finding ${collection} by childId:`, error);
      return [];
    }
  }

  async update(collection, id, updates) {
    try {
      const Model = this.getModel(collection);
      const updatedItem = await Model.findOneAndUpdate(
        { id },
        { ...updates, updatedAt: new Date() },
        { new: true }
      );
      return updatedItem ? updatedItem.toObject() : null;
    } catch (error) {
      console.error(`Error updating ${collection}:`, error);
      return null;
    }
  }

  async delete(collection, id) {
    try {
      const Model = this.getModel(collection);
      const result = await Model.findOneAndDelete({ id });
      return !!result;
    } catch (error) {
      console.error(`Error deleting ${collection}:`, error);
      return false;
    }
  }

  async getAll(collection) {
    try {
      const Model = this.getModel(collection);
      const items = await Model.find({});
      return items.map(item => item.toObject());
    } catch (error) {
      console.error(`Error getting all ${collection}:`, error);
      return [];
    }
  }

  getModel(collection) {
    const models = {
      children: Child,
      parents: Parent,
      healthRecords: HealthRecord,
      reminders: Reminder,
      carePlans: CarePlan,
      aiInsights: AIInsight
    };
    return models[collection];
  }

  // Specific methods for different collections
  async getChildWithDetails(childId) {
    try {
      const child = await this.findById('children', childId);
      if (!child) return null;

      const [healthRecords, reminders, carePlans, aiInsights] = await Promise.all([
        this.findByChildId('healthRecords', childId),
        this.findByChildId('reminders', childId),
        this.findByChildId('carePlans', childId),
        this.findByChildId('aiInsights', childId)
      ]);

      return {
        ...child,
        healthRecords,
        reminders,
        carePlans,
        aiInsights
      };
    } catch (error) {
      console.error('Error getting child with details:', error);
      return null;
    }
  }

  async getUpcomingReminders() {
    try {
      const now = new Date();
      const tomorrow = new Date(now.getTime() + 24 * 60 * 60 * 1000);
      
      const reminders = await Reminder.find({
        isActive: true,
        $or: [
          { date: { $gte: now.toISOString().split('T')[0], $lte: tomorrow.toISOString().split('T')[0] } },
          { date: { $exists: false } } // For daily reminders without specific date
        ]
      });

      return reminders.map(reminder => reminder.toObject());
    } catch (error) {
      console.error('Error getting upcoming reminders:', error);
      return [];
    }
  }
}

module.exports = new DataManager();
