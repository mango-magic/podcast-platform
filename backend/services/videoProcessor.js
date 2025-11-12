const { exec } = require('child_process');
const { promisify } = require('util');
const path = require('path');
const fs = require('fs').promises;
const axios = require('axios');
const { uploadFile } = require('./storage');

const execAsync = promisify(exec);

/**
 * Video Processing Service using FFmpeg (Open Source)
 * Handles clip generation, format conversion, and video processing
 */

class VideoProcessor {
  /**
   * Generate clip from episode video
   * @param {string} inputVideoUrl - URL to source video
   * @param {number} startTime - Start time in seconds
   * @param {number} duration - Duration in seconds
   * @param {string} platform - Target platform (tiktok, instagram, linkedin, youtube, twitter, general)
   * @returns {Promise<{videoUrl: string, audioUrl: string, thumbnailUrl: string}>}
   */
  async generateClip(inputVideoUrl, startTime, duration, platform = 'general') {
    try {
      // Download source video temporarily
      const tempInputPath = await this.downloadVideo(inputVideoUrl);
      
      // Get platform-specific settings
      const settings = this.getPlatformSettings(platform);
      
      // Generate clip with FFmpeg
      const tempOutputPath = path.join('/tmp', `clip-${Date.now()}-${Math.random().toString(36).substr(2, 9)}.mp4`);
      
      // Build FFmpeg command
      const ffmpegCommand = this.buildFFmpegCommand(
        tempInputPath,
        tempOutputPath,
        startTime,
        duration,
        settings
      );
      
      // Execute FFmpeg
      await execAsync(ffmpegCommand);
      
      // Generate thumbnail
      const thumbnailPath = await this.generateThumbnail(tempOutputPath, startTime);
      
      // Upload processed files
      const videoBuffer = await fs.readFile(tempOutputPath);
      const thumbnailBuffer = await fs.readFile(thumbnailPath);
      
      // Upload to storage
      const videoFile = {
        buffer: videoBuffer,
        originalname: `clip-${Date.now()}.mp4`,
        mimetype: 'video/mp4',
        size: videoBuffer.length
      };
      
      const thumbnailFile = {
        buffer: thumbnailBuffer,
        originalname: `thumbnail-${Date.now()}.jpg`,
        mimetype: 'image/jpeg',
        size: thumbnailBuffer.length
      };
      
      const videoResult = await uploadFile(videoFile, 'clips');
      const thumbnailResult = await uploadFile(thumbnailFile, 'thumbnails');
      
      // Extract audio if needed
      let audioUrl = null;
      if (settings.extractAudio) {
        const audioPath = await this.extractAudio(tempOutputPath);
        const audioBuffer = await fs.readFile(audioPath);
        const audioFile = {
          buffer: audioBuffer,
          originalname: `clip-audio-${Date.now()}.mp3`,
          mimetype: 'audio/mpeg',
          size: audioBuffer.length
        };
        const audioResult = await uploadFile(audioFile, 'clips');
        audioUrl = audioResult.url;
        
        // Cleanup
        await fs.unlink(audioPath);
      }
      
      // Cleanup temp files
      await fs.unlink(tempInputPath);
      await fs.unlink(tempOutputPath);
      await fs.unlink(thumbnailPath);
      
      return {
        videoUrl: videoResult.url,
        audioUrl: audioUrl,
        thumbnailUrl: thumbnailResult.url,
        duration: duration,
        format: settings.format
      };
    } catch (error) {
      console.error('Error generating clip:', error);
      throw new Error(`Failed to generate clip: ${error.message}`);
    }
  }

  /**
   * Build FFmpeg command for clip generation
   */
  buildFFmpegCommand(inputPath, outputPath, startTime, duration, settings) {
    const parts = [
      'ffmpeg',
      '-y', // Overwrite output file
      '-ss', startTime.toString(), // Start time
      '-i', inputPath, // Input file
      '-t', duration.toString(), // Duration
      '-c:v', settings.videoCodec, // Video codec
      '-c:a', settings.audioCodec, // Audio codec
      '-b:v', settings.videoBitrate, // Video bitrate
      '-b:a', settings.audioBitrate, // Audio bitrate
      '-vf', `scale=${settings.width}:${settings.height}:force_original_aspect_ratio=decrease,pad=${settings.width}:${settings.height}:(ow-iw)/2:(oh-ih)/2`, // Video filter
      '-r', settings.fps.toString(), // Frame rate
      '-preset', 'fast', // Encoding preset
      '-movflags', '+faststart', // Fast start for web playback
      outputPath
    ];
    
    return parts.join(' ');
  }

