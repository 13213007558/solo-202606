import {
  Capsule,
  createCapsule,
  deleteCapsule,
  getAllCapsules,
  getCapsuleById,
  getShareUrl,
  isUnlocked,
} from './capsule';
import { AudioRecorder, startSpectrumVisualization, RecordingResult } from './recorder';
import {
  calculateCountdown,
  fileToBase64,
  formatDate,
  formatDateTime,
  formatDuration,
  getDefaultUnlockTime,
  padZero,
  parseDateTimeLocal,
  showToast,
} from './utils';

type Route =
  | { name: 'create' }
  | { name: 'list' }
  | { name: 'detail'; id: string }
  | { name: 'notfound' };

function parseHash(): Route {
  const hash = window.location.hash.replace(/^#/, '') || '/';
  const parts = hash.split('/').filter(Boolean);

  if (parts.length === 0) return { name: 'create' };
  if (parts[0] === 'create') return { name: 'create' };
  if (parts[0] === 'list' || parts[0] === 'manage') return { name: 'list' };
  if (parts[0] === 'capsule' && parts[1]) return { name: 'detail', id: parts[1] };
  return { name: 'notfound' };
}

function navigate(path: string): void {
  window.location.hash = path;
}

function renderNavbar(active: 'create' | 'list'): string {
  return `
    <nav class="navbar">
      <div class="nav-inner">
        <div class="logo" onclick="navigate('/')">
          <span class="logo-icon">✉️</span>
          <span>时光胶囊</span>
        </div>
        <div class="nav-links">
          <button class="nav-btn ${active === 'create' ? 'active' : ''}" onclick="navigate('/')">
            ✨ 创建胶囊
          </button>
          <button class="nav-btn ${active === 'list' ? 'active' : ''}" onclick="navigate('/list')">
            📋 我的胶囊
          </button>
        </div>
      </div>
    </nav>
  `;
}

function renderFooter(): string {
  return `
    <footer class="footer">
      ✨ 用心记录此刻，未来的你会感谢今天的自己
    </footer>
  `;
}

// ============ CREATE PAGE ============

function renderCreatePage(app: HTMLElement): void {
  app.innerHTML = `
    ${renderNavbar('create')}
    <main class="main-content">
      <div class="page create-container">
        <h1 class="page-title">✨ 创建时光胶囊</h1>
        <p class="page-subtitle">写下此刻的记忆，在未来的某个瞬间开启它</p>

        <div class="form-card">
          <form id="capsule-form" onsubmit="return false;">
            <div class="form-group">
              <label class="form-label" for="capsule-title">标题 *</label>
              <input
                type="text"
                id="capsule-title"
                class="form-input"
                placeholder="给这个胶囊起个名字..."
                maxlength="100"
                required
              />
            </div>

            <div class="form-group">
              <label class="form-label" for="capsule-content">正文内容 *</label>
              <textarea
                id="capsule-content"
                class="form-textarea"
                placeholder="写下你想对未来说的话..."
                maxlength="5000"
                required
              ></textarea>
            </div>

            <div class="form-group">
              <label class="form-label">图片</label>
              <div class="image-upload-area">
                <input
                  type="url"
                  id="image-url"
                  class="form-input image-url-input"
                  placeholder="或输入图片URL..."
                />
                <div class="file-upload-wrapper">
                  <button type="button" class="file-upload-btn" tabindex="-1">📁 上传图片</button>
                  <input type="file" id="image-file" accept="image/*" />
                </div>
              </div>
              <div class="image-preview" id="image-preview">
                <img id="preview-img" alt="图片预览" />
              </div>
            </div>

            <div class="form-group">
              <label class="form-label">语音留言（最长30秒）</label>
              <div class="recorder-section">
                <div class="recorder-header">
                  <span class="recorder-title">🎙️ 录制你的声音</span>
                  <span class="recording-time" id="recording-time">00:00 / 00:30</span>
                </div>
                <div class="recording-hint" id="recording-hint">
                  <span>点击下方圆形按钮开始录音</span>
                  <span class="limit-warn" id="limit-hint" style="display:none;">⚠️ 即将达到30秒上限</span>
                </div>
                <div class="waveform-container" style="margin-top: 0.8rem;">
                  <canvas id="waveform-canvas"></canvas>
                </div>
                <div class="recorder-controls">
                  <button type="button" class="record-btn" id="record-btn" title="点击开始录音 / 再次点击停止">
                    <span class="record-btn-icon"></span>
                  </button>
                </div>
                <div class="audio-preview" id="audio-preview">
                  <audio id="audio-player" controls></audio>
                  <div style="margin-top: 0.8rem;">
                    <button type="button" class="clear-audio-btn" id="clear-audio-btn">
                      🗑️ 清除录音
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <div class="form-group">
              <label class="form-label" for="unlock-time">解锁时间 *</label>
              <input
                type="datetime-local"
                id="unlock-time"
                class="form-input"
                value="${getDefaultUnlockTime()}"
                required
              />
            </div>

            <button type="submit" class="submit-btn" id="submit-btn">
              🕳️ 封存并创建胶囊
            </button>
          </form>
        </div>
      </div>
    </main>
    ${renderFooter()}
  `;

  wireCreatePage();
}

function wireCreatePage(): void {
  const titleInput = document.getElementById('capsule-title') as HTMLInputElement;
  const contentInput = document.getElementById('capsule-content') as HTMLTextAreaElement;
  const imageUrlInput = document.getElementById('image-url') as HTMLInputElement;
  const imageFileInput = document.getElementById('image-file') as HTMLInputElement;
  const imagePreview = document.getElementById('image-preview') as HTMLDivElement;
  const previewImg = document.getElementById('preview-img') as HTMLImageElement;
  const unlockTimeInput = document.getElementById('unlock-time') as HTMLInputElement;
  const recordBtn = document.getElementById('record-btn') as HTMLButtonElement;
  const recordingTimeEl = document.getElementById('recording-time') as HTMLSpanElement;
  const recordingHintEl = document.getElementById('recording-hint') as HTMLDivElement;
  const limitHintEl = document.getElementById('limit-hint') as HTMLSpanElement;
  const waveformCanvas = document.getElementById('waveform-canvas') as HTMLCanvasElement;
  const audioPreview = document.getElementById('audio-preview') as HTMLDivElement;
  const audioPlayer = document.getElementById('audio-player') as HTMLAudioElement;
  const clearAudioBtn = document.getElementById('clear-audio-btn') as HTMLButtonElement;
  const form = document.getElementById('capsule-form') as HTMLFormElement;
  const hintTextEl = recordingHintEl.querySelector('span:first-child') as HTMLSpanElement;

  let currentImageBase64: string | undefined;
  let currentAudio: RecordingResult | null = null;

  const WARNING_THRESHOLD_MS = 25000;
  const MAX_DURATION_MS = 30000;

  const recorder = new AudioRecorder();
  recorder.setOnTimeUpdate((ms) => {
    recordingTimeEl.textContent = `${formatDuration(ms)} / ${formatDuration(MAX_DURATION_MS)}`;

    if (ms >= WARNING_THRESHOLD_MS) {
      recordingTimeEl.classList.add('warning');
      if (limitHintEl.style.display !== 'inline') {
        limitHintEl.style.display = 'inline';
      }
    } else {
      recordingTimeEl.classList.remove('warning');
      if (limitHintEl.style.display !== 'none') {
        limitHintEl.style.display = 'none';
      }
    }
  });
  recorder.startWaveformDrawing(waveformCanvas);

  const now = new Date();
  now.setMinutes(now.getMinutes() + 1);
  unlockTimeInput.min = `${now.getFullYear()}-${padZero(now.getMonth() + 1)}-${padZero(now.getDate())}T${padZero(now.getHours())}:${padZero(now.getMinutes())}`;

  function showImagePreview(src: string): void {
    previewImg.src = src;
    imagePreview.classList.add('show');
  }

  function hideImagePreview(): void {
    previewImg.src = '';
    imagePreview.classList.remove('show');
    currentImageBase64 = undefined;
  }

  imageUrlInput.addEventListener('input', () => {
    const url = imageUrlInput.value.trim();
    if (url) {
      currentImageBase64 = url;
      showImagePreview(url);
    } else {
      hideImagePreview();
    }
  });

  imageFileInput.addEventListener('change', async () => {
    const file = imageFileInput.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      showToast('请选择图片文件');
      return;
    }
    try {
      const base64 = await fileToBase64(file);
      currentImageBase64 = base64;
      imageUrlInput.value = '';
      showImagePreview(base64);
    } catch {
      showToast('图片加载失败');
    }
  });

  let isRecording = false;

  recordBtn.addEventListener('click', async () => {
    if (!isRecording) {
      try {
        await recorder.startRecording();
        isRecording = true;
        recordBtn.classList.add('recording');
        hintTextEl.textContent = '🔴 正在录音...再次点击按钮结束';
        recordBtn.title = '点击停止录音';
      } catch (e) {
        showToast(e instanceof Error ? e.message : '录音启动失败');
      }
    } else {
      isRecording = false;
      recordBtn.classList.remove('recording');
      hintTextEl.textContent = '点击下方圆形按钮开始录音';
      recordBtn.title = '点击开始录音';
      recordingTimeEl.classList.remove('warning');
      limitHintEl.style.display = 'none';
      try {
        const result = await recorder.stopRecording();
        if (result && result.duration >= 500) {
          currentAudio = result;
          audioPlayer.src = result.base64;
          audioPreview.classList.add('show');
        } else if (result) {
          showToast('录音时间太短，请至少录制0.5秒');
        }
      } catch (e) {
        showToast(e instanceof Error ? e.message : '录音保存失败');
      }
      recorder.cleanup();
      recorder.startWaveformDrawing(waveformCanvas);
      recordingTimeEl.textContent = `00:00 / ${formatDuration(MAX_DURATION_MS)}`;
    }
  });

  clearAudioBtn.addEventListener('click', () => {
    currentAudio = null;
    audioPlayer.src = '';
    audioPreview.classList.remove('show');
  });

  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const title = titleInput.value.trim();
    const content = contentInput.value.trim();
    const unlockAtStr = unlockTimeInput.value;

    if (!title) return showToast('请输入胶囊标题');
    if (!content) return showToast('请输入正文内容');
    if (!unlockAtStr) return showToast('请选择解锁时间');

    const unlockAt = parseDateTimeLocal(unlockAtStr);
    if (unlockAt <= Date.now()) {
      return showToast('解锁时间必须是未来时间');
    }

    const submitBtn = document.getElementById('submit-btn') as HTMLButtonElement;
    submitBtn.disabled = true;
    submitBtn.textContent = '封存中...';

    setTimeout(async () => {
      try {
        const capsule = createCapsule({
          title,
          content,
          imageUrl: currentImageBase64,
          audioBase64: currentAudio?.base64,
          audioMimeType: currentAudio?.mimeType,
          unlockAt,
        });

        recorder.cleanup();
        showCreatedModal(capsule);
      } catch (e) {
        showToast(e instanceof Error ? e.message : '创建失败，请重试');
      } finally {
        submitBtn.disabled = false;
        submitBtn.textContent = '🕳️ 封存并创建胶囊';
      }
    }, 50);
  });

  window.addEventListener('hashchange', () => {
    recorder.cleanup();
  }, { once: true });
}

