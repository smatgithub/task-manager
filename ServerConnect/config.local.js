// Local Development Configuration
module.exports = {
  // Server Configuration
  NODE_ENV: 'development',
  PORT: 3000,
  
  // MongoDB - Local Docker Container
  MONGO_URI: 'mongodb://localhost:27017/task-manager',
  
  // JWT Configuration
  JWT_SECRET: 'your-local-jwt-secret-key-change-this-in-production',
  
  // Frontend URL
  FRONTEND_URL: 'http://localhost:5173',
  
  // Trust Proxy (for development)
  TRUST_PROXY: false,
  
  // CORS Configuration
  CORS_ORIGIN: 'http://localhost:5173',
  
  // OAuth Configuration (replace with your actual values)
  GOOGLE_CLIENT_ID: 'your-google-client-id',
  GOOGLE_CLIENT_SECRET: 'your-google-client-secret',
  MICROSOFT_CLIENT_ID: 'your-microsoft-client-id',
  MICROSOFT_CLIENT_SECRET: 'your-microsoft-client-secret'
};
