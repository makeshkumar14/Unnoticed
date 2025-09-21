const express = require('express');
const { v4: uuidv4 } = require('uuid');
const dataManager = require('../utils/dataManager');

const router = express.Router();

// Get all health records
router.get('/', (req, res) => {
  try {
    const records = dataManager.getAll('healthRecords');
    res.json(records);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch health records' });
  }
});

// Get health records for specific child
router.get('/child/:childId', (req, res) => {
  try {
    const records = dataManager.findByChildId('healthRecords', req.params.childId);
    res.json(records);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch health records' });
  }
});

// Get health record by ID
router.get('/:id', (req, res) => {
  try {
    const record = dataManager.findById('healthRecords', req.params.id);
    if (!record) {
      return res.status(404).json({ error: 'Health record not found' });
    }
    res.json(record);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch health record' });
  }
});

// Create new health record
router.post('/', (req, res) => {
  try {
    const { childId, type, title, date, status, notes } = req.body;
    
    if (!childId || !type || !title || !date) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const record = {
      id: uuidv4(),
      childId,
      type,
      title,
      date,
      status: status || 'scheduled',
      notes: notes || '',
      createdAt: new Date().toISOString()
    };

    const createdRecord = dataManager.create('healthRecords', record);
    res.status(201).json(createdRecord);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create health record' });
  }
});

// Update health record
router.put('/:id', (req, res) => {
  try {
    const updates = req.body;
    const updatedRecord = dataManager.update('healthRecords', req.params.id, updates);
    if (!updatedRecord) {
      return res.status(404).json({ error: 'Health record not found' });
    }
    
    res.json(updatedRecord);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update health record' });
  }
});

// Delete health record
router.delete('/:id', (req, res) => {
  try {
    const success = dataManager.delete('healthRecords', req.params.id);
    if (!success) {
      return res.status(404).json({ error: 'Health record not found' });
    }
    
    res.json({ message: 'Health record deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete health record' });
  }
});

// Get upcoming health events
router.get('/upcoming/:childId', (req, res) => {
  try {
    const records = dataManager.findByChildId('healthRecords', req.params.childId);
    const now = new Date();
    const nextWeek = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
    
    const upcoming = records.filter(record => {
      const recordDate = new Date(record.date);
      return recordDate >= now && recordDate <= nextWeek && record.status === 'scheduled';
    });
    
    res.json(upcoming);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch upcoming health events' });
  }
});

// Mark health record as completed
router.patch('/:id/complete', (req, res) => {
  try {
    const updates = { 
      status: 'completed',
      completedAt: new Date().toISOString()
    };
    
    const updatedRecord = dataManager.update('healthRecords', req.params.id, updates);
    if (!updatedRecord) {
      return res.status(404).json({ error: 'Health record not found' });
    }
    
    res.json(updatedRecord);
  } catch (error) {
    res.status(500).json({ error: 'Failed to complete health record' });
  }
});

module.exports = router;
