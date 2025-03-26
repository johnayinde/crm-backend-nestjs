export default () => ({
  port: parseInt(process.env.PORT, 10) || 6000,
  database: {
    host: process.env.DB_HOST,
    port: parseInt(process.env.DB_PORT, 10) || 5432,
    username: process.env.DB_USERNAME,
    password: process.env.DB_PASSWORD,
    name: process.env.DB_NAME,
    synchronize: process.env.DB_SYNC === 'true',
    ssl: process.env.DB_SSL === 'true',
  },
  jwt: {
    secret: process.env.JWT_SECRET || 'super-secret',
    expiresIn: process.env.JWT_EXPIRES_IN || '1h',
  },
  throttle: {
    ttl: parseInt(process.env.THROTTLE_TTL, 10) || 60,
    limit: parseInt(process.env.THROTTLE_LIMIT, 10) || 10,
  },
  django: {
    baseUrl: process.env.DJANGO_API_URL || 'http://localhost:8000/api',
    apiKey: process.env.DJANGO_API_KEY,
    timeout: parseInt(process.env.DJANGO_API_TIMEOUT, 10) || 5000,
    retries: parseInt(process.env.DJANGO_API_RETRIES, 10) || 3,
  },
  redis: {
    ttl: parseInt(process.env.REDIS_TTL, 10) || 60,
  },
  security: {
    encryptionKey: process.env.ENCRYPTION_KEY || 'strong-encryption-key',
  },
});