function showCreatedModal(capsule: Capsule): void {
  const shareUrl = getShareUrl(capsule.id);

  const overlay = document.createElement('div');
  overlay.className = 'modal-overlay';
  overlay.innerHTML = `
    <div class="modal-content">
      <h2 class="modal-title">🎉 胶囊已封存！</h2>
      <p class="modal-text">
        你的时光胶囊已成功创建。<br/>
        解锁时间：<strong>${formatDateTime(capsule.unlockAt)}</strong><br/>
        分享下方链接，未来的你或朋友可以在解锁时间后查看。
      </p>
      <div class="share-link-box">
        <div class="share-link" id="share-link-text">${shareUrl}</div>
      </div>
      <div class="modal-actions">
        <button class="modal-btn modal-btn-secondary" id="modal-copy">📋 复制链接</button>
        <button class="modal-btn modal-btn-primary" id="modal-view">🔍 查看胶囊</button>
      </div>
    </div>
  `;
  document.body.appendChild(overlay);

  overlay.addEventListener('click', (e) => {
    if (e.target === overlay) overlay.remove();
  });

  const copyBtn = document.getElementById('modal-copy') as HTMLButtonElement;
  const viewBtn = document.getElementById('modal-view') as HTMLButtonElement;

  copyBtn.addEventListener('click', async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      showToast('链接已复制到剪贴板');
    } catch {
      showToast('复制失败，请手动复制');
    }
  });

  viewBtn.addEventListener('click', () => {
    overlay.remove();
    navigate(`/capsule/${capsule.id}`);
  });
}

