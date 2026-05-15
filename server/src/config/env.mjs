import dotenv from 'dotenv';

dotenv.config();

export const env = {
  nodeEnv: process.env.NODE_ENV ?? 'development',
  port: Number(process.env.PORT ?? 4000),
  mongoUri: process.env.MONGO_URI ?? 'mongodb://127.0.0.1:27017/enterprise_hrms',
  jwtSecret: process.env.JWT_SECRET ?? 'change-this-secret',
  jwtRefreshSecret: process.env.JWT_REFRESH_SECRET ?? 'change-this-refresh-secret',
  corsOrigin: process.env.CORS_ORIGIN ?? 'http://localhost:4200',
};
