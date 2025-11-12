#!/bin/bash

# Dependency Check Script
# Verifies all required dependencies are installed

set -e

echo "🔍 Checking dependencies..."

ERRORS=0

# Check Node.js
if command -v node &> /dev/null; then
    NODE_VERSION=$(node -v)
    echo "✅ Node.js: $NODE_VERSION"
else
    echo "❌ Node.js not found"
    ERRORS=$((ERRORS + 1))
fi

# Check npm
if command -v npm &> /dev/null; then
    NPM_VERSION=$(npm -v)
    echo "✅ npm: $NPM_VERSION"
else
    echo "❌ npm not found"
    ERRORS=$((ERRORS + 1))
fi

# Check FFmpeg
if command -v ffmpeg &> /dev/null; then
    FFMPEG_VERSION=$(ffmpeg -version | head -n 1)
    echo "✅ FFmpeg: $FFMPEG_VERSION"
else
    echo "❌ FFmpeg not found - Run: ./scripts/setup-ffmpeg.sh"
    ERRORS=$((ERRORS + 1))
fi

# Check FFprobe
if command -v ffprobe &> /dev/null; then
    FFPROBE_VERSION=$(ffprobe -version | head -n 1)
    echo "✅ FFprobe: $FFPROBE_VERSION"
else
    echo "⚠️  FFprobe not found (may be included with FFmpeg)"
fi

# Check curl
if command -v curl &> /dev/null; then
    CURL_VERSION=$(curl --version | head -n 1)
    echo "✅ curl: $CURL_VERSION"
else
    echo "⚠️  curl not found (recommended for video downloads)"
fi

echo ""
if [ $ERRORS -eq 0 ]; then
    echo "✅ All critical dependencies are installed!"
    exit 0
else
    echo "❌ $ERRORS critical dependency(ies) missing"
    exit 1
fi