// ============ LIST / MANAGE PAGE ============

function renderListPage(app: HTMLElement): void {
  const capsules = getAllCapsules();

  app.innerHTML = `
    ${renderNavbar('list')}
    <main class="main-content">
      <div class="page">
        <div class="mgmt-header">
          <div>
            <h1 class="mgmt-title">📋 我的胶囊</h1>
            <p class="mgmt-count">共 ${capsules.length} 个时光胶囊</p>
          </div>
        </div>

        ${capsules.length === 0 ? renderEmptyState() : renderCapsuleGrid(capsules)}
      </div>
    </main>
    ${renderFooter()}
  `;

  wireListPage();
}

function renderEmptyState(): string {
  return `
    <div class="empty-state">
      <div class="empty-icon">📭</div>
      <h3 class="empty-title">还没有时光胶囊</h3>
      <p class="empty-text">创建你的第一个时光胶囊，给未来写一封信吧</p>
      <button class="empty-btn" onclick="navigate('/')">✨ 创建第一个胶囊</button>
    </div>
  `;
}

function renderCapsuleGrid(capsules: Capsule[]): string {
  return `
    <div class="capsules-grid" id="capsules-grid">
      ${capsules.map((c) => renderCapsuleCard(c)).join('')}
    </div>
  `;
}

