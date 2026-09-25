import mongoose from 'mongoose';

let mongoMemoryServer = null;

export const connectDB = async () => {
  const targetUri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/expense_tracker';
  
  try {
    // First, attempt connecting to the configured MongoDB URI (local or Atlas)
    console.log(`Connecting to MongoDB at: ${targetUri.replace(/:([^:@]{4})[^:@]*@/, ':****@')} ...`);
    const conn = await mongoose.connect(targetUri, {
      serverSelectionTimeoutMS: 2500, // Quick failover if local daemon isn't running
    });
    console.log(`MongoDB Connected: ${conn.connection.host}`);
    return conn;
  } catch (primaryErr) {
    console.warn(`Could not connect to external MongoDB: ${primaryErr.message}`);
    console.log('Spinning up embedded MongoDB instance for automatic zero-config database...');

    try {
      const { MongoMemoryServer } = await import('mongodb-memory-server');
      mongoMemoryServer = await MongoMemoryServer.create({
        instance: {
          dbName: 'expense_tracker'
        }
      });
      const memUri = mongoMemoryServer.getUri();
      const conn = await mongoose.connect(memUri);
      console.log(`Embedded MongoDB Connected successfully at: ${memUri}`);
      return conn;
    } catch (memErr) {
      console.error('Fatal Error: Failed to start embedded MongoDB:', memErr.message);
      throw memErr;
    }
  }
};

export const disconnectDB = async () => {
  try {
    await mongoose.disconnect();
    if (mongoMemoryServer) {
      await mongoMemoryServer.stop();
    }
  } catch (err) {
    console.error('Error during database disconnect:', err.message);
  }
};
