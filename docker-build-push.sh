#!/bin/bash
set -e

# Docker Build and Push Script for DigiDefiance
# This script builds and pushes the MCP Debugger Server Docker image

VERSION="1.1.6"
IMAGE_NAME="digidefiance/mcp-debugger-server"

echo "🐳 Building Docker image for DigiDefiance..."
echo "Version: $VERSION"
echo "Image: $IMAGE_NAME"
echo ""

# Build the image
echo "📦 Building Docker image..."
docker build \
  -f packages/mcp-debugger-server/Dockerfile \
  -t ${IMAGE_NAME}:latest \
  -t ${IMAGE_NAME}:${VERSION} \
  -t ${IMAGE_NAME}:v${VERSION} \
  .

echo ""
echo "✅ Build complete!"
echo ""

# Test the image
echo "🧪 Testing Docker image..."
docker run --rm ${IMAGE_NAME}:latest --version || echo "Note: Version check may not be available"

echo ""
echo "📋 Image details:"
docker images ${IMAGE_NAME}

echo ""
echo "🚀 Ready to push to Docker Hub!"
echo ""
echo "To push the image, run:"
echo "  docker login"
echo "  docker push ${IMAGE_NAME}:latest"
echo "  docker push ${IMAGE_NAME}:${VERSION}"
echo "  docker push ${IMAGE_NAME}:v${VERSION}"
echo ""
echo "Or run this script with --push flag:"
echo "  ./docker-build-push.sh --push"

# Check if --push flag is provided
if [ "$1" == "--push" ]; then
  echo ""
  echo "🔐 Logging into Docker Hub..."
  docker login
  
  echo ""
  echo "📤 Pushing images to Docker Hub..."
  docker push ${IMAGE_NAME}:latest
  docker push ${IMAGE_NAME}:${VERSION}
  docker push ${IMAGE_NAME}:v${VERSION}
  
  echo ""
  echo "✅ Successfully pushed all tags!"
  echo ""
  echo "Images available at:"
  echo "  - docker pull ${IMAGE_NAME}:latest"
  echo "  - docker pull ${IMAGE_NAME}:${VERSION}"
  echo "  - docker pull ${IMAGE_NAME}:v${VERSION}"
fi