function renderCapsuleCard(capsule: Capsule): string {
  const unlocked = isUnlocked(capsule);
  const countdown = calculateCountdown(capsule.unlockAt);

  let statusHtml: string;
  if (unlocked) {
    statusHtml = `<span class="card-status unlocked">🔓 已解锁</span>`;
  } else {
    const parts: string[] = [];
    if (countdown.days > 0) parts.push(`${countdown.days}天`);
    if (countdown.hours > 0 || countdown.days > 0) parts.push(`${padZero(countdown.hours)}时`);
    parts.push(`${padZero(countdown.minutes)}分`);
    statusHtml = `<span class="card-status locked">⏳ ${parts.join(' ')}</span>`;
  }

  return `
    <div class="capsule-card" data-id="${capsule.id}">
      <div class="card-top">
        ${statusHtml}
        <button class="card-delete" data-delete="${capsule.id}" title="删除胶囊">×</button>
      </div>
      <h3 class="card-title">${escapeHtml(capsule.title)}</h3>
      <div class="card-info">
        <div class="card-info-row">
          <span class="card-info-label">📅 创建:</span>
          <span>${formatDate(capsule.createdAt)}</span>
        </div>
        <div class="card-info-row">
          <span class="card-info-label">🔓 解锁:</span>
          <span>${formatDateTime(capsule.unlockAt)}</span>
        </div>
        ${capsule.imageUrl ? '<div class="card-info-row">🖼️ <span>含图片</span></div>' : ''}
        ${capsule.audioBase64 ? '<div class="card-info-row">🎙️ <span>含语音</span></div>' : ''}
      </div>
    </div>
  `;
}

