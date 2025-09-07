# Docker Development Setup

This guide explains how to work directly with Docker source code for development with live reloading.

## Quick Start

1. **Start development environment:**
   ```bash
   ./dev-docker.sh start
   ```

2. **Access your application:**
   - Frontend: http://localhost:5173
   - Backend API: http://localhost:3000
   - MongoDB: localhost:27017

3. **Make changes to your code** - they will be reflected immediately without rebuilding!

## Available Commands

Use the `./dev-docker.sh` script for easy management:

```bash
# Start development environment
./dev-docker.sh start

# Stop development environment
./dev-docker.sh stop

# Restart services
./dev-docker.sh restart

# View logs
./dev-docker.sh logs                    # All services
./dev-docker.sh logs-backend           # Backend only
./dev-docker.sh logs-frontend          # Frontend only
./dev-docker.sh logs-mongo             # MongoDB only

# Access container shells
./dev-docker.sh shell-backend          # Backend container
./dev-docker.sh shell-frontend         # Frontend container
./dev-docker.sh shell-mongo            # MongoDB shell

# Other commands
./dev-docker.sh status                 # Show service status
./dev-docker.sh build                  # Rebuild images
./dev-docker.sh clean                  # Clean up everything
./dev-docker.sh help                   # Show help
```

## How It Works

### Development vs Production

- **Development** (`compose.dev.yaml`): 
  - Source code is mounted as volumes
  - Hot reloading enabled
  - Separate containers for frontend and backend
  - Development dependencies included

- **Production** (`compose.yaml`):
  - Source code is built into images
  - Single container serves both frontend and backend
  - Optimized for production

### Volume Mounts

The development setup mounts your local source code into the containers:

```yaml
volumes:
  - ./ClientConnect:/app  # Frontend source code
  - ./ServerConnect:/app  # Backend source code
  - /app/node_modules     # Preserve container's node_modules
```

This means:
- ✅ Changes to your code are immediately reflected
- ✅ No need to rebuild containers for code changes
- ✅ Full debugging capabilities
- ✅ Hot reloading works perfectly

### Port Mapping

- **Frontend**: 5173 (Vite dev server)
- **Backend**: 3000 (Express server)
- **MongoDB**: 27017 (Database)

## Development Workflow

1. **Start the environment:**
   ```bash
   ./dev-docker.sh start
   ```

2. **Edit your code** in your favorite editor:
   - Frontend changes in `ClientConnect/src/`
   - Backend changes in `ServerConnect/`

3. **See changes immediately** - no rebuild needed!

4. **Debug if needed:**
   ```bash
   ./dev-docker.sh logs-backend    # Check backend logs
   ./dev-docker.sh shell-backend   # Debug in container
   ```

5. **Stop when done:**
   ```bash
   ./dev-docker.sh stop
   ```

## Troubleshooting

### Port Already in Use
If you get port conflicts, stop any local development servers:
```bash
# Stop local Node.js processes
pkill -f "node.*dev"
pkill -f "vite"

# Or change ports in compose.dev.yaml
```

### Container Issues
```bash
# Rebuild containers
./dev-docker.sh build

# Clean everything and start fresh
./dev-docker.sh clean
./dev-docker.sh start
```

### Database Issues
```bash
# Reset MongoDB data
./dev-docker.sh stop
docker volume rm taskmgr-mongo-data-dev
./dev-docker.sh start
```

### Permission Issues (Linux/Mac)
```bash
# Fix file permissions
sudo chown -R $USER:$USER .
```

## Environment Variables

The development environment uses these default settings:

- **MongoDB**: `mongodb://root:devpass@mongo:27017/taskmgr?authSource=admin`
- **Backend Port**: 3000
- **Frontend Port**: 5173
- **Node Environment**: development

To customize, edit the `environment` section in `compose.dev.yaml`.

## File Structure

```
task-manager/
├── compose.yaml          # Production Docker Compose
├── compose.dev.yaml      # Development Docker Compose
├── Dockerfile            # Production Dockerfile
├── Dockerfile.dev        # Development Dockerfile
├── dev-docker.sh         # Development helper script
├── ClientConnect/        # Frontend source (mounted in dev)
├── ServerConnect/        # Backend source (mounted in dev)
└── DOCKER_DEV_README.md  # This file
```

## Benefits of This Setup

1. **Live Code Editing**: Changes reflect immediately
2. **Consistent Environment**: Same setup across all machines
3. **Easy Debugging**: Access container shells and logs
4. **Isolated Dependencies**: No conflicts with local Node.js versions
5. **Production Parity**: Same base images as production
6. **Team Collaboration**: Everyone uses the same Docker setup

## Next Steps

1. Start the development environment: `./dev-docker.sh start`
2. Open http://localhost:5173 in your browser
3. Start coding! Your changes will be live immediately.
4. Use `./dev-docker.sh logs` to monitor your application
5. When ready for production, use `docker-compose up` with the production config
