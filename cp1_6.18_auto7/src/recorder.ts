export interface RecordingResult {
  base64: string;
  mimeType: string;
  duration: number;
}

export class AudioRecorder {
  private mediaStream: MediaStream | null = null;
  private mediaRecorder: MediaRecorder | null = null;
  private audioChunks: Blob[] = [];
  private audioContext: AudioContext | null = null;
  private analyser: AnalyserNode | null = null;
  private dataArray: Uint8Array<ArrayBuffer> | null = null;
  private animationId: number | null = null;
  private startTime: number = 0;
  private onTimeUpdate: ((ms: number) => void) | null = null;
  private timeIntervalId: number | null = null;
  public readonly maxDurationMs: number = 30000;

  setOnTimeUpdate(cb: (ms: number) => void): void {
    this.onTimeUpdate = cb;
  }

  private async ensurePermissions(): Promise<MediaStream> {
    if (this.mediaStream) return this.mediaStream;
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      throw new Error('当前浏览器不支持录音功能');
    }
    try {
      this.mediaStream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          sampleRate: 44100,
        },
      });
      return this.mediaStream;
    } catch (e) {
      throw new Error('无法获取麦克风权限，请在浏览器设置中允许麦克风访问');
    }
  }

  private initAudioContext(): void {
    if (!this.mediaStream) return;
    if (this.audioContext) return;

    const Ctx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    this.audioContext = new Ctx();

    const source = this.audioContext.createMediaStreamSource(this.mediaStream);
    this.analyser = this.audioContext.createAnalyser();
    this.analyser.fftSize = 256;
    this.analyser.smoothingTimeConstant = 0.8;
    source.connect(this.analyser);
    this.dataArray = new Uint8Array(this.analyser.frequencyBinCount) as Uint8Array<ArrayBuffer>;
  }

  async startRecording(): Promise<void> {
    if (this.mediaRecorder && this.mediaRecorder.state === 'recording') return;

    const stream = await this.ensurePermissions();
    this.initAudioContext();

    this.audioChunks = [];

    const mimeType = this.getPreferredMimeType();
    try {
      this.mediaRecorder = new MediaRecorder(stream, mimeType ? { mimeType } : undefined);
    } catch {
      this.mediaRecorder = new MediaRecorder(stream);
    }

    this.mediaRecorder.ondataavailable = (e) => {
      if (e.data.size > 0) this.audioChunks.push(e.data);
    };

    this.mediaRecorder.start(100);
    this.startTime = Date.now();

    this.timeIntervalId = window.setInterval(() => {
      const elapsed = Date.now() - this.startTime;
      if (this.onTimeUpdate) this.onTimeUpdate(elapsed);
      if (elapsed >= this.maxDurationMs) {
        void this.stopRecording();
      }
    }, 100);
  }

  private getPreferredMimeType(): string {
    const candidates = [
      'audio/webm;codecs=opus',
      'audio/webm',
      'audio/ogg;codecs=opus',
      'audio/mp4',
    ];
    for (const type of candidates) {
      if (typeof MediaRecorder !== 'undefined' && MediaRecorder.isTypeSupported(type)) {
        return type;
      }
    }
    return '';
  }

  startWaveformDrawing(canvas: HTMLCanvasElement): void {
    this.stopWaveformDrawing();
    this.drawWaveformLoop(canvas);
  }

  stopWaveformDrawing(): void {
    if (this.animationId !== null) {
      cancelAnimationFrame(this.animationId);
      this.animationId = null;
    }
  }

  private drawWaveformLoop(canvas: HTMLCanvasElement): void {
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let prevValues: number[] = [];

    const draw = () => {
      this.resizeCanvas(canvas);

      const { width, height } = canvas;
      ctx.clearRect(0, 0, width, height);

      const data = this.dataArray;
      const analyser = this.analyser;

      if (!data || !analyser) {
        this.drawIdleWaveform(ctx, width, height);
        this.animationId = requestAnimationFrame(draw);
        return;
      }

      analyser.getByteFrequencyData(data as Uint8Array<ArrayBuffer>);

      const barCount = Math.floor(width / 4);
      const step = Math.floor(data.length / barCount);
      const gradient = ctx.createLinearGradient(0, height, 0, 0);
      gradient.addColorStop(0, '#6B4226');
      gradient.addColorStop(0.5, '#8B5A3C');
      gradient.addColorStop(1, '#8B3A3A');

      if (prevValues.length !== barCount) {
        prevValues = new Array(barCount).fill(0);
      }

      for (let i = 0; i < barCount; i++) {
        const rawValue = data[i * step] || 0;
        const normalized = Math.pow(rawValue / 255, 1.4);
        const targetHeight = Math.max(3, normalized * height * 0.95);
        const smoothed = prevValues[i] * 0.55 + targetHeight * 0.45;
        prevValues[i] = smoothed;

        const barHeight = Math.max(2, smoothed);
        const x = i * 4;
        const y = (height - barHeight) / 2;

        ctx.fillStyle = gradient;
        ctx.beginPath();
        const radius = Math.min(2, barHeight / 2);
        ctx.roundRect(x, y, 2, barHeight, radius);
        ctx.fill();
      }

      this.animationId = requestAnimationFrame(draw);
    };

    this.animationId = requestAnimationFrame(draw);
  }

  private resizeCanvas(canvas: HTMLCanvasElement): void {
    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    if (canvas.width !== rect.width * dpr || canvas.height !== rect.height * dpr) {
      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;
      const ctx = canvas.getContext('2d');
      if (ctx) ctx.scale(dpr, dpr);
    }
  }

  private drawIdleWaveform(ctx: CanvasRenderingContext2D, width: number, height: number): void {
    const barCount = Math.floor(width / 4);
    const gradient = ctx.createLinearGradient(0, height, 0, 0);
    gradient.addColorStop(0, 'rgba(107, 66, 38, 0.28)');
    gradient.addColorStop(0.5, 'rgba(139, 90, 60, 0.25)');
    gradient.addColorStop(1, 'rgba(139, 58, 58, 0.3)');

    const t = Date.now() * 0.0025;
    for (let i = 0; i < barCount; i++) {
      const phase = i * 0.18;
      const wave1 = Math.sin(phase + t) * 3;
      const wave2 = Math.sin(phase * 1.5 + t * 1.3) * 2;
      const barHeight = Math.max(2, wave1 + wave2 + 6);
      const x = i * 4;
      const y = (height - barHeight) / 2;
      ctx.fillStyle = gradient;
      ctx.beginPath();
      ctx.roundRect(x, y, 2, barHeight, 1);
      ctx.fill();
    }
  }

  async stopRecording(): Promise<RecordingResult | null> {
    if (!this.mediaRecorder || this.mediaRecorder.state === 'inactive') {
      return null;
    }

    const duration = Date.now() - this.startTime;

    if (this.timeIntervalId !== null) {
      clearInterval(this.timeIntervalId);
      this.timeIntervalId = null;
    }

    return new Promise((resolve, reject) => {
      if (!this.mediaRecorder) return resolve(null);

      this.mediaRecorder.onstop = async () => {
        try {
          if (this.audioChunks.length === 0) {
            resolve(null);
            return;
          }
          const mimeType = this.mediaRecorder?.mimeType || 'audio/webm';
          const blob = new Blob(this.audioChunks, { type: mimeType });
          const base64 = await this.blobToBase64(blob);
          this.cleanup();
          resolve({ base64, mimeType, duration });
        } catch (e) {
          reject(e);
        }
      };

      this.mediaRecorder.onerror = () => {
        this.cleanup();
        reject(new Error('录音失败，请重试'));
      };

      this.mediaRecorder.stop();
    });
  }

  private blobToBase64(blob: Blob): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  }

  cleanup(): void {
    this.stopWaveformDrawing();
    if (this.timeIntervalId !== null) {
      clearInterval(this.timeIntervalId);
      this.timeIntervalId = null;
    }
    if (this.mediaStream) {
      this.mediaStream.getTracks().forEach((t) => t.stop());
      this.mediaStream = null;
    }
    if (this.audioContext) {
      void this.audioContext.close();
      this.audioContext = null;
    }
    this.analyser = null;
    this.dataArray = null;
    this.mediaRecorder = null;
    this.audioChunks = [];
  }
}

