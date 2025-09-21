const express = require('express');
const { v4: uuidv4 } = require('uuid');
const cron = require('node-cron');
const dataManager = require('../utils/dataManager');

const router = express.Router();

// Get all reminders
router.get('/', async (req, res) => {
  try {
    const reminders = await dataManager.getAll('reminders');
    res.json(reminders);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch reminders' });
  }
});

// Get reminders for specific child
router.get('/child/:childId', async (req, res) => {
  try {
    const reminders = await dataManager.findByChildId('reminders', req.params.childId);
    res.json(reminders);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch reminders' });
  }
});

// Get active reminders
router.get('/active', async (req, res) => {
  try {
    const allReminders = await dataManager.getAll('reminders');
    const reminders = allReminders.filter(r => r.isActive);
    res.json(reminders);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch active reminders' });
  }
});

// Get upcoming reminders
router.get('/upcoming', async (req, res) => {
  try {
    const upcoming = await dataManager.getUpcomingReminders();
    res.json(upcoming);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch upcoming reminders' });
  }
});

// Create new reminder
router.post('/', async (req, res) => {
  try {
    const { childId, type, title, time, date, frequency, notes } = req.body;
    
    if (!childId || !type || !title) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const reminder = {
      id: uuidv4(),
      childId,
      type,
      title,
      time: time || null,
      date: date || null,
      frequency: frequency || 'once',
      notes: notes || '',
      isActive: true,
      lastTriggered: null,
      createdAt: new Date().toISOString()
    };

    const createdReminder = await dataManager.create('reminders', reminder);
    res.status(201).json(createdReminder);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create reminder' });
  }
});

// Update reminder
router.put('/:id', async (req, res) => {
  try {
    const updates = req.body;
    const updatedReminder = await dataManager.update('reminders', req.params.id, updates);
    if (!updatedReminder) {
      return res.status(404).json({ error: 'Reminder not found' });
    }
    
    res.json(updatedReminder);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update reminder' });
  }
});

// Delete reminder
router.delete('/:id', async (req, res) => {
  try {
    const success = await dataManager.delete('reminders', req.params.id);
    if (!success) {
      return res.status(404).json({ error: 'Reminder not found' });
    }
    
    res.json({ message: 'Reminder deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete reminder' });
  }
});

// Toggle reminder active status
router.patch('/:id/toggle', async (req, res) => {
  try {
    const reminder = await dataManager.findById('reminders', req.params.id);
    if (!reminder) {
      return res.status(404).json({ error: 'Reminder not found' });
    }
    
    const updates = { isActive: !reminder.isActive };
    const updatedReminder = await dataManager.update('reminders', req.params.id, updates);
    
    res.json(updatedReminder);
  } catch (error) {
    res.status(500).json({ error: 'Failed to toggle reminder' });
  }
});

// Mark reminder as triggered
router.patch('/:id/trigger', async (req, res) => {
  try {
    const updates = { 
      lastTriggered: new Date().toISOString()
    };
    
    const updatedReminder = await dataManager.update('reminders', req.params.id, updates);
    if (!updatedReminder) {
      return res.status(404).json({ error: 'Reminder not found' });
    }
    
    res.json(updatedReminder);
  } catch (error) {
    res.status(500).json({ error: 'Failed to trigger reminder' });
  }
});

// Schedule reminder notifications (runs every minute)
cron.schedule('* * * * *', async () => {
  try {
    const upcomingReminders = await dataManager.getUpcomingReminders();
    
    for (const reminder of upcomingReminders) {
      const now = new Date();
      const reminderTime = reminder.date ? new Date(reminder.date) : new Date();
      
      if (reminder.time) {
        const [hours, minutes] = reminder.time.split(':');
        reminderTime.setHours(parseInt(hours), parseInt(minutes), 0, 0);
      }
      
      // Check if reminder should be triggered (within 1 minute)
      const timeDiff = Math.abs(now - reminderTime);
      if (timeDiff <= 60000) { // 1 minute
        console.log(`Reminder triggered: ${reminder.title} for child ${reminder.childId}`);
        // Here you would integrate with notification service
        // For now, just update the lastTriggered timestamp
        await dataManager.update('reminders', reminder.id, { 
          lastTriggered: new Date().toISOString() 
        });
      }
    }
  } catch (error) {
    console.error('Error in reminder cron job:', error);
  }
});

module.exports = router;
