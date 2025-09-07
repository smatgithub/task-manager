#!/bin/bash

# Development Docker Helper Script
# This script helps you work with Docker for development

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Function to show help
show_help() {
    echo "Docker Development Helper Script"
    echo ""
    echo "Usage: ./dev-docker.sh [COMMAND]"
    echo ""
    echo "Commands:"
    echo "  start     - Start development environment"
    echo "  stop      - Stop development environment"
    echo "  restart   - Restart development environment"
    echo "  logs      - Show logs from all services"
    echo "  logs-backend - Show backend logs only"
    echo "  logs-frontend - Show frontend logs only"
    echo "  logs-mongo - Show MongoDB logs only"
    echo "  shell-backend - Open shell in backend container"
    echo "  shell-frontend - Open shell in frontend container"
    echo "  shell-mongo - Open MongoDB shell"
    echo "  clean     - Clean up containers and volumes"
    echo "  build     - Build development images"
    echo "  status    - Show status of all services"
    echo "  help      - Show this help message"
}

# Function to start development environment
start_dev() {
    print_status "Starting development environment..."
    
    # Try docker compose (newer) first, then docker-compose (legacy)
    if command -v docker >/dev/null 2>&1 && docker compose version >/dev/null 2>&1; then
        docker compose -f compose.dev.yaml up -d
    elif command -v docker-compose >/dev/null 2>&1; then
        docker-compose -f compose.dev.yaml up -d
    else
        print_error "Docker Compose not found. Please install Docker Desktop or docker-compose."
        print_status "You can also run the commands manually:"
        echo "  docker compose -f compose.dev.yaml up -d"
        exit 1
    fi
    
    print_success "Development environment started!"
    print_status "Services available at:"
    echo "  - Frontend: http://localhost:5173"
    echo "  - Backend API: http://localhost:3000"
    echo "  - MongoDB: localhost:27017"
}

# Function to stop development environment
stop_dev() {
    print_status "Stopping development environment..."
    if command -v docker >/dev/null 2>&1 && docker compose version >/dev/null 2>&1; then
        docker compose -f compose.dev.yaml down
    elif command -v docker-compose >/dev/null 2>&1; then
        docker-compose -f compose.dev.yaml down
    else
        print_error "Docker Compose not found."
        exit 1
    fi
    print_success "Development environment stopped!"
}

# Function to restart development environment
restart_dev() {
    print_status "Restarting development environment..."
    docker-compose -f compose.dev.yaml restart
    print_success "Development environment restarted!"
}

# Function to show logs
show_logs() {
    local service=$1
    if [ -z "$service" ]; then
        docker-compose -f compose.dev.yaml logs -f
    else
        docker-compose -f compose.dev.yaml logs -f "$service"
    fi
}

# Function to open shell in container
open_shell() {
    local service=$1
    if [ -z "$service" ]; then
        print_error "Please specify a service (backend, frontend, or mongo)"
        exit 1
    fi
    
    case $service in
        "backend")
            print_status "Opening shell in backend container..."
            docker exec -it taskmgr-backend-dev sh
            ;;
        "frontend")
            print_status "Opening shell in frontend container..."
            docker exec -it taskmgr-frontend-dev sh
            ;;
        "mongo")
            print_status "Opening MongoDB shell..."
            docker exec -it taskmgr-mongo-dev mongosh
            ;;
        *)
            print_error "Invalid service. Use: backend, frontend, or mongo"
            exit 1
            ;;
    esac
}

# Function to clean up
clean_up() {
    print_warning "This will remove all containers and volumes. Are you sure? (y/N)"
    read -r response
    if [[ "$response" =~ ^[Yy]$ ]]; then
        print_status "Cleaning up..."
        docker-compose -f compose.dev.yaml down -v
        docker system prune -f
        print_success "Cleanup completed!"
    else
        print_status "Cleanup cancelled."
    fi
}

# Function to build images
build_images() {
    print_status "Building development images..."
    docker-compose -f compose.dev.yaml build
    print_success "Images built successfully!"
}

# Function to show status
show_status() {
    print_status "Development environment status:"
    docker-compose -f compose.dev.yaml ps
}

# Main script logic
case "${1:-help}" in
    "start")
        start_dev
        ;;
    "stop")
        stop_dev
        ;;
    "restart")
        restart_dev
        ;;
    "logs")
        show_logs
        ;;
    "logs-backend")
        show_logs "backend"
        ;;
    "logs-frontend")
        show_logs "frontend"
        ;;
    "logs-mongo")
        show_logs "mongo"
        ;;
    "shell-backend")
        open_shell "backend"
        ;;
    "shell-frontend")
        open_shell "frontend"
        ;;
    "shell-mongo")
        open_shell "mongo"
        ;;
    "clean")
        clean_up
        ;;
    "build")
        build_images
        ;;
    "status")
        show_status
        ;;
    "help"|*)
        show_help
        ;;
esac
