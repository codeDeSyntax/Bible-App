/**
 * Microphone Audio Capture & Resampling Service
 * Captures user microphone, downsamples to 16kHz linear PCM (Mono, 16-bit Int),
 * and streams chunks over Electron IPC to AssemblyAI.
 */

export type VolumeCallback = (level: number) => void;

class MicAudioStreamer {
  private audioContext: AudioContext | null = null;
  private mediaStream: MediaStream | null = null;
  private scriptProcessor: ScriptProcessorNode | null = null;
  private sourceNode: MediaStreamAudioSourceNode | null = null;
  private isCapturing: boolean = false;
  private volumeCallback: VolumeCallback | null = null;

  /**
   * Start microphone audio capture and streaming
   */
  public async start(onVolumeChange?: VolumeCallback): Promise<{ success: boolean; error?: string }> {
    if (this.isCapturing) {
      return { success: true };
    }

    this.volumeCallback = onVolumeChange || null;

    try {
      this.mediaStream = await navigator.mediaDevices.getUserMedia({
        audio: {
          channelCount: 1,
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        },
      });

      // Target sample rate for AssemblyAI is 16,000 Hz
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      this.audioContext = new AudioCtx({ sampleRate: 16000 });

      // If browser forced a different sample rate, warn and handle
      const contextSampleRate = this.audioContext.sampleRate;

      this.sourceNode = this.audioContext.createMediaStreamSource(this.mediaStream);

      // Buffer size: 4096 gives ~256ms chunk duration at 16kHz
      this.scriptProcessor = this.audioContext.createScriptProcessor(4096, 1, 1);

      this.scriptProcessor.onaudioprocess = (event: AudioProcessingEvent) => {
        if (!this.isCapturing) return;

        const inputData = event.inputBuffer.getChannelData(0);

        // 1. Calculate volume level (RMS) for visualizer
        let sumSquares = 0;
        for (let i = 0; i < inputData.length; i++) {
          sumSquares += inputData[i] * inputData[i];
        }
        const rms = Math.sqrt(sumSquares / inputData.length);
        const normalizedVolume = Math.min(1, Math.max(0, rms * 5)); // amplify for UI visualizer
        if (this.volumeCallback) {
          this.volumeCallback(normalizedVolume);
        }

        // 2. Downsample to 16kHz if needed, and convert Float32 [-1, 1] to Int16 PCM
        const pcmBuffer = this.convertFloat32ToInt16(inputData, contextSampleRate, 16000);

        // 3. Send over IPC to Electron main process
        if (window.api && window.api.sendAudioChunk) {
          window.api.sendAudioChunk(pcmBuffer);
        }
      };

      this.sourceNode.connect(this.scriptProcessor);
      this.scriptProcessor.connect(this.audioContext.destination);

      this.isCapturing = true;
      return { success: true };
    } catch (err: any) {
      console.error("Failed to start mic capture:", err);
      this.stop();
      return {
        success: false,
        error: err?.message || "Failed to access microphone. Please grant permission.",
      };
    }
  }

  /**
   * Convert Float32Array to 16-bit linear PCM with optional downsampling
   */
  private convertFloat32ToInt16(
    buffer: Float32Array,
    fromSampleRate: number,
    toSampleRate: number,
  ): Uint8Array {
    let samples: Float32Array;

    if (fromSampleRate === toSampleRate) {
      samples = buffer;
    } else {
      // Linear interpolation downsampling
      const ratio = fromSampleRate / toSampleRate;
      const newLength = Math.round(buffer.length / ratio);
      samples = new Float32Array(newLength);
      for (let i = 0; i < newLength; i++) {
        const originIndex = i * ratio;
        const indexLow = Math.floor(originIndex);
        const indexHigh = Math.min(indexLow + 1, buffer.length - 1);
        const weight = originIndex - indexLow;
        samples[i] = buffer[indexLow] * (1 - weight) + buffer[indexHigh] * weight;
      }
    }

    // Convert Float32 to 16-bit signed integer PCM
    const pcm16 = new Int16Array(samples.length);
    for (let i = 0; i < samples.length; i++) {
      const s = Math.max(-1, Math.min(1, samples[i]));
      pcm16[i] = s < 0 ? s * 0x8000 : s * 0x7fff;
    }

    return new Uint8Array(pcm16.buffer);
  }

  /**
   * Stop microphone capture
   */
  public stop() {
    this.isCapturing = false;

    if (this.scriptProcessor) {
      this.scriptProcessor.disconnect();
      this.scriptProcessor = null;
    }

    if (this.sourceNode) {
      this.sourceNode.disconnect();
      this.sourceNode = null;
    }

    if (this.audioContext) {
      if (this.audioContext.state !== "closed") {
        this.audioContext.close().catch(() => {});
      }
      this.audioContext = null;
    }

    if (this.mediaStream) {
      this.mediaStream.getTracks().forEach((track) => track.stop());
      this.mediaStream = null;
    }

    if (this.volumeCallback) {
      this.volumeCallback(0);
      this.volumeCallback = null;
    }
  }

  public getIsCapturing(): boolean {
    return this.isCapturing;
  }
}

export const micAudioStreamer = new MicAudioStreamer();
