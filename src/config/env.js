import 'dotenv/config'

export const env = {
  port: Number(process.env.PORT) || 3000,
  nodeEnv: process.env.NODE_ENV || 'development',
  corsOrigin: process.env.CORS_ORIGIN || 'http://localhost:5173',
  databaseUrl: process.env.DATABASE_URL,
  jwtSecret: process.env.JWT_SECRET,
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '7d',
  rawgApiKey: process.env.RAWG_API_KEY,
  rawgApiUrl: process.env.RAWG_API_URL || 'https://api.rawg.io/api',
}
