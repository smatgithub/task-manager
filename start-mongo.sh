#!/bin/bash

# Simple script to start MongoDB for local development

echo "🚀 Starting MongoDB for local development..."

# Check if MongoDB container already exists
if docker ps -a --format 'table {{.Names}}' | grep -q "taskmgr-mongo-local"; then
    echo "📦 MongoDB container already exists. Starting it..."
    docker start taskmgr-mongo-local
else
    echo "📦 Creating and starting new MongoDB container..."
    docker run -d \
        --name taskmgr-mongo-local \
        -p 27017:27017 \
        -e MONGO_INITDB_ROOT_USERNAME=root \
        -e MONGO_INITDB_ROOT_PASSWORD=devpass \
        mongo:6
fi

echo "⏳ Waiting for MongoDB to be ready..."
sleep 3

# Check if MongoDB is ready
until docker exec taskmgr-mongo-local mongosh --quiet --eval "db.runCommand({ ping: 1 }).ok" > /dev/null 2>&1; do
    echo "⏳ Still waiting for MongoDB..."
    sleep 2
done

echo "✅ MongoDB is ready!"
echo "🌐 MongoDB running on: localhost:27017"
echo "🔑 Username: root"
echo "🔑 Password: devpass"
echo "📊 Database: taskmgr"
echo ""
echo "🛑 To stop MongoDB: docker stop taskmgr-mongo-local"
echo "🗑️  To remove MongoDB: docker stop taskmgr-mongo-local && docker rm taskmgr-mongo-local"