function wireListPage(): void {
  document.querySelectorAll('.capsule-card').forEach((card) => {
    const id = card.getAttribute('data-id');
    if (!id) return;

    card.addEventListener('click', (e) => {
      const deleteBtn = (e.target as HTMLElement).closest('[data-delete]');
      if (deleteBtn) {
        e.stopPropagation();
        const deleteId = deleteBtn.getAttribute('data-delete');
        if (deleteId && confirm('确定要删除这个时光胶囊吗？此操作不可撤销。')) {
          if (deleteCapsule(deleteId)) {
            showToast('胶囊已删除');
            renderListPage(document.getElementById('app') as HTMLElement);
          }
        }
        return;
      }
      navigate(`/capsule/${id}`);
    });
  });
}

// ============ DETAIL PAGE ============

function renderDetailPage(app: HTMLElement, id: string): void {
  const capsule = getCapsuleById(id);

  if (!capsule) {
    app.innerHTML = `
      ${renderNavbar('list')}
      <main class="main-content">
        <div class="page" style="text-align:center; padding: 4rem 1rem;">
          <div style="font-size: 5rem; margin-bottom: 1rem;">❓</div>
          <h2 class="page-title">胶囊不存在</h2>
          <p class="page-subtitle">这个胶囊可能已被删除或链接无效</p>
          <button class="empty-btn" onclick="navigate('/')">✨ 返回首页</button>
        </div>
      </main>
      ${renderFooter()}
    `;
    return;
  }

  const unlocked = isUnlocked(capsule);

  app.innerHTML = `
    ${renderNavbar('list')}
    <main class="main-content">
      <div class="page detail-container">
        <button class="back-btn" onclick="history.length > 1 ? history.back() : navigate('/list')">
          ← 返回
        </button>

        <div class="capsule-detail-card ${unlocked ? 'unlocked' : ''}" id="detail-card">
          <div class="capsule-header">
            <h1 class="capsule-title">${escapeHtml(capsule.title)}</h1>
            <div class="capsule-meta">
              <span>📅 创建于 ${formatDateTime(capsule.createdAt)}</span>
              <span>🔓 ${unlocked ? '已解锁' : '解锁于 ' + formatDateTime(capsule.unlockAt)}</span>
            </div>
          </div>

          <div class="capsule-body">
            <div class="capsule-content">${escapeHtml(capsule.content)}</div>

            ${
              capsule.imageUrl
                ? `<div class="capsule-image"><img src="${capsule.imageUrl}" alt="胶囊图片" onerror="this.parentElement.style.display='none'" /></div>`
                : ''
            }

            ${
              capsule.audioBase64
                ? `
              <div class="capsule-audio-player">
                <button class="play-voice-btn" id="play-voice-btn" title="播放语音">
                  <svg viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>
                </button>
                <div class="audio-spectrum">
                  <canvas id="spectrum-canvas"></canvas>
                </div>
                <audio id="detail-audio" src="${capsule.audioBase64}"></audio>
              </div>
            `
                : ''
            }
          </div>

          ${!unlocked ? renderLockedOverlay(capsule) : ''}
        </div>
      </div>
    </main>
    ${renderFooter()}
  `;

  wireDetailPage(capsule, unlocked);
}

function renderLockedOverlay(capsule: Capsule): string {
  const cd = calculateCountdown(capsule.unlockAt);
  return `
    <div class="locked-overlay" id="locked-overlay">
      <div class="lock-icon">🔒</div>
      <h2 class="locked-title">胶囊尚未开启</h2>
      <p class="locked-subtitle">距离解锁还有</p>

      <div class="countdown" id="countdown">
        ${renderCountdownGroup(cd.days, 'DD', 2)}
        ${renderColon()}
        ${renderCountdownGroup(cd.hours, 'HH', 2)}
        ${renderColon()}
        ${renderCountdownGroup(cd.minutes, 'MM', 2)}
        ${renderColon()}
        ${renderCountdownGroup(cd.seconds, 'SS', 2)}
      </div>
    </div>
  `;
}

