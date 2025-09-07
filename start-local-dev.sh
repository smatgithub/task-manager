#!/bin/bash

# Local Development Setup Script
# This starts only MongoDB in Docker, runs app locally

set -e

echo "🚀 Starting local development environment..."

# Start MongoDB in Docker
echo "📦 Starting MongoDB..."
docker run -d \
  --name taskmgr-mongo-local \
  -p 27017:27017 \
  -e MONGO_INITDB_ROOT_USERNAME=root \
  -e MONGO_INITDB_ROOT_PASSWORD=devpass \
  mongo:6

echo "✅ MongoDB started on localhost:27017"

# Wait for MongoDB to be ready
echo "⏳ Waiting for MongoDB to be ready..."
sleep 5

# Check if MongoDB is ready
until docker exec taskmgr-mongo-local mongosh --quiet --eval "db.runCommand({ ping: 1 }).ok" > /dev/null 2>&1; do
  echo "⏳ Still waiting for MongoDB..."
  sleep 2
done

echo "✅ MongoDB is ready!"

# Start the application locally
echo "🎯 Starting application locally..."
echo "📝 Make sure to update your .env files to use:"
echo "   MONGO_URI=mongodb://root:devpass@localhost:27017/taskmgr?authSource=admin"
echo ""
echo "🚀 Run these commands in separate terminals:"
echo "   Terminal 1: npm run dev:server"
echo "   Terminal 2: npm run dev:client"
echo ""
echo "🌐 Access your app at:"
echo "   Frontend: http://localhost:5173"
echo "   Backend:  http://localhost:3000"
echo "   MongoDB:  localhost:27017"
echo ""
echo "🛑 To stop MongoDB: docker stop taskmgr-mongo-local && docker rm taskmgr-mongo-local"
