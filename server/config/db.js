import mongoose from 'mongoose';

let connectingPromise = null;

const doConnect = async () => {
  const targetUri = process.env.MONGO_URI;

  if (targetUri) {
    if (process.env.VERCEL && (targetUri.includes('127.0.0.1') || targetUri.includes('localhost'))) {
      throw new Error(
        'MONGO_URI on Vercel is set to localhost (127.0.0.1). Vercel is a serverless cloud environment that requires a cloud MongoDB database such as MongoDB Atlas (mongodb+srv://...). Please update MONGO_URI in your Vercel Project Settings > Environment Variables.'
      );
    }

    const sanitizedUri = targetUri.replace(/:([^:@]{4})[^:@]*@/, ':****@');
    console.log(`Connecting to MongoDB at: ${sanitizedUri} ...`);
    const conn = await mongoose.connect(targetUri, {
      serverSelectionTimeoutMS: 8000, // 8s timeout for serverless cold start to Atlas
      bufferCommands: false,
    });
    console.log(`MongoDB Connected: ${conn.connection.host}`);
    return conn;
  }

  // Fallback for local development if MONGO_URI is not set
  if (!process.env.VERCEL && process.env.NODE_ENV !== 'production') {
    const localUri = 'mongodb://127.0.0.1:27017/expense_tracker';
    try {
      console.log(`Connecting to local MongoDB at: ${localUri} ...`);
      const conn = await mongoose.connect(localUri, {
        serverSelectionTimeoutMS: 2000,
        bufferCommands: false,
      });
      console.log(`Local MongoDB Connected: ${conn.connection.host}`);
      return conn;
    } catch (primaryErr) {
      console.warn(`Local MongoDB not running: ${primaryErr.message}`);
      console.log('Spinning up embedded MongoDB instance for automatic zero-config database...');

      try {
        await mongoose.disconnect();
      } catch (_) {}

      try {
        const { MongoMemoryServer } = await import('mongodb-memory-server');
        const memServer = await MongoMemoryServer.create({
          instance: { dbName: 'expense_tracker' },
        });
        const memUri = memServer.getUri();
        const conn = await mongoose.connect(memUri, { bufferCommands: false });
        console.log(`Embedded MongoDB Connected successfully at: ${memUri}`);
        return conn;
      } catch (memErr) {
        console.error('Failed to start embedded MongoDB:', memErr.message);
        throw memErr;
      }
    }
  }

  // In production / Vercel without MONGO_URI
  throw new Error('MONGO_URI is not defined. Please configure MONGO_URI in your Vercel project environment variables.');
};

export const connectDB = async () => {
  // If already connected, return existing connection
  if (mongoose.connection.readyState === 1) {
    return mongoose.connection;
  }

  // If already connecting, await the single in-flight promise
  if (connectingPromise) {
    return connectingPromise;
  }

  connectingPromise = doConnect();

  try {
    const conn = await connectingPromise;
    return conn;
  } catch (err) {
    console.error(`MongoDB connection error: ${err.message}`);
    throw err;
  } finally {
    connectingPromise = null;
  }
};

export const disconnectDB = async () => {
  try {
    if (mongoose.connection.readyState !== 0) {
      await mongoose.disconnect();
    }
    connectingPromise = null;
  } catch (err) {
    console.error('Error during database disconnect:', err.message);
  }
};

export default connectDB;