function renderColon(): string {
  return `
    <div class="countdown-separator">
      <span class="countdown-separator-dot"></span>
      <span class="countdown-separator-dot"></span>
    </div>
  `;
}

function renderCountdownGroup(value: number, label: string, digits: number): string {
  const str = padZero(value, digits);
  return `
    <div class="countdown-unit-wrapper">
      <div class="countdown-group">
        ${str
          .split('')
          .map((d, i) => `<div class="flip-digit" data-digit-index="${label}-${i}">${renderFlipDigit(d)}</div>`)
          .join('')}
      </div>
      <div class="countdown-group-label">${label}</div>
    </div>
  `;
}

function renderFlipDigit(digit: string): string {
  return `
    <div class="flip-digit-inner">
      <div class="flip-half top"><span>${digit}</span></div>
      <div class="flip-half bottom"><span>${digit}</span></div>
    </div>
  `;
}

function wireDetailPage(capsule: Capsule, initialUnlocked: boolean): void {
  if (!initialUnlocked) {
    startCountdown(capsule);
  }

  const audio = document.getElementById('detail-audio') as HTMLAudioElement | null;
  const playBtn = document.getElementById('play-voice-btn') as HTMLButtonElement | null;
  const spectrumCanvas = document.getElementById('spectrum-canvas') as HTMLCanvasElement | null;

  if (audio && playBtn && spectrumCanvas && initialUnlocked) {
    let stopViz: (() => void) | null = null;
    let vizStarted = false;

    playBtn.addEventListener('click', async () => {
      if (!audio.paused) {
        audio.pause();
        playBtn.classList.remove('playing');
        if (stopViz) {
          stopViz();
          stopViz = null;
        }
        return;
      }

      try {
        if (!vizStarted) {
          stopViz = startSpectrumVisualization(spectrumCanvas, audio);
          vizStarted = true;
        }
        await audio.play();
        playBtn.classList.add('playing');
      } catch {
        showToast('语音播放失败');
      }
    });

    audio.addEventListener('ended', () => {
      playBtn.classList.remove('playing');
    });

    audio.addEventListener('pause', () => {
      playBtn.classList.remove('playing');
    });
  }
}

function startCountdown(capsule: Capsule): void {
  const overlay = document.getElementById('locked-overlay') as HTMLDivElement;
  const countdownEl = document.getElementById('countdown') as HTMLDivElement;
  const detailCard = document.getElementById('detail-card') as HTMLDivElement;
  if (!overlay || !countdownEl || !detailCard) return;

  const digitKeys = ['DD-0', 'DD-1', 'HH-0', 'HH-1', 'MM-0', 'MM-1', 'SS-0', 'SS-1'];
  const prevDigits: Record<string, string> = {};

  let rafId: number;
  let lastSecond = -1;

  const update = () => {
    const parts = calculateCountdown(capsule.unlockAt);

    if (parts.total <= 0) {
      overlay.classList.add('unlocking');
      detailCard.classList.add('unlocked');
      setTimeout(() => {
        overlay.remove();
      }, 900);
      return;
    }

    const currentSecond = Math.floor(parts.total / 1000);

    if (currentSecond !== lastSecond) {
      lastSecond = currentSecond;

      const currentDigits: Record<string, string> = {
        'DD-0': padZero(parts.days, 2)[0],
        'DD-1': padZero(parts.days, 2)[1],
        'HH-0': padZero(parts.hours, 2)[0],
        'HH-1': padZero(parts.hours, 2)[1],
        'MM-0': padZero(parts.minutes, 2)[0],
        'MM-1': padZero(parts.minutes, 2)[1],
        'SS-0': padZero(parts.seconds, 2)[0],
        'SS-1': padZero(parts.seconds, 2)[1],
      };

      for (const key of digitKeys) {
        const oldDigit = prevDigits[key];
        const newDigit = currentDigits[key];

        if (oldDigit !== undefined && oldDigit !== newDigit) {
          const flipDigitEl = countdownEl.querySelector(`[data-digit-index="${key}"]`);
          if (flipDigitEl) {
            triggerFlipAnimation(flipDigitEl, oldDigit, newDigit);
          }
        }

        prevDigits[key] = newDigit;
      }
    }

    rafId = requestAnimationFrame(update);
  };

  rafId = requestAnimationFrame(update);

  const cleanup = () => {
    cancelAnimationFrame(rafId);
    window.removeEventListener('hashchange', cleanup);
  };
  window.addEventListener('hashchange', cleanup);
}

