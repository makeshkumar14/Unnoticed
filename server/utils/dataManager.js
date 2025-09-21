const fs = require('fs');
const path = require('path');

const DATA_FILE = path.join(__dirname, '../data/models.json');

class DataManager {
  constructor() {
    this.data = this.loadData();
  }

  loadData() {
    try {
      if (fs.existsSync(DATA_FILE)) {
        const fileContent = fs.readFileSync(DATA_FILE, 'utf8');
        return JSON.parse(fileContent);
      }
      return {
        children: [],
        parents: [],
        healthRecords: [],
        reminders: [],
        carePlans: [],
        aiInsights: []
      };
    } catch (error) {
      console.error('Error loading data:', error);
      return {
        children: [],
        parents: [],
        healthRecords: [],
        reminders: [],
        carePlans: [],
        aiInsights: []
      };
    }
  }

  saveData() {
    try {
      fs.writeFileSync(DATA_FILE, JSON.stringify(this.data, null, 2));
      return true;
    } catch (error) {
      console.error('Error saving data:', error);
      return false;
    }
  }

  // Generic CRUD operations
  create(collection, item) {
    if (!this.data[collection]) {
      this.data[collection] = [];
    }
    this.data[collection].push(item);
    this.saveData();
    return item;
  }

  findById(collection, id) {
    if (!this.data[collection]) return null;
    return this.data[collection].find(item => item.id === id);
  }

  findByChildId(collection, childId) {
    if (!this.data[collection]) return [];
    return this.data[collection].filter(item => item.childId === childId);
  }

  update(collection, id, updates) {
    if (!this.data[collection]) return null;
    const index = this.data[collection].findIndex(item => item.id === id);
    if (index === -1) return null;
    
    this.data[collection][index] = { ...this.data[collection][index], ...updates };
    this.saveData();
    return this.data[collection][index];
  }

  delete(collection, id) {
    if (!this.data[collection]) return false;
    const index = this.data[collection].findIndex(item => item.id === id);
    if (index === -1) return false;
    
    this.data[collection].splice(index, 1);
    this.saveData();
    return true;
  }

  getAll(collection) {
    return this.data[collection] || [];
  }

  // Specific methods for different collections
  getChildWithDetails(childId) {
    const child = this.findById('children', childId);
    if (!child) return null;

    return {
      ...child,
      healthRecords: this.findByChildId('healthRecords', childId),
      reminders: this.findByChildId('reminders', childId),
      carePlans: this.findByChildId('carePlans', childId),
      aiInsights: this.findByChildId('aiInsights', childId)
    };
  }

  getUpcomingReminders() {
    const now = new Date();
    const tomorrow = new Date(now.getTime() + 24 * 60 * 60 * 1000);
    
    return this.data.reminders.filter(reminder => {
      if (!reminder.isActive) return false;
      
      if (reminder.date) {
        const reminderDate = new Date(reminder.date);
        return reminderDate >= now && reminderDate <= tomorrow;
      }
      
      return true; // For daily reminders
    });
  }
}

module.exports = new DataManager();
