# MongoDB Migration Guide

This guide explains how to migrate your existing JSON data to MongoDB.

## Prerequisites

1. **Install MongoDB**: Make sure MongoDB is installed and running on your system
   - For local development: `mongodb://localhost:27017`
   - For cloud: Use MongoDB Atlas or your preferred MongoDB hosting service

2. **Install Dependencies**: Run `npm install` to install mongoose and other dependencies

## Environment Setup

1. Copy the environment file:
   ```bash
   cp env.example .env
   ```

2. Update your `.env` file with your MongoDB connection string:
   ```
   MONGODB_URI=mongodb://localhost:27017/ai-copilot-parents
   ```

   For MongoDB Atlas, use:
   ```
   MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/ai-copilot-parents
   ```

## Running the Migration

### Option 1: Using the Migration Script

1. **Run the migration script**:
   ```bash
   node scripts/migrate-to-mongodb.js
   ```

2. **The script will**:
   - Connect to your MongoDB database
   - Read the existing `data/models.json` file
   - Clear existing data (optional - can be disabled)
   - Insert all data into appropriate MongoDB collections
   - Provide detailed progress logging

### Option 2: Manual Migration

If you prefer to migrate manually or have a different JSON file:

1. **Create a custom migration script**:
   ```javascript
   const MigrationService = require('./scripts/migrate-to-mongodb');
   const migration = new MigrationService();
   
   // Customize the data file path if needed
   migration.DATA_FILE = path.join(__dirname, 'path/to/your/data.json');
   
   migration.migrate();
   ```

## What Gets Migrated

The migration script handles the following collections:

- **parents**: Parent user information
- **children**: Child profiles and development data
- **healthRecords**: Medical records and appointments
- **reminders**: Medication and appointment reminders
- **carePlans**: AI-generated care plans with tasks
- **aiInsights**: AI-generated insights and tips

## Data Structure

The migration preserves the exact structure of your JSON data while adding MongoDB-specific features:

- **Unique IDs**: Each document gets a unique `id` field
- **Timestamps**: Automatic `createdAt` and `updatedAt` fields
- **Validation**: Mongoose schema validation for data integrity
- **Indexing**: Automatic indexing on `id` fields for fast lookups

## After Migration

1. **Start your server**:
   ```bash
   npm start
   # or for development
   npm run dev
   ```

2. **Verify the migration**:
   - Check the server logs for successful MongoDB connection
   - Test API endpoints to ensure data is accessible
   - Verify that all CRUD operations work correctly

## Troubleshooting

### Common Issues

1. **Connection Failed**:
   - Verify MongoDB is running
   - Check your connection string in `.env`
   - Ensure network access (for cloud MongoDB)

2. **Migration Errors**:
   - Check the console output for specific error messages
   - Verify your JSON file is valid
   - Ensure you have write permissions to the database

3. **Data Not Appearing**:
   - Check if the migration completed successfully
   - Verify the database name in your connection string
   - Use MongoDB Compass or similar tool to inspect collections

### Rollback

If you need to rollback to JSON file storage:

1. Comment out the database connection in `server/index.js`
2. Restore the original `dataManager.js` (keep a backup)
3. Restart the server

## Production Considerations

For production deployments:

1. **Use Environment Variables**: Never hardcode connection strings
2. **Enable Authentication**: Use MongoDB authentication
3. **Set Up Monitoring**: Monitor database performance and connections
4. **Backup Strategy**: Implement regular database backups
5. **Connection Pooling**: Configure appropriate connection limits

## Support

If you encounter issues:

1. Check the server logs for detailed error messages
2. Verify your MongoDB connection and permissions
3. Ensure all dependencies are properly installed
4. Test with a simple connection script first

The migration script provides detailed logging to help diagnose any issues during the process.
