import { useState, useRef, useEffect } from 'react';
import './CardModal.css';

type TabType = 'text' | 'image' | 'audio';

interface CardModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: any) => void;
}

const CardModal = ({ open, onClose, onSubmit }: CardModalProps) => {
  const [tab, setTab] = useState<TabType>('text');

  const [textContent, setTextContent] = useState('');
  const textRef = useRef<HTMLTextAreaElement>(null);

  const [imageUrls, setImageUrls] = useState<string[]>([]);
  const [imageInput, setImageInput] = useState('');

  const [isRecording, setIsRecording] = useState(false);
  const [recordedBlob, setRecordedBlob] = useState<Blob | null>(null);
  const [recordedUrl, setRecordedUrl] = useState<string>('');
  const [waveform, setWaveform] = useState<number[]>(new Array(60).fill(0.1));
  const [recordSeconds, setRecordSeconds] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const animationRef = useRef<number>(0);
  const timerRef = useRef<number>(0);
  const audioElRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    if (!open) {
      resetAll();
    }
  }, [open]);

  const resetAll = () => {
    setTab('text');
    setTextContent('');
    setImageUrls([]);
    setImageInput('');
    setIsRecording(false);
    setRecordedBlob(null);
    setRecordedUrl('');
    setWaveform(new Array(60).fill(0.1));
    setRecordSeconds(0);
    setIsPlaying(false);
    stopRecordingVisuals();
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      try { mediaRecorderRef.current.stop(); } catch {}
    }
  };

  const stopRecordingVisuals = () => {
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
      animationRef.current = 0;
    }
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = 0;
    }
  };

  const handleFormat = (tag: 'b' | 'i' | 'u') => {
    const el = textRef.current;
    if (!el) return;
    const start = el.selectionStart;
    const end = el.selectionEnd;
    const value = el.value;
    const selected = value.slice(start, end);
    if (!selected) return;
    const wrapMap: Record<string, [string, string]> = {
      b: ['<b>', '</b>'],
      i: ['<i>', '</i>'],
      u: ['<u>', '</u>'],
    };
    const [pre, post] = wrapMap[tag];
    const next = value.slice(0, start) + pre + selected + post + value.slice(end);
    setTextContent(next);
    requestAnimationFrame(() => {
      el.focus();
      el.setSelectionRange(start + pre.length, end + pre.length);
    });
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'b') {
      e.preventDefault();
      handleFormat('b');
    } else if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'i') {
      e.preventDefault();
      handleFormat('i');
    } else if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'u') {
      e.preventDefault();
      handleFormat('u');
    }
  };

  const addImage = () => {
    const url = imageInput.trim();
    if (!url) return;
    setImageUrls([...imageUrls, url]);
    setImageInput('');
  };

  const removeImage = (idx: number) => {
    setImageUrls(imageUrls.filter((_, i) => i !== idx));
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const source = ctx.createMediaStreamSource(stream);
      const analyser = ctx.createAnalyser();
      analyser.fftSize = 128;
      source.connect(analyser);
      audioCtxRef.current = ctx;
      analyserRef.current = analyser;

      const mr = new MediaRecorder(stream);
      const chunks: BlobPart[] = [];
      mr.ondataavailable = (ev) => chunks.push(ev.data);
      mr.onstop = () => {
        const blob = new Blob(chunks, { type: 'audio/webm' });
        const url = URL.createObjectURL(blob);
        setRecordedBlob(blob);
        setRecordedUrl(url);
        stream.getTracks().forEach((t) => t.stop());
        if (ctx) ctx.close();
      };
      mr.start();
      mediaRecorderRef.current = mr;

      setIsRecording(true);
      setRecordedBlob(null);
      setRecordedUrl('');
      setRecordSeconds(0);

      timerRef.current = window.setInterval(() => {
        setRecordSeconds((s) => {
          if (s >= 44) {
            stopRecording();
            return 45;
          }
          return s + 1;
        });
      }, 1000);

      const updateWave = () => {
        if (!analyserRef.current) return;
        const data = new Uint8Array(analyserRef.current.frequencyBinCount);
        analyserRef.current.getByteFrequencyData(data);
        const bins = 60;
        const step = Math.floor(data.length / bins);
        const next: number[] = [];
        for (let i = 0; i < bins; i++) {
          let sum = 0;
          for (let j = 0; j < step; j++) sum += data[i * step + j] || 0;
          next.push(Math.max(0.1, (sum / step) / 255));
        }
        setWaveform(next);
        animationRef.current = requestAnimationFrame(updateWave);
      };
      updateWave();
    } catch (err) {
      console.error('Recording failed:', err);
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
    }
    setIsRecording(false);
    stopRecordingVisuals();
  };

  const rerecord = () => {
    if (recordedUrl) URL.revokeObjectURL(recordedUrl);
    setRecordedBlob(null);
    setRecordedUrl('');
    setWaveform(new Array(60).fill(0.1));
    setRecordSeconds(0);
    startRecording();
  };

  const togglePlay = () => {
    if (!recordedUrl) return;
    const el = audioElRef.current;
    if (!el) return;
    if (isPlaying) {
      el.pause();
      setIsPlaying(false);
    } else {
      el.currentTime = 0;
      el.play();
      setIsPlaying(true);
      const animate = () => {
        if (!el || el.paused) {
          setIsPlaying(false);
          setWaveform(waveform.map(() => 0.1 + Math.random() * 0.2));
          return;
        }
        setWaveform(prev => prev.map(() => 0.15 + Math.random() * 0.6));
        animationRef.current = requestAnimationFrame(animate);
      };
      animate();
      el.onended = () => {
        setIsPlaying(false);
        stopRecordingVisuals();
      };
    }
  };

  const canSubmit = () => {
    if (tab === 'text') return textContent.trim().length > 0;
    if (tab === 'image') return imageUrls.length > 0;
    if (tab === 'audio') return recordedBlob !== null;
    return false;
  };

  const handleSubmit = async () => {
    if (!canSubmit()) return;
    let payload: any = { type: tab };
    if (tab === 'text') {
      payload.content = textContent;
    } else if (tab === 'image') {
      payload.images = imageUrls;
    } else if (tab === 'audio') {
      if (recordedBlob) {
        const reader = new FileReader();
        const base64: string = await new Promise((resolve) => {
          reader.onloadend = () => resolve(reader.result as string);
          reader.readAsDataURL(recordedBlob);
        });
        payload.audio = base64;
        payload.audioWaveform = waveform;
      }
    }
    onSubmit(payload);
  };

  if (!open) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div className="modal-tabs">
            {(['text', 'image', 'audio'] as TabType[]).map((t) => (
              <button
                key={t}
                className={`modal-tab ${tab === t ? 'active' : ''}`}
                onClick={() => setTab(t)}
              >
                {t === 'text' && '文字'}
                {t === 'image' && '图片'}
                {t === 'audio' && '语音'}
              </button>
            ))}
          </div>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>

        <div className="modal-body">
          {tab === 'text' && (
            <div className="text-editor">
              <div className="text-toolbar">
                <button type="button" onClick={() => handleFormat('b')} title="粗体 (Ctrl+B)">
                  <b>B</b>
                </button>
                <button type="button" onClick={() => handleFormat('i')} title="斜体 (Ctrl+I)">
                  <i>I</i>
                </button>
                <button type="button" onClick={() => handleFormat('u')} title="下划线 (Ctrl+U)">
                  <u>U</u>
                </button>
                <span className="char-count">{textContent.replace(/<[^>]*>/g, '').length} 字</span>
              </div>
              <textarea
                ref={textRef}
                className="text-area"
                placeholder="写下此刻的灵感..."
                value={textContent}
                onChange={(e) => setTextContent(e.target.value)}
                onKeyDown={handleKeyDown}
                rows={8}
              />
            </div>
          )}

          {tab === 'image' && (
            <div className="image-editor">
              <div className="image-input-row">
                <input
                  className="image-input"
                  placeholder="粘贴图片 URL，按回车或点击添加"
                  value={imageInput}
                  onChange={(e) => setImageInput(e.target.value)}
                  onKeyDown={(e) => { if (e.key === 'Enter') addImage(); }}
                />
                <button className="btn-primary" onClick={addImage}>添加</button>
              </div>
              <div className="image-preview-grid">
                {imageUrls.map((url, i) => (
                  <div key={i} className="image-preview">
                    <img src={url} alt="" onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }} />
                    <button className="image-remove" onClick={() => removeImage(i)}>✕</button>
                  </div>
                ))}
              </div>
              {imageUrls.length === 0 && <div className="empty-hint">暂无图片链接</div>}
            </div>
          )}

          {tab === 'audio' && (
            <div className="audio-editor">
              <div className="audio-wave">
                {waveform.map((v, i) => (
                  <span key={i} className="wave-bar" style={{ height: `${Math.max(4, v * 100)}%` }} />
                ))}
              </div>
              <div className="audio-time">
                {recordSeconds}s / 45s
              </div>
              <div className="audio-controls">
                {!isRecording && !recordedUrl && (
                  <button className="record-btn start" onClick={startRecording}>
                    <span className="record-dot" /> 开始录音
                  </button>
                )}
                {isRecording && (
                  <button className="record-btn stop" onClick={stopRecording}>
                    <span className="record-dot recording" /> 停止
                  </button>
                )}
                {recordedUrl && !isRecording && (
                  <>
                    <button className="record-btn play" onClick={togglePlay}>
                      {isPlaying ? '⏸ 暂停' : '▶ 试听'}
                    </button>
                    <button className="record-btn re" onClick={rerecord}>
                      重新录制
                    </button>
                    <audio ref={audioElRef} src={recordedUrl} />
                  </>
                )}
              </div>
            </div>
          )}
        </div>

        <div className="modal-footer">
          <button className="btn-ghost" onClick={onClose}>取消</button>
          <button className="btn-primary submit" disabled={!canSubmit()} onClick={handleSubmit}>
            创建灵感
          </button>
        </div>
      </div>
    </div>
  );
};

export default CardModal;
