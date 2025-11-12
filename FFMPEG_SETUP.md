# FFmpeg Setup Guide

## Overview

We're using **FFmpeg** (open source) for video clip generation. FFmpeg is the industry-standard tool for video processing.

## Installation

### On Render (Production)

Add this to your `render.yaml` or build script:

```bash
# Install FFmpeg during build
apt-get update && apt-get install -y ffmpeg
```

Or add to your Dockerfile:
```dockerfile
RUN apt-get update && apt-get install -y ffmpeg
```

### Local Development (macOS)

```bash
brew install ffmpeg
```

### Local Development (Linux/Ubuntu)

```bash
sudo apt-get update
sudo apt-get install -y ffmpeg
```

### Local Development (Windows)

Download from: https://ffmpeg.org/download.html
Or use Chocolatey: `choco install ffmpeg`

## Verify Installation

```bash
ffmpeg -version
ffprobe -version
```

## Features Enabled

✅ **Clip Generation** - Cut videos from episodes
✅ **Format Conversion** - Convert to platform-specific formats
✅ **Thumbnail Generation** - Auto-generate thumbnails
✅ **Audio Extraction** - Extract audio tracks
✅ **Quality Optimization** - Platform-specific bitrates and resolutions

## Platform-Specific Formats

- **TikTok/Instagram**: 1080x1920 (9:16 vertical), 8 Mbps
- **LinkedIn/YouTube**: 1920x1080 (16:9 horizontal), 5-8 Mbps
- **Twitter**: 1280x720 (16:9), 5 Mbps

## API Endpoints

- `POST /api/clips` - Create clip (auto-generates with FFmpeg)
- `POST /api/clips/generate` - Generate clip directly

## Testing

Test clip generation:
```bash
curl -X POST http://localhost:3000/api/clips/generate \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "episodeId": 1,
    "startTime": 10,
    "duration": 30,
    "platform": "tiktok"
  }'
```

## Troubleshooting

**Error: FFmpeg not found**
- Ensure FFmpeg is installed and in PATH
- Check `which ffmpeg` returns a path

**Error: Video download failed**
- Check video URL is accessible
- Verify network connectivity
- Check file size limits

**Error: Processing timeout**
- Increase timeout in videoProcessor.js
- Check server resources
- Optimize FFmpeg commands

## Performance

- Clip generation: ~2-5 seconds per clip
- Thumbnail generation: ~1 second
- Format conversion: ~5-10 seconds

## Resources

- FFmpeg Docs: https://ffmpeg.org/documentation.html
- FFmpeg Wiki: https://trac.ffmpeg.org/wiki

