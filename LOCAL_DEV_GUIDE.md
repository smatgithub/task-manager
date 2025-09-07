# Local Development Guide

This guide shows you how to develop locally with MongoDB in Docker and your app running locally.

## 🚀 Quick Start

### 1. Start MongoDB (Docker)
```bash
npm run local:mongo
```

### 2. Start Your Application (Local)
```bash
npm run local:dev
```

### 3. Access Your Application
- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:3000
- **MongoDB**: localhost:27017

## 📋 Complete Setup

### Step 1: Start MongoDB Container
```bash
# This will start MongoDB in Docker
npm run local:mongo

# Or manually:
docker run -d --name taskmgr-mongo-local -p 27017:27017 \
  -e MONGO_INITDB_ROOT_USERNAME=root \
  -e MONGO_INITDB_ROOT_PASSWORD=devpass \
  mongo:6
```

### Step 2: Start Your Application
```bash
# This runs both frontend and backend locally
npm run local:dev

# Or run them separately in different terminals:
# Terminal 1: Backend
npm run dev:server

# Terminal 2: Frontend  
npm run dev:client
```

## 🔧 Configuration

Your local development is configured in `ServerConnect/config.local.js`:

```javascript
{
  NODE_ENV: 'development',
  PORT: 3000,
  MONGO_URI: 'mongodb://root:devpass@localhost:27017/taskmgr?authSource=admin',
  FRONTEND_URL: 'http://localhost:5173',
  // ... other settings
}
```

## 🛠️ Development Workflow

1. **Start MongoDB**: `npm run local:mongo`
2. **Start App**: `npm run local:dev`
3. **Edit Code**: Make changes in `ClientConnect/src/` or `ServerConnect/`
4. **See Changes**: Hot reloading works automatically
5. **Debug**: Use browser dev tools and console logs
6. **Stop**: Ctrl+C to stop the app, `docker stop taskmgr-mongo-local` to stop MongoDB

## 📁 Project Structure

```
task-manager/
├── ClientConnect/          # Frontend (React + Vite)
│   └── src/               # Your frontend code
├── ServerConnect/         # Backend (Node.js + Express)
│   ├── config.local.js    # Local development config
│   └── server.js          # Your backend code
├── compose.yaml           # Production Docker setup
├── start-mongo.sh         # MongoDB startup script
└── package.json           # NPM scripts
```

## 🔍 Available Commands

```bash
# MongoDB
npm run local:mongo        # Start MongoDB in Docker

# Application
npm run local:dev          # Start both frontend and backend
npm run dev:server         # Start only backend
npm run dev:client         # Start only frontend

# Docker (for production)
npm run docker:dev         # Full Docker development
npm run docker:stop        # Stop Docker development
```

## 🐛 Troubleshooting

### MongoDB Issues
```bash
# Check if MongoDB is running
docker ps | grep mongo

# View MongoDB logs
docker logs taskmgr-mongo-local

# Restart MongoDB
docker restart taskmgr-mongo-local

# Reset MongoDB (removes all data)
docker stop taskmgr-mongo-local
docker rm taskmgr-mongo-local
npm run local:mongo
```

### Port Conflicts
```bash
# Check what's using port 3000
lsof -i :3000

# Check what's using port 5173
lsof -i :5173

# Kill process using port
kill -9 <PID>
```

### Application Issues
```bash
# Clear node_modules and reinstall
rm -rf node_modules package-lock.json
rm -rf ClientConnect/node_modules ClientConnect/package-lock.json
rm -rf ServerConnect/node_modules ServerConnect/package-lock.json
npm install
```

## 🎯 Benefits of This Setup

- ✅ **Fast Development**: No Docker overhead for your app
- ✅ **Hot Reloading**: Changes reflect immediately
- ✅ **Easy Debugging**: Full IDE integration
- ✅ **Consistent Database**: MongoDB in Docker (same as production)
- ✅ **Simple Setup**: One command to start everything
- ✅ **Production Ready**: Easy to deploy with Docker

## 🚀 Production Deployment

When ready for production, use Docker:

```bash
# Build and run production
docker-compose up -d

# Or build manually
docker build -t task-manager .
docker run -p 8080:8080 task-manager
```

## 📝 Environment Variables

The local development uses these default settings:

- **MongoDB**: `mongodb://root:devpass@localhost:27017/taskmgr?authSource=admin`
- **Backend Port**: 3000
- **Frontend Port**: 5173
- **Node Environment**: development

To customize, edit `ServerConnect/config.local.js`.

## 🔄 Switching Between Local and Docker Development

### Local Development (Current)
```bash
npm run local:mongo    # Start MongoDB
npm run local:dev      # Start app locally
```

### Docker Development (Alternative)
```bash
npm run docker:dev     # Everything in Docker
```

## 📞 Support

If you encounter issues:

1. Check the troubleshooting section above
2. View logs: `docker logs taskmgr-mongo-local`
3. Restart services: `npm run local:mongo` then `npm run local:dev`
4. Check ports: Make sure 3000 and 5173 are available

## 🎉 You're Ready!

Your local development environment is now set up. Start coding and see your changes live immediately!
