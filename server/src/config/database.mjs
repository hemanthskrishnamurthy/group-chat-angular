import mongoose from 'mongoose';
import { env } from './env.mjs';
import { logger } from '../utils/logger.mjs';

export async function connectDatabase() {
  mongoose.set('strictQuery', true);
  await mongoose.connect(env.mongoUri);
  logger.info('MongoDB connected');
}
