const express = require("express");
const { v4: uuidv4 } = require("uuid");
const dataManager = require("../utils/dataManager");
const geminiService = require("../utils/geminiService");

const router = express.Router();

// Generate personalized health tip
router.post("/tips", async (req, res) => {
  try {
    const { childId, context } = req.body;

    if (!childId) {
      return res.status(400).json({ error: "Child ID is required" });
    }

    const child = await dataManager.findById("children", childId);
    if (!child) {
      return res.status(404).json({ error: "Child not found" });
    }

    const aiTip = await geminiService.generatePersonalizedTip(
      child,
      context || ""
    );

    // Save the insight
    const insight = {
      id: uuidv4(),
      childId,
      type: "personalized_tip",
      title: "Personalized Health Tip",
      content: aiTip.tip,
      confidence: 0.85,
      createdAt: new Date().toISOString(),
    };

    const createdInsight = await dataManager.create("aiInsights", insight);

    res.json({
      tip: aiTip,
      insight: createdInsight,
    });
  } catch (error) {
    console.error("Error generating AI tip:", error);
    res.status(500).json({ error: "Failed to generate AI tip" });
  }
});

// Generate health insights
router.post("/insights", async (req, res) => {
  try {
    const { childId } = req.body;

    if (!childId) {
      return res.status(400).json({ error: "Child ID is required" });
    }

    const child = await dataManager.findById("children", childId);
    if (!child) {
      return res.status(404).json({ error: "Child not found" });
    }

    const healthRecords = await dataManager.findByChildId(
      "healthRecords",
      childId
    );
    const aiInsight = await geminiService.generateHealthInsight(
      child,
      healthRecords
    );

    // Save the insight
    const insight = {
      id: uuidv4(),
      childId,
      type: "health_analysis",
      title: "Health Analysis",
      content: JSON.stringify(aiInsight),
      confidence: 0.8,
      createdAt: new Date().toISOString(),
    };

    const createdInsight = await dataManager.create("aiInsights", insight);

    res.json({
      analysis: aiInsight,
      insight: createdInsight,
    });
  } catch (error) {
    console.error("Error generating health insights:", error);
    res.status(500).json({ error: "Failed to generate health insights" });
  }
});

// Generate care plan
router.post("/care-plan", async (req, res) => {
  try {
    const { childId, specificNeeds } = req.body;

    if (!childId) {
      return res.status(400).json({ error: "Child ID is required" });
    }

    const child = await dataManager.findById("children", childId);
    if (!child) {
      return res.status(404).json({ error: "Child not found" });
    }

    const carePlan = await geminiService.generateCarePlan(
      child,
      specificNeeds || ""
    );

    res.json(carePlan);
  } catch (error) {
    console.error("Error generating care plan:", error);
    res.status(500).json({ error: "Failed to generate care plan" });
  }
});

// Chat with AI assistant
router.post("/chat", async (req, res) => {
  try {
    const { childId, message, context } = req.body;

    if (!message) {
      return res.status(400).json({ error: "Message is required" });
    }

    let childContext = "";
    if (childId) {
      const child = await dataManager.findById("children", childId);
      if (child) {
        childContext = `
          Child Information:
          - Name: ${child.name}
          - Age: ${geminiService.calculateAge(child.dateOfBirth)} years old
          - Gender: ${child.gender}
          - Medical History: ${JSON.stringify(child.medicalHistory)}
        `;
      }
    }

    const prompt = `
      You are an AI pediatric health assistant. A parent is asking for help with their child.
      
      ${childContext}
      
      Parent's question: ${message}
      
      Context: ${context || "General parenting question"}
      
      Please provide helpful, accurate, and supportive advice. Remember to:
      1. Be encouraging and supportive
      2. Provide practical advice
      3. Suggest consulting healthcare professionals when appropriate
      4. Keep responses concise but informative
    `;

    const result = await geminiService.model.generateContent(prompt);
    const response = result.response;
    const aiResponse = response.text();

    res.json({
      response: aiResponse,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Error in AI chat:", error);
    res.status(500).json({ error: "Failed to process chat message" });
  }
});

// Get AI insights for a child
router.get("/insights/:childId", async (req, res) => {
  try {
    const insights = await dataManager.findByChildId(
      "aiInsights",
      req.params.childId
    );
    res.json(insights);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch AI insights" });
  }
});

// Delete AI insight
router.delete("/insights/:id", async (req, res) => {
  try {
    const success = await dataManager.delete("aiInsights", req.params.id);
    if (!success) {
      return res.status(404).json({ error: "AI insight not found" });
    }

    res.json({ message: "AI insight deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: "Failed to delete AI insight" });
  }
});

// Generate daily summary
router.post("/daily-summary", async (req, res) => {
  try {
    const { childId } = req.body;

    if (!childId) {
      return res.status(400).json({ error: "Child ID is required" });
    }

    const child = await dataManager.findById("children", childId);
    if (!child) {
      return res.status(404).json({ error: "Child not found" });
    }

    const healthRecords = await dataManager.findByChildId(
      "healthRecords",
      childId
    );
    const reminders = await dataManager.findByChildId("reminders", childId);
    const carePlans = await dataManager.findByChildId("carePlans", childId);

    const prompt = `
      Generate a daily summary for a parent about their child's health and care needs.
      
      Child: ${child.name}, Age: ${geminiService.calculateAge(
      child.dateOfBirth
    )} years
      
      Recent Health Records: ${JSON.stringify(healthRecords.slice(-5))}
      Active Reminders: ${JSON.stringify(reminders.filter((r) => r.isActive))}
      Care Plans: ${JSON.stringify(carePlans)}
      
      Provide:
      1. Today's priorities
      2. Health reminders
      3. Developmental focus areas
      4. General encouragement
      
      Keep it concise and actionable.
    `;

    const result = await geminiService.model.generateContent(prompt);
    const response = result.response;
    const summary = response.text();

    res.json({
      summary,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Error generating daily summary:", error);
    res.status(500).json({ error: "Failed to generate daily summary" });
  }
});

module.exports = router;
