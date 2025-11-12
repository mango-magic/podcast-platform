#!/bin/bash

# FFmpeg Setup Script
# Installs FFmpeg on various platforms

set -e

echo "🎬 Setting up FFmpeg for video processing..."

# Detect OS
if [[ "$OSTYPE" == "linux-gnu"* ]]; then
    # Linux
    if command -v apt-get &> /dev/null; then
        echo "📦 Installing FFmpeg via apt-get (Ubuntu/Debian)..."
        sudo apt-get update
        sudo apt-get install -y ffmpeg ffprobe curl
    elif command -v yum &> /dev/null; then
        echo "📦 Installing FFmpeg via yum (CentOS/RHEL)..."
        sudo yum install -y ffmpeg ffmpeg-devel curl
    elif command -v pacman &> /dev/null; then
        echo "📦 Installing FFmpeg via pacman (Arch)..."
        sudo pacman -S --noconfirm ffmpeg curl
    else
        echo "❌ Package manager not found. Please install FFmpeg manually."
        exit 1
    fi
elif [[ "$OSTYPE" == "darwin"* ]]; then
    # macOS
    if command -v brew &> /dev/null; then
        echo "📦 Installing FFmpeg via Homebrew (macOS)..."
        brew install ffmpeg
    else
        echo "❌ Homebrew not found. Install Homebrew first: https://brew.sh"
        exit 1
    fi
elif [[ "$OSTYPE" == "msys" || "$OSTYPE" == "win32" ]]; then
    # Windows
    echo "📦 Windows detected. Please install FFmpeg manually:"
    echo "   1. Download from: https://ffmpeg.org/download.html"
    echo "   2. Or use Chocolatey: choco install ffmpeg"
    exit 1
else
    echo "❌ Unknown OS. Please install FFmpeg manually."
    exit 1
fi

# Verify installation
echo ""
echo "✅ Verifying FFmpeg installation..."
if command -v ffmpeg &> /dev/null; then
    ffmpeg -version | head -n 1
    echo "✅ FFmpeg installed successfully!"
else
    echo "❌ FFmpeg installation failed!"
    exit 1
fi

if command -v ffprobe &> /dev/null; then
    ffprobe -version | head -n 1
    echo "✅ FFprobe installed successfully!"
else
    echo "⚠️  FFprobe not found (may be included with FFmpeg)"
fi

echo ""
echo "🎉 FFmpeg setup complete! Video processing is ready."

