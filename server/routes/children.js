const express = require('express');
const { v4: uuidv4 } = require('uuid');
const dataManager = require('../utils/dataManager');
const geminiService = require('../utils/geminiService');

const router = express.Router();

// Get all children
router.get('/', (req, res) => {
  try {
    const children = dataManager.getAll('children');
    res.json(children);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch children' });
  }
});

// Get child by ID with full details
router.get('/:id', (req, res) => {
  try {
    const child = dataManager.getChildWithDetails(req.params.id);
    if (!child) {
      return res.status(404).json({ error: 'Child not found' });
    }
    res.json(child);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch child details' });
  }
});

// Create new child
router.post('/', async (req, res) => {
  try {
    const { name, dateOfBirth, gender, parentId, medicalHistory } = req.body;
    
    if (!name || !dateOfBirth || !gender || !parentId) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const child = {
      id: uuidv4(),
      name,
      dateOfBirth,
      gender,
      parentId,
      medicalHistory: medicalHistory || { allergies: [], chronicConditions: [], medications: [] },
      developmentMilestones: {
        physical: { height: 0, weight: 0, lastUpdated: new Date().toISOString() },
        cognitive: { milestones: [], lastUpdated: new Date().toISOString() }
      },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    const createdChild = dataManager.create('children', child);
    
    // Generate initial AI insights
    try {
      const aiInsight = await geminiService.generatePersonalizedTip(createdChild, 'New child profile created');
      const insight = {
        id: uuidv4(),
        childId: createdChild.id,
        type: 'welcome',
        title: 'Welcome to AI Copilot',
        content: aiInsight.tip,
        confidence: 0.9,
        createdAt: new Date().toISOString()
      };
      dataManager.create('aiInsights', insight);
    } catch (aiError) {
      console.error('Error generating AI insight:', aiError);
    }

    res.status(201).json(createdChild);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create child' });
  }
});

// Update child
router.put('/:id', (req, res) => {
  try {
    const updates = {
      ...req.body,
      updatedAt: new Date().toISOString()
    };
    
    const updatedChild = dataManager.update('children', req.params.id, updates);
    if (!updatedChild) {
      return res.status(404).json({ error: 'Child not found' });
    }
    
    res.json(updatedChild);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update child' });
  }
});

// Delete child
router.delete('/:id', (req, res) => {
  try {
    const success = dataManager.delete('children', req.params.id);
    if (!success) {
      return res.status(404).json({ error: 'Child not found' });
    }
    
    // Also delete related records
    const healthRecords = dataManager.findByChildId('healthRecords', req.params.id);
    const reminders = dataManager.findByChildId('reminders', req.params.id);
    const carePlans = dataManager.findByChildId('carePlans', req.params.id);
    const aiInsights = dataManager.findByChildId('aiInsights', req.params.id);
    
    [...healthRecords, ...reminders, ...carePlans, ...aiInsights].forEach(record => {
      dataManager.delete(record.id.includes('health') ? 'healthRecords' : 
                        record.id.includes('reminder') ? 'reminders' :
                        record.id.includes('plan') ? 'carePlans' : 'aiInsights', record.id);
    });
    
    res.json({ message: 'Child and related records deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete child' });
  }
});

// Get AI insights for child
router.get('/:id/insights', async (req, res) => {
  try {
    const child = dataManager.findById('children', req.params.id);
    if (!child) {
      return res.status(404).json({ error: 'Child not found' });
    }

    const insights = dataManager.findByChildId('aiInsights', req.params.id);
    res.json(insights);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch insights' });
  }
});

// Generate new AI insight
router.post('/:id/insights', async (req, res) => {
  try {
    const child = dataManager.findById('children', req.params.id);
    if (!child) {
      return res.status(404).json({ error: 'Child not found' });
    }

    const { context } = req.body;
    const aiInsight = await geminiService.generatePersonalizedTip(child, context);
    
    const insight = {
      id: uuidv4(),
      childId: child.id,
      type: 'personalized',
      title: 'Personalized Health Tip',
      content: aiInsight.tip,
      confidence: 0.85,
      createdAt: new Date().toISOString()
    };

    const createdInsight = dataManager.create('aiInsights', insight);
    res.status(201).json(createdInsight);
  } catch (error) {
    res.status(500).json({ error: 'Failed to generate insight' });
  }
});

module.exports = router;
