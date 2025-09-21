const express = require('express');
const { v4: uuidv4 } = require('uuid');
const dataManager = require('../utils/dataManager');
const geminiService = require('../utils/geminiService');

const router = express.Router();

// Get all children
router.get('/', async (req, res) => {
  try {
    const children = await dataManager.getAll('children');
    res.json(children);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch children' });
  }
});

// Get child by ID with full details
router.get('/:id', async (req, res) => {
  try {
    const child = await dataManager.getChildWithDetails(req.params.id);
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

    const createdChild = await dataManager.create('children', child);
    
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
      await dataManager.create('aiInsights', insight);
    } catch (aiError) {
      console.error('Error generating AI insight:', aiError);
    }

    res.status(201).json(createdChild);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create child' });
  }
});

// Update child
router.put('/:id', async (req, res) => {
  try {
    const updates = {
      ...req.body,
      updatedAt: new Date().toISOString()
    };
    
    const updatedChild = await dataManager.update('children', req.params.id, updates);
    if (!updatedChild) {
      return res.status(404).json({ error: 'Child not found' });
    }
    
    res.json(updatedChild);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update child' });
  }
});

// Delete child
router.delete('/:id', async (req, res) => {
  try {
    const success = await dataManager.delete('children', req.params.id);
    if (!success) {
      return res.status(404).json({ error: 'Child not found' });
    }
    
    // Also delete related records
    const [healthRecords, reminders, carePlans, aiInsights] = await Promise.all([
      dataManager.findByChildId('healthRecords', req.params.id),
      dataManager.findByChildId('reminders', req.params.id),
      dataManager.findByChildId('carePlans', req.params.id),
      dataManager.findByChildId('aiInsights', req.params.id)
    ]);
    
    // Delete all related records
    await Promise.all([
      ...healthRecords.map(record => dataManager.delete('healthRecords', record.id)),
      ...reminders.map(record => dataManager.delete('reminders', record.id)),
      ...carePlans.map(record => dataManager.delete('carePlans', record.id)),
      ...aiInsights.map(record => dataManager.delete('aiInsights', record.id))
    ]);
    
    res.json({ message: 'Child and related records deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete child' });
  }
});

// Get AI insights for child
router.get('/:id/insights', async (req, res) => {
  try {
    const child = await dataManager.findById('children', req.params.id);
    if (!child) {
      return res.status(404).json({ error: 'Child not found' });
    }

    const insights = await dataManager.findByChildId('aiInsights', req.params.id);
    res.json(insights);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch insights' });
  }
});

// Generate new AI insight
router.post('/:id/insights', async (req, res) => {
  try {
    const child = await dataManager.findById('children', req.params.id);
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

    const createdInsight = await dataManager.create('aiInsights', insight);
    res.status(201).json(createdInsight);
  } catch (error) {
    res.status(500).json({ error: 'Failed to generate insight' });
  }
});

module.exports = router;
