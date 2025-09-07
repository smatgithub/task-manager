# Manual Docker Development Setup

Since there might be Docker Compose issues, here are the manual commands to work with Docker for development:

## Prerequisites

Make sure Docker is installed and running:
```bash
docker --version
```

## Manual Commands

### 1. Start Development Environment

```bash
# Start MongoDB
docker run -d \
  --name taskmgr-mongo-dev \
  -p 27017:27017 \
  -e MONGO_INITDB_ROOT_USERNAME=root \
  -e MONGO_INITDB_ROOT_PASSWORD=devpass \
  mongo:6

# Build and start backend (with volume mount for live reloading)
docker run -d \
  --name taskmgr-backend-dev \
  -p 3000:3000 \
  -v $(pwd)/ServerConnect:/app \
  -v /app/node_modules \
  -e NODE_ENV=development \
  -e PORT=3000 \
  -e MONGO_URI=mongodb://root:devpass@host.docker.internal:27017/taskmgr?authSource=admin \
  -e FRONTEND_URL=http://localhost:5173 \
  --link taskmgr-mongo-dev:mongo \
  node:20-alpine sh -c "cd /app && npm install && npm run dev"

# Build and start frontend (with volume mount for live reloading)
docker run -d \
  --name taskmgr-frontend-dev \
  -p 5173:5173 \
  -v $(pwd)/ClientConnect:/app \
  -v /app/node_modules \
  -e VITE_API_BASE_URL=http://localhost:3000 \
  node:20-alpine sh -c "cd /app && npm install && npm run dev -- --host 0.0.0.0"
```

### 2. Alternative: Use Docker Compose (if available)

```bash
# Try the newer docker compose command
docker compose -f compose.dev.yaml up -d

# Or try the legacy docker-compose command
docker-compose -f compose.dev.yaml up -d
```

### 3. View Logs

```bash
# All services
docker logs -f taskmgr-mongo-dev
docker logs -f taskmgr-backend-dev
docker logs -f taskmgr-frontend-dev

# Or if using compose
docker compose -f compose.dev.yaml logs -f
```

### 4. Access Container Shells

```bash
# Backend container
docker exec -it taskmgr-backend-dev sh

# Frontend container
docker exec -it taskmgr-frontend-dev sh

# MongoDB shell
docker exec -it taskmgr-mongo-dev mongosh
```

### 5. Stop Services

```bash
# Stop individual containers
docker stop taskmgr-mongo-dev taskmgr-backend-dev taskmgr-frontend-dev

# Remove containers
docker rm taskmgr-mongo-dev taskmgr-backend-dev taskmgr-frontend-dev

# Or if using compose
docker compose -f compose.dev.yaml down
```

### 6. Clean Up

```bash
# Remove all containers and volumes
docker compose -f compose.dev.yaml down -v
docker system prune -f
```

## Development Workflow

1. **Start the services** using one of the methods above
2. **Access your application:**
   - Frontend: http://localhost:5173
   - Backend API: http://localhost:3000
3. **Edit your code** in `ClientConnect/` or `ServerConnect/`
4. **See changes immediately** - no rebuild needed!
5. **Check logs** if something goes wrong
6. **Stop services** when done

## Troubleshooting

### Port Already in Use
```bash
# Find what's using the port
lsof -i :3000
lsof -i :5173
lsof -i :27017

# Kill the process
kill -9 <PID>
```

### Container Issues
```bash
# Rebuild containers
docker compose -f compose.dev.yaml build --no-cache

# Or remove and recreate
docker compose -f compose.dev.yaml down
docker compose -f compose.dev.yaml up -d
```

### Permission Issues
```bash
# Fix file permissions (Linux/Mac)
sudo chown -R $USER:$USER .
```

## Benefits

- ✅ **Live Code Editing**: Changes reflect immediately
- ✅ **Consistent Environment**: Same setup across machines
- ✅ **Easy Debugging**: Access container shells and logs
- ✅ **Isolated Dependencies**: No conflicts with local Node.js
- ✅ **Production Parity**: Same base images as production

## Next Steps

1. Choose one of the setup methods above
2. Start your development environment
3. Open http://localhost:5173 in your browser
4. Start coding! Your changes will be live immediately.