  /**
   * Get platform-specific video settings
   */
  getPlatformSettings(platform) {
    const settings = {
      general: {
        width: 1920,
        height: 1080,
        fps: 30,
        videoCodec: 'libx264',
        audioCodec: 'aac',
        videoBitrate: '5000k',
        audioBitrate: '192k',
        format: 'mp4',
        extractAudio: false
      },
      tiktok: {
        width: 1080,
        height: 1920, // 9:16 vertical
        fps: 30,
        videoCodec: 'libx264',
        audioCodec: 'aac',
        videoBitrate: '8000k',
        audioBitrate: '192k',
        format: 'mp4',
        extractAudio: false
      },
      instagram: {
        width: 1080,
        height: 1920, // 9:16 vertical
        fps: 30,
        videoCodec: 'libx264',
        audioCodec: 'aac',
        videoBitrate: '8000k',
        audioBitrate: '192k',
        format: 'mp4',
        extractAudio: false
      },
      linkedin: {
        width: 1920,
        height: 1080, // 16:9 horizontal
        fps: 30,
        videoCodec: 'libx264',
        audioCodec: 'aac',
        videoBitrate: '5000k',
        audioBitrate: '192k',
        format: 'mp4',
        extractAudio: false
      },
      youtube: {
        width: 1920,
        height: 1080, // 16:9 horizontal
        fps: 30,
        videoCodec: 'libx264',
        audioCodec: 'aac',
        videoBitrate: '8000k',
        audioBitrate: '256k',
        format: 'mp4',
        extractAudio: false
      },
      twitter: {
        width: 1280,
        height: 720, // 16:9 horizontal
        fps: 30,
        videoCodec: 'libx264',
        audioCodec: 'aac',
        videoBitrate: '5000k',
        audioBitrate: '192k',
        format: 'mp4',
        extractAudio: false
      }
    };
    
    return settings[platform] || settings.general;
  }

  /**
   * Generate thumbnail from video
   */
  async generateThumbnail(videoPath, timeOffset = 0) {
    const thumbnailPath = path.join('/tmp', `thumb-${Date.now()}.jpg`);
    const command = `ffmpeg -y -ss ${timeOffset} -i "${videoPath}" -vframes 1 -vf "scale=1280:720:force_original_aspect_ratio=decrease" "${thumbnailPath}"`;
    
    await execAsync(command);
    return thumbnailPath;
  }

  /**
   * Extract audio from video
   */
  async extractAudio(videoPath) {
    const audioPath = path.join('/tmp', `audio-${Date.now()}.mp3`);
    const command = `ffmpeg -y -i "${videoPath}" -vn -acodec libmp3lame -ab 192k "${audioPath}"`;
    
    await execAsync(command);
    return audioPath;
  }

  /**
   * Download video from URL
   */
  async downloadVideo(videoUrl) {
    const tempPath = path.join('/tmp', `input-${Date.now()}-${Math.random().toString(36).substr(2, 9)}.mp4`);
    
    try {
      // Download using axios for better error handling
      const response = await axios({
        url: videoUrl,
        method: 'GET',
        responseType: 'stream',
        timeout: 300000 // 5 minute timeout
      });
      
      const writer = require('fs').createWriteStream(tempPath);
      response.data.pipe(writer);
      
      return new Promise((resolve, reject) => {
        writer.on('finish', () => resolve(tempPath));
        writer.on('error', reject);
      });
    } catch (error) {
      // Fallback to curl if axios fails
      const command = `curl -L --max-time 300 "${videoUrl}" -o "${tempPath}"`;
      await execAsync(command);
      return tempPath;
    }
  }

  /**
   * Get video information
   */
  async getVideoInfo(videoUrl) {
    try {
      const tempPath = await this.downloadVideo(videoUrl);
      const command = `ffprobe -v quiet -print_format json -show_format -show_streams "${tempPath}"`;
      const { stdout } = await execAsync(command);
      const info = JSON.parse(stdout);
      
      await fs.unlink(tempPath);
      
      return {
        duration: parseFloat(info.format.duration),
        width: info.streams.find(s => s.codec_type === 'video')?.width,
        height: info.streams.find(s => s.codec_type === 'video')?.height,
        fps: eval(info.streams.find(s => s.codec_type === 'video')?.r_frame_rate),
        bitrate: parseInt(info.format.bit_rate),
        size: parseInt(info.format.size)
      };
    } catch (error) {
      console.error('Error getting video info:', error);
      throw error;
    }
  }

  /**
   * Generate multiple clips automatically (for auto-detection)
   */
  async generateMultipleClips(videoUrl, clipSegments) {
    const results = [];
    
    for (const segment of clipSegments) {
      try {
        const result = await this.generateClip(
          videoUrl,
          segment.startTime,
          segment.duration,
          segment.platform || 'general'
        );
        results.push({
          ...result,
          title: segment.title,
          startTime: segment.startTime,
          duration: segment.duration,
          platform: segment.platform
        });
      } catch (error) {
        console.error(`Error generating clip for segment ${segment.startTime}:`, error);
      }
    }
    
    return results;
  }
}

module.exports = new VideoProcessor();

