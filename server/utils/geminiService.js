const { GoogleGenerativeAI } = require("@google/generative-ai");

class GeminiService {
  constructor() {
    this.genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    this.model = this.genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
  }

  async generatePersonalizedTip(childData, context = "") {
    try {
      const prompt = `
        As an AI pediatric health assistant, provide personalized advice for a child based on the following information:
        
        Child Information:
        - Name: ${childData.name}
        - Age: ${this.calculateAge(childData.dateOfBirth)} years old
        - Gender: ${childData.gender}
        - Medical History: ${JSON.stringify(childData.medicalHistory)}
        - Development Milestones: ${JSON.stringify(
          childData.developmentMilestones
        )}
        
        Context: ${context}
        
        Please provide:
        1. A personalized health tip (2-3 sentences)
        2. A developmental milestone to watch for
        3. A safety recommendation
        4. A nutrition suggestion
        
        Format your response as JSON with these keys: tip, milestone, safety, nutrition
      `;

      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();

      // Try to parse as JSON, fallback to structured text
      try {
        return JSON.parse(text);
      } catch {
        return {
          tip: text,
          milestone: "Continue monitoring developmental progress",
          safety: "Ensure childproofing is up to date",
          nutrition: "Maintain balanced meals with fruits and vegetables",
        };
      }
    } catch (error) {
      console.error("Error generating personalized tip:", error);
      return {
        tip: "Continue providing love, care, and attention to your child's development.",
        milestone: "Monitor age-appropriate developmental milestones",
        safety: "Ensure a safe environment for exploration and play",
        nutrition: "Provide balanced nutrition with age-appropriate portions",
      };
    }
  }

  async generateCarePlan(childData, specificNeeds = "") {
    try {
      const prompt = `
        Create a comprehensive care plan for a child with the following information:
        
        Child Information:
        - Name: ${childData.name}
        - Age: ${this.calculateAge(childData.dateOfBirth)} years old
        - Medical History: ${JSON.stringify(childData.medicalHistory)}
        - Current Development: ${JSON.stringify(
          childData.developmentMilestones
        )}
        
        Specific Needs: ${specificNeeds}
        
        Please create a care plan that includes:
        1. Daily routine recommendations
        2. Health monitoring tasks
        3. Developmental activities
        4. Safety measures
        5. Nutrition guidelines
        
        Format as JSON with these sections: dailyRoutine, healthMonitoring, activities, safety, nutrition
      `;

      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();

      try {
        return JSON.parse(text);
      } catch {
        return {
          dailyRoutine: ["Regular meal times", "Adequate sleep", "Play time"],
          healthMonitoring: [
            "Track growth",
            "Monitor development",
            "Regular checkups",
          ],
          activities: [
            "Age-appropriate play",
            "Reading time",
            "Physical activity",
          ],
          safety: [
            "Childproof environment",
            "Supervision",
            "Emergency preparedness",
          ],
          nutrition: [
            "Balanced meals",
            "Adequate hydration",
            "Limit processed foods",
          ],
        };
      }
    } catch (error) {
      console.error("Error generating care plan:", error);
      return {
        dailyRoutine: ["Maintain consistent schedule", "Ensure adequate rest"],
        healthMonitoring: ["Regular health checkups", "Monitor growth"],
        activities: ["Encourage play and exploration", "Reading and learning"],
        safety: ["Maintain safe environment", "Supervise activities"],
        nutrition: ["Provide balanced nutrition", "Encourage healthy eating"],
      };
    }
  }

  async generateHealthInsight(childData, healthData) {
    try {
      const prompt = `
        Analyze the following health data for a child and provide insights:
        
        Child: ${childData.name}, Age: ${this.calculateAge(
        childData.dateOfBirth
      )} years
        Health Records: ${JSON.stringify(healthData)}
        
        Provide insights on:
        1. Health trends
        2. Areas of concern
        3. Recommendations
        4. Upcoming milestones to watch
        
        Format as JSON with: trends, concerns, recommendations, milestones
      `;

      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();

      try {
        return JSON.parse(text);
      } catch {
        return {
          trends: "Continue monitoring health metrics",
          concerns: "No immediate concerns identified",
          recommendations: "Maintain current care routine",
          milestones: "Watch for age-appropriate developmental progress",
        };
      }
    } catch (error) {
      console.error("Error generating health insight:", error);
      return {
        trends: "Health monitoring is on track",
        concerns: "Continue regular health monitoring",
        recommendations: "Maintain consistent care routine",
        milestones: "Monitor developmental progress",
      };
    }
  }

  calculateAge(dateOfBirth) {
    const today = new Date();
    const birthDate = new Date(dateOfBirth);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();

    if (
      monthDiff < 0 ||
      (monthDiff === 0 && today.getDate() < birthDate.getDate())
    ) {
      age--;
    }

    return age;
  }
}

module.exports = new GeminiService();
