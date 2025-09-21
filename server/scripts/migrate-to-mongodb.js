#!/usr/bin/env node

/**
 * Migration Script: JSON to MongoDB
 * 
 * This script migrates data from the local JSON file (models.json) to MongoDB.
 * It handles arrays and single objects gracefully and provides detailed logging.
 * 
 * How to run:
 * 1. Make sure MongoDB is running locally or update MONGODB_URI in your .env file
 * 2. Install dependencies: npm install
 * 3. Run the script: node scripts/migrate-to-mongodb.js
 * 
 * The script will:
 * - Connect to MongoDB using the URI from .env file
 * - Read the existing models.json file
 * - Insert all data into appropriate MongoDB collections
 * - Handle duplicates gracefully
 * - Provide detailed progress logging
 */

require('dotenv').config();
const fs = require('fs');
const path = require('path');
const mongoose = require('mongoose');
const { Parent, Child, HealthRecord, Reminder, CarePlan, AIInsight } = require('../models');

// Configuration
const DATA_FILE = path.join(__dirname, '../data/models.json');
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/ai-copilot-parents';

// Collection mapping
const COLLECTIONS = {
  parents: Parent,
  children: Child,
  healthRecords: HealthRecord,
  reminders: Reminder,
  carePlans: CarePlan,
  aiInsights: AIInsight
};

class MigrationService {
  constructor() {
    this.stats = {
      total: 0,
      inserted: 0,
      skipped: 0,
      errors: 0
    };
  }

  async connect() {
    try {
      console.log('🔌 Connecting to MongoDB...');
      await mongoose.connect(MONGODB_URI, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
      });
      console.log('✅ Connected to MongoDB successfully');
    } catch (error) {
      console.error('❌ Failed to connect to MongoDB:', error.message);
      throw error;
    }
  }

  async disconnect() {
    try {
      await mongoose.disconnect();
      console.log('✅ Disconnected from MongoDB');
    } catch (error) {
      console.error('❌ Error disconnecting from MongoDB:', error.message);
    }
  }

  loadJsonData() {
    try {
      console.log('📖 Reading JSON data file...');
      
      if (!fs.existsSync(DATA_FILE)) {
        throw new Error(`Data file not found: ${DATA_FILE}`);
      }

      const fileContent = fs.readFileSync(DATA_FILE, 'utf8');
      const data = JSON.parse(fileContent);
      
      console.log('✅ JSON data loaded successfully');
      console.log(`📊 Data summary:`);
      Object.keys(data).forEach(key => {
        if (Array.isArray(data[key])) {
          console.log(`   - ${key}: ${data[key].length} items`);
        } else {
          console.log(`   - ${key}: 1 item`);
        }
      });

      return data;
    } catch (error) {
      console.error('❌ Error loading JSON data:', error.message);
      throw error;
    }
  }

  async clearExistingData() {
    try {
      console.log('🧹 Clearing existing data...');
      
      for (const [collectionName, Model] of Object.entries(COLLECTIONS)) {
        const count = await Model.countDocuments();
        if (count > 0) {
          await Model.deleteMany({});
          console.log(`   - Cleared ${count} documents from ${collectionName}`);
        }
      }
      
      console.log('✅ Existing data cleared');
    } catch (error) {
      console.error('❌ Error clearing existing data:', error.message);
      throw error;
    }
  }

  async migrateCollection(collectionName, data, Model) {
    console.log(`\n📦 Migrating ${collectionName}...`);
    
    if (!Array.isArray(data)) {
      console.log(`⚠️  ${collectionName} is not an array, skipping...`);
      return;
    }

    if (data.length === 0) {
      console.log(`   - No ${collectionName} to migrate`);
      return;
    }

    let inserted = 0;
    let skipped = 0;
    let errors = 0;

    for (const item of data) {
      try {
        // Check if item already exists
        const existing = await Model.findOne({ id: item.id });
        if (existing) {
          console.log(`   - Skipping ${collectionName} with id: ${item.id} (already exists)`);
          skipped++;
          continue;
        }

        // Create new document
        const newItem = new Model(item);
        await newItem.save();
        inserted++;
        
        if (inserted % 10 === 0) {
          console.log(`   - Progress: ${inserted}/${data.length} ${collectionName} migrated`);
        }
      } catch (error) {
        console.error(`   - Error migrating ${collectionName} item ${item.id}:`, error.message);
        errors++;
      }
    }

    console.log(`✅ ${collectionName} migration completed:`);
    console.log(`   - Inserted: ${inserted}`);
    console.log(`   - Skipped: ${skipped}`);
    console.log(`   - Errors: ${errors}`);

    this.stats.inserted += inserted;
    this.stats.skipped += skipped;
    this.stats.errors += errors;
    this.stats.total += data.length;
  }

  async migrate() {
    try {
      console.log('🚀 Starting migration from JSON to MongoDB...\n');
      
      // Connect to MongoDB
      await this.connect();
      
      // Load JSON data
      const jsonData = this.loadJsonData();
      
      // Clear existing data (optional - comment out if you want to keep existing data)
      await this.clearExistingData();
      
      // Migrate each collection
      for (const [collectionName, Model] of Object.entries(COLLECTIONS)) {
        if (jsonData[collectionName]) {
          await this.migrateCollection(collectionName, jsonData[collectionName], Model);
        } else {
          console.log(`⚠️  Collection ${collectionName} not found in JSON data`);
        }
      }
      
      // Print final statistics
      console.log('\n📊 Migration Summary:');
      console.log(`   - Total items processed: ${this.stats.total}`);
      console.log(`   - Successfully inserted: ${this.stats.inserted}`);
      console.log(`   - Skipped (duplicates): ${this.stats.skipped}`);
      console.log(`   - Errors: ${this.stats.errors}`);
      
      if (this.stats.errors === 0) {
        console.log('\n🎉 Migration completed successfully!');
      } else {
        console.log('\n⚠️  Migration completed with some errors. Check the logs above.');
      }
      
    } catch (error) {
      console.error('\n❌ Migration failed:', error.message);
      process.exit(1);
    } finally {
      await this.disconnect();
    }
  }
}

// Run migration if this script is executed directly
if (require.main === module) {
  const migration = new MigrationService();
  migration.migrate().catch(error => {
    console.error('Fatal error:', error);
    process.exit(1);
  });
}

module.exports = MigrationService;
