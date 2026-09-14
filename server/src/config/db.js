import mongoose from 'mongoose';

export const connectDB = async () => {
  const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/Airbnb';

  try {
    const conn = await mongoose.connect(uri);
    console.log(`[MongoDB] Connected successfully to: ${conn.connection.host}/${conn.connection.name}`);
  } catch (error) {
    console.error(`[MongoDB] Connection error: ${error.message}`);
    // Do not terminate process immediately so health check endpoint can report disconnected status
  }
};

mongoose.connection.on('connected', () => {
  console.log('[MongoDB] Mongoose event: connected');
});

mongoose.connection.on('error', (err) => {
  console.error('[MongoDB] Mongoose event error:', err);
});

mongoose.connection.on('disconnected', () => {
  console.warn('[MongoDB] Mongoose event: disconnected');
});

export default connectDB;