function triggerFlipAnimation(
  flipDigitEl: Element,
  oldDigit: string,
  newDigit: string
): void {
  const inner = flipDigitEl.querySelector('.flip-digit-inner');
  if (!inner) return;

  const existingTopFold = inner.querySelector('.flip-top-fold');
  const existingBottomFold = inner.querySelector('.flip-bottom-fold');
  if (existingTopFold) existingTopFold.remove();
  if (existingBottomFold) existingBottomFold.remove();

  const staticTop = inner.querySelector('.flip-half.top') as HTMLDivElement;
  const staticBottom = inner.querySelector('.flip-half.bottom') as HTMLDivElement;
  if (staticTop) staticTop.querySelector('span')!.textContent = newDigit;
  if (staticBottom) staticBottom.querySelector('span')!.textContent = oldDigit;

  const topFold = document.createElement('div');
  topFold.className = 'flip-top-fold';
  topFold.innerHTML = `<span>${oldDigit}</span>`;
  inner.appendChild(topFold);

  const bottomFold = document.createElement('div');
  bottomFold.className = 'flip-bottom-fold';
  bottomFold.innerHTML = `<span>${newDigit}</span>`;
  inner.appendChild(bottomFold);

  void topFold.offsetWidth;
  void bottomFold.offsetWidth;

  topFold.classList.add('flipping');
  bottomFold.classList.add('flipping');

  const onDone = () => {
    staticBottom.querySelector('span')!.textContent = newDigit;
    topFold.remove();
    bottomFold.remove();
    topFold.removeEventListener('animationend', onDone);
  };

  topFold.addEventListener('animationend', onDone);
}

// ============ 404 PAGE ============

function renderNotFoundPage(app: HTMLElement): void {
  app.innerHTML = `
    ${renderNavbar('list')}
    <main class="main-content">
      <div class="page" style="text-align:center; padding: 4rem 1rem;">
        <div style="font-size: 5rem; margin-bottom: 1rem;">🧭</div>
        <h2 class="page-title">页面不存在</h2>
        <p class="page-subtitle">你访问的页面不存在</p>
        <button class="empty-btn" onclick="navigate('/')">✨ 返回首页</button>
      </div>
    </main>
    ${renderFooter()}
  `;
}

// ============ UTILITIES ============

function escapeHtml(text: string): string {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

// ============ ROUTER ============

function renderRoute(): void {
  const app = document.getElementById('app') as HTMLElement;
  if (!app) return;

  const route = parseHash();

  switch (route.name) {
    case 'create':
      renderCreatePage(app);
      break;
    case 'list':
      renderListPage(app);
      break;
    case 'detail':
      renderDetailPage(app, route.id);
      break;
    case 'notfound':
    default:
      renderNotFoundPage(app);
      break;
  }

  window.scrollTo({ top: 0, behavior: 'instant' as ScrollBehavior });
}

// Expose navigate globally for inline handlers
(window as unknown as { navigate: (p: string) => void }).navigate = navigate;

// Bootstrap
document.addEventListener('DOMContentLoaded', () => {
  renderRoute();
  window.addEventListener('hashchange', renderRoute);
});
