const express = require('express');
const { v4: uuidv4 } = require('uuid');
const dataManager = require('../utils/dataManager');
const geminiService = require('../utils/geminiService');

const router = express.Router();

// Get all care plans
router.get('/', (req, res) => {
  try {
    const carePlans = dataManager.getAll('carePlans');
    res.json(carePlans);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch care plans' });
  }
});

// Get care plans for specific child
router.get('/child/:childId', (req, res) => {
  try {
    const carePlans = dataManager.findByChildId('carePlans', req.params.childId);
    res.json(carePlans);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch care plans' });
  }
});

// Get care plan by ID
router.get('/:id', (req, res) => {
  try {
    const carePlan = dataManager.findById('carePlans', req.params.id);
    if (!carePlan) {
      return res.status(404).json({ error: 'Care plan not found' });
    }
    res.json(carePlan);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch care plan' });
  }
});

// Create new care plan
router.post('/', async (req, res) => {
  try {
    const { childId, title, description, specificNeeds } = req.body;
    
    if (!childId || !title) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const child = dataManager.findById('children', childId);
    if (!child) {
      return res.status(404).json({ error: 'Child not found' });
    }

    // Generate AI-powered care plan
    let aiGeneratedPlan = {};
    try {
      aiGeneratedPlan = await geminiService.generateCarePlan(child, specificNeeds || '');
    } catch (aiError) {
      console.error('Error generating AI care plan:', aiError);
      aiGeneratedPlan = {
        dailyRoutine: ["Maintain consistent schedule", "Ensure adequate rest"],
        healthMonitoring: ["Regular health checkups", "Monitor growth"],
        activities: ["Encourage play and exploration", "Reading and learning"],
        safety: ["Maintain safe environment", "Supervise activities"],
        nutrition: ["Provide balanced nutrition", "Encourage healthy eating"]
      };
    }

    const carePlan = {
      id: uuidv4(),
      childId,
      title,
      description: description || 'AI-generated care plan',
      tasks: [
        ...aiGeneratedPlan.dailyRoutine.map((task, index) => ({
          id: uuidv4(),
          title: task,
          completed: false,
          dueDate: new Date(Date.now() + index * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
        })),
        ...aiGeneratedPlan.healthMonitoring.map((task, index) => ({
          id: uuidv4(),
          title: task,
          completed: false,
          dueDate: new Date(Date.now() + (index + 7) * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
        }))
      ],
      aiGenerated: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    const createdCarePlan = dataManager.create('carePlans', carePlan);
    res.status(201).json(createdCarePlan);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create care plan' });
  }
});

// Update care plan
router.put('/:id', (req, res) => {
  try {
    const updates = {
      ...req.body,
      updatedAt: new Date().toISOString()
    };
    
    const updatedCarePlan = dataManager.update('carePlans', req.params.id, updates);
    if (!updatedCarePlan) {
      return res.status(404).json({ error: 'Care plan not found' });
    }
    
    res.json(updatedCarePlan);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update care plan' });
  }
});

// Delete care plan
router.delete('/:id', (req, res) => {
  try {
    const success = dataManager.delete('carePlans', req.params.id);
    if (!success) {
      return res.status(404).json({ error: 'Care plan not found' });
    }
    
    res.json({ message: 'Care plan deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete care plan' });
  }
});

// Update task status
router.patch('/:id/tasks/:taskId', (req, res) => {
  try {
    const carePlan = dataManager.findById('carePlans', req.params.id);
    if (!carePlan) {
      return res.status(404).json({ error: 'Care plan not found' });
    }

    const taskIndex = carePlan.tasks.findIndex(task => task.id === req.params.taskId);
    if (taskIndex === -1) {
      return res.status(404).json({ error: 'Task not found' });
    }

    carePlan.tasks[taskIndex] = {
      ...carePlan.tasks[taskIndex],
      ...req.body,
      completedAt: req.body.completed ? new Date().toISOString() : null
    };

    const updatedCarePlan = dataManager.update('carePlans', req.params.id, {
      tasks: carePlan.tasks,
      updatedAt: new Date().toISOString()
    });

    res.json(updatedCarePlan);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update task' });
  }
});

// Add new task to care plan
router.post('/:id/tasks', (req, res) => {
  try {
    const carePlan = dataManager.findById('carePlans', req.params.id);
    if (!carePlan) {
      return res.status(404).json({ error: 'Care plan not found' });
    }

    const { title, dueDate } = req.body;
    if (!title) {
      return res.status(400).json({ error: 'Task title is required' });
    }

    const newTask = {
      id: uuidv4(),
      title,
      completed: false,
      dueDate: dueDate || new Date().toISOString().split('T')[0]
    };

    carePlan.tasks.push(newTask);

    const updatedCarePlan = dataManager.update('carePlans', req.params.id, {
      tasks: carePlan.tasks,
      updatedAt: new Date().toISOString()
    });

    res.status(201).json(updatedCarePlan);
  } catch (error) {
    res.status(500).json({ error: 'Failed to add task' });
  }
});

// Delete task from care plan
router.delete('/:id/tasks/:taskId', (req, res) => {
  try {
    const carePlan = dataManager.findById('carePlans', req.params.id);
    if (!carePlan) {
      return res.status(404).json({ error: 'Care plan not found' });
    }

    carePlan.tasks = carePlan.tasks.filter(task => task.id !== req.params.taskId);

    const updatedCarePlan = dataManager.update('carePlans', req.params.id, {
      tasks: carePlan.tasks,
      updatedAt: new Date().toISOString()
    });

    res.json(updatedCarePlan);
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete task' });
  }
});

// Regenerate care plan with AI
router.post('/:id/regenerate', async (req, res) => {
  try {
    const carePlan = dataManager.findById('carePlans', req.params.id);
    if (!carePlan) {
      return res.status(404).json({ error: 'Care plan not found' });
    }

    const child = dataManager.findById('children', carePlan.childId);
    if (!child) {
      return res.status(404).json({ error: 'Child not found' });
    }

    const { specificNeeds } = req.body;
    const aiGeneratedPlan = await geminiService.generateCarePlan(child, specificNeeds || '');

    const updatedTasks = [
      ...aiGeneratedPlan.dailyRoutine.map((task, index) => ({
        id: uuidv4(),
        title: task,
        completed: false,
        dueDate: new Date(Date.now() + index * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
      })),
      ...aiGeneratedPlan.healthMonitoring.map((task, index) => ({
        id: uuidv4(),
        title: task,
        completed: false,
        dueDate: new Date(Date.now() + (index + 7) * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
      }))
    ];

    const updatedCarePlan = dataManager.update('carePlans', req.params.id, {
      tasks: updatedTasks,
      updatedAt: new Date().toISOString()
    });

    res.json(updatedCarePlan);
  } catch (error) {
    res.status(500).json({ error: 'Failed to regenerate care plan' });
  }
});

module.exports = router;