export function startSpectrumVisualization(
  canvas: HTMLCanvasElement,
  audio: HTMLAudioElement
): () => void {
  const Ctx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
  const audioContext = new Ctx();
  const source = audioContext.createMediaElementSource(audio);
  const analyser = audioContext.createAnalyser();
  analyser.fftSize = 256;
  analyser.smoothingTimeConstant = 0.8;
  source.connect(analyser);
  analyser.connect(audioContext.destination);

  const dataArray = new Uint8Array(analyser.frequencyBinCount) as Uint8Array<ArrayBuffer>;
  let animationId: number;
  let stopped = false;

  const dpr = window.devicePixelRatio || 1;
  let prevValues: number[] = [];

  const draw = () => {
    if (stopped) return;

    const rect = canvas.getBoundingClientRect();
    if (canvas.width !== rect.width * dpr || canvas.height !== rect.height * dpr) {
      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;
      const ctx = canvas.getContext('2d');
      if (ctx) ctx.scale(dpr, dpr);
    }

    const ctx = canvas.getContext('2d');
    if (!ctx) {
      animationId = requestAnimationFrame(draw);
      return;
    }

    const width = rect.width;
    const height = rect.height;
    ctx.clearRect(0, 0, width, height);

    analyser.getByteFrequencyData(dataArray);

    const barCount = Math.floor(width / 4);
    const step = Math.floor(dataArray.length / barCount);
    const gradient = ctx.createLinearGradient(0, height, 0, 0);
    gradient.addColorStop(0, '#6B4226');
    gradient.addColorStop(0.5, '#8B5A3C');
    gradient.addColorStop(1, '#8B3A3A');

    if (prevValues.length !== barCount) {
      prevValues = new Array(barCount).fill(0);
    }

    for (let i = 0; i < barCount; i++) {
      const rawValue = dataArray[i * step] || 0;
      const normalized = Math.pow(rawValue / 255, 1.4);
      const targetHeight = Math.max(3, normalized * height * 0.95);
      const smoothed = prevValues[i] * 0.55 + targetHeight * 0.45;
      prevValues[i] = smoothed;

      const barHeight = Math.max(2, smoothed);
      const x = i * 4;
      const y = (height - barHeight) / 2;
      ctx.fillStyle = gradient;
      ctx.beginPath();
      const radius = Math.min(2, barHeight / 2);
      ctx.roundRect(x, y, 2, barHeight, radius);
      ctx.fill();
    }

    animationId = requestAnimationFrame(draw);
  };

  draw();

  return () => {
    stopped = true;
    cancelAnimationFrame(animationId);
    void audioContext.close();
  };
}
