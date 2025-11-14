import * as dotenv from 'dotenv';

dotenv.config();

const requiredVars = ['PORT', 'DATABASE_URL', 'REDIS_URL', 'JWT_SECRET'];

requiredVars.forEach((key) => {
  if (!process.env[key]) {
    console.warn(`⚠️  Missing environment variable: ${key}`);
  }
});

export const env = {
  nodeEnv: process.env.NODE_ENV || 'development',
  port: Number(process.env.PORT) || 4000,
  databaseUrl: process.env.DATABASE_URL || '',
  redisUrl: process.env.REDIS_URL || 'redis://localhost:6379',
  openAIApiKey: process.env.OPENAI_API_KEY,
  jwtSecret: process.env.JWT_SECRET || 'change-me',
};
