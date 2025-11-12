/**
 * Enhanced Recording Service
 * Improves recording quality and adds advanced features
 */

class RecordingEnhancer {
  /**
   * Get optimal recording settings based on browser capabilities
   */
  getOptimalSettings() {
    return {
      video: {
        width: { ideal: 1920, min: 1280 },
        height: { ideal: 1080, min: 720 },
        frameRate: { ideal: 30, min: 24 },
        facingMode: 'user',
        aspectRatio: 16/9
      },
      audio: {
        echoCancellation: true,
        noiseSuppression: true,
        autoGainControl: true,
        sampleRate: 48000,
        channelCount: 2
      }
    };
  }

  /**
   * Get enhanced MediaRecorder options
   */
  getEnhancedRecorderOptions() {
    return {
      mimeType: 'video/webm;codecs=vp9,opus', // Better codec
      videoBitsPerSecond: 5000000, // 5 Mbps for better quality
      audioBitsPerSecond: 192000, // 192 kbps audio
      bitsPerSecond: 5000000
    };
  }

  /**
   * Get fallback options if VP9 not supported
   */
  getFallbackOptions() {
    return {
      mimeType: 'video/webm;codecs=vp8,opus',
      videoBitsPerSecond: 3000000, // 3 Mbps
      audioBitsPerSecond: 128000
    };
  }

  /**
   * Check browser capabilities
   */
  checkBrowserCapabilities() {
    const capabilities = {
      mediaRecorder: typeof MediaRecorder !== 'undefined',
      webRTC: !!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia),
      vp9: false,
      vp8: false,
      h264: false
    };

    if (capabilities.mediaRecorder) {
      capabilities.vp9 = MediaRecorder.isTypeSupported('video/webm;codecs=vp9,opus');
      capabilities.vp8 = MediaRecorder.isTypeSupported('video/webm;codecs=vp8,opus');
      capabilities.h264 = MediaRecorder.isTypeSupported('video/mp4;codecs=avc1.42E01E');
    }

    return capabilities;
  }

  /**
   * Get best available recording options
   */
  getBestRecordingOptions() {
    const capabilities = this.checkBrowserCapabilities();
    
    if (capabilities.vp9) {
      return this.getEnhancedRecorderOptions();
    } else if (capabilities.vp8) {
      return this.getFallbackOptions();
    } else {
      // Basic fallback
      return {
        mimeType: 'video/webm',
        videoBitsPerSecond: 2500000,
        audioBitsPerSecond: 128000
      };
    }
  }

  /**
   * Monitor recording quality
   */
  async monitorQuality(stream) {
    const videoTrack = stream.getVideoTracks()[0];
    const audioTrack = stream.getAudioTracks()[0];
    
    const stats = {
      video: {
        width: videoTrack?.getSettings()?.width || 0,
        height: videoTrack?.getSettings()?.height || 0,
        frameRate: videoTrack?.getSettings()?.frameRate || 0
      },
      audio: {
        sampleRate: audioTrack?.getSettings()?.sampleRate || 0,
        channelCount: audioTrack?.getSettings()?.channelCount || 0
      }
    };

    return stats;
  }

  /**
   * Get recording analytics
   */
  getAnalytics(recorder, startTime) {
    return {
      duration: Date.now() - startTime,
      size: recorder?.blob?.size || 0,
      bitrate: recorder?.blob?.size ? (recorder.blob.size * 8) / ((Date.now() - startTime) / 1000) : 0
    };
  }
}

module.exports = new RecordingEnhancer();

