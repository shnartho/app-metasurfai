# MetaSurf AI Project Makefile
# Make commands for easy project management

.PHONY: help install start build clean dev serve

# Default target
help:
	@echo "Available commands:"
	@echo "  make install    - Install dependencies"
	@echo "  make start      - Start development server"
	@echo "  make dev        - Alias for start"
	@echo "  make serve      - Alias for start"
	@echo "  make build      - Build for production"
	@echo "  make clean      - Clean node_modules and package-lock.json"
	@echo "  make help       - Show this help message"

# Install dependencies
install:
	@echo "Installing dependencies..."
	npm install

# Start development server
start:
	@echo "Starting development server..."
	npm start

# Alias for start
dev: start

# Alias for start
serve: start

# Build for production
build:
	@echo "Building for production..."
	npm run build

# Clean dependencies and lock file
clean:
	@echo "Cleaning project..."
	@if exist node_modules rmdir /s /q node_modules
	@if exist package-lock.json del package-lock.json
	@echo "Cleaned node_modules and package-lock.json"

# Install and start in one command
setup: install start