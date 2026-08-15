DOCKER := docker

.PHONY: help install dev build lint preview clean image-build upload

# Default target
.DEFAULT_GOAL := help

help: ## Display available commands
	@echo "MTVL Frontend Makefile"
	@echo "======================"
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | awk 'BEGIN {FS = ":.*?## "}; {printf "\033[36m%-15s\033[0m %s\n", $$1, $$2}'

install: ## Install npm dependencies
	npm install

dev: ## Start Vite development server
	npm run dev

build: ## Type-check code and build production bundle
	npm run build

lint: ## Run TypeScript compiler type-check
	npm run lint

preview: ## Preview the production build locally
	npm run preview

clean: ## Remove build artifacts and node_modules
	rm -rf dist node_modules

image-build:
	$(DOCKER) buildx build \
		--file docker/Dockerfile \
		--tag $(REGISTRY)/$(IMAGE):$(VERSION) \
		--tag $(REGISTRY)/$(IMAGE):latest \
		--target deploy .

upload:
	$(DOCKER) buildx build \
		--file docker/Dockerfile \
		--push \
		--platform linux/amd64,linux/arm64 \
		--tag $(REGISTRY)/$(IMAGE):$(VERSION) \
		--tag $(REGISTRY)/$(IMAGE):latest \
		--target deploy .