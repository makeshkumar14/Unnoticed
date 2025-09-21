const mongoose = require("mongoose");

class Database {
  constructor() {
    this.isConnected = false;
  }

  async connect() {
    try {
      const mongoUri =
        process.env.MONGODB_URI ||
        "mongodb://localhost:27017/ai-copilot-parents";

      await mongoose.connect(mongoUri); // no deprecated options
      this.isConnected = true;

      console.log("✅ Connected to MongoDB successfully");

      mongoose.connection.on("error", (err) => {
        console.error("❌ MongoDB connection error:", err);
        this.isConnected = false;
      });

      mongoose.connection.on("disconnected", () => {
        console.log("⚠️ MongoDB disconnected");
        this.isConnected = false;
      });

      mongoose.connection.on("reconnected", () => {
        console.log("✅ MongoDB reconnected");
        this.isConnected = true;
      });
    } catch (error) {
      console.error("❌ Failed to connect to MongoDB:", error);
      this.isConnected = false;
      throw error;
    }
  }

  async disconnect() {
    try {
      await mongoose.disconnect();
      this.isConnected = false;
      console.log("✅ Disconnected from MongoDB");
    } catch (error) {
      console.error("❌ Error disconnecting from MongoDB:", error);
      throw error;
    }
  }

  getConnectionStatus() {
    return this.isConnected;
  }
}

module.exports = new Database();
