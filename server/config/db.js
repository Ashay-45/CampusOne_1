const mongoose = require('mongoose');

// Mongoose Connection Event Monitoring
mongoose.connection.on('connected', () => {
  if (process.env.NODE_ENV !== 'test') {
    console.log('✅ MongoDB connection established.');
  }
});

mongoose.connection.on('error', (err) => {
  if (process.env.NODE_ENV !== 'test') {
    console.error(`❌ MongoDB connection error: ${err.message}`);
  }
});

mongoose.connection.on('disconnected', () => {
  if (process.env.NODE_ENV !== 'test') {
    console.warn('⚠️ MongoDB connection disconnected. Awaiting reconnect...');
  }
});

mongoose.connection.on('reconnected', () => {
  if (process.env.NODE_ENV !== 'test') {
    console.log('🔄 MongoDB connection successfully reconnected.');
  }
});

const connectDB = async () => {
  const uri = process.env.MONGO_URI || process.env.MONGODB_URI;

  if (!uri) {
    console.error('❌ FATAL: Neither MONGO_URI nor MONGODB_URI is defined in environment.');
    return null;
  }

  try {
    const conn = await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 5000,
      maxPoolSize: Number(process.env.MONGO_MAX_POOL_SIZE) || 10,
      minPoolSize: 2,
      socketTimeoutMS: 45000,
      retryWrites: true,
      w: 'majority'
    });

    if (process.env.NODE_ENV !== 'test') {
      console.log(`✅ MongoDB Connected successfully: ${conn.connection.host}`);
    }
    return conn;
  } catch (error) {
    if (process.env.NODE_ENV !== 'test') {
      console.error(`❌ MongoDB initial connection failed: ${error.message}`);
    }
    return null;
  }
};

const getDBStatus = () => {
  const readyState = mongoose.connection.readyState;
  // readyState codes: 0 = disconnected, 1 = connected, 2 = connecting, 3 = disconnecting
  const stateLabels = { 0: 'disconnected', 1: 'connected', 2: 'connecting', 3: 'disconnecting' };

  return {
    connected: readyState === 1,
    state: stateLabels[readyState] || 'unknown',
    readyState,
    host: mongoose.connection.host || null,
    mongoUriConfigured: Boolean(process.env.MONGO_URI || process.env.MONGODB_URI)
  };
};

module.exports = { connectDB, getDBStatus };
