import { parseFile, type DataFrame } from './parser';
import { analyze, type ColumnReport } from './analyzer';
import { Renderer } from './renderer';

let currentDf: DataFrame | null = null;
let currentReports: ColumnReport[] = [];

const renderer = new Renderer({
  onCardClick: (report) => {
    renderer.showDetailPanel(report);
  },
  onFilterOutliers: (report) => {
    if (!currentDf) return;
    const outlierSet = new Set(report.outliers.map(o => o.rowIndex));
    const newRows = currentDf.rows.filter((_, i) => !outlierSet.has(i));
    const removed = currentDf.rowCount - newRows.length;
    currentDf = {
      ...currentDf,
      rows: newRows,
      rowCount: newRows.length
    };
    currentReports = analyze(currentDf);
    const totalMissing = currentReports.reduce((s, r) => s + r.missingCount, 0);
    const totalOutliers = currentReports.reduce((s, r) => s + r.outlierCount, 0);
    renderer.renderReports(
      currentReports,
      currentDf.filename,
      totalMissing,
      totalOutliers,
      currentDf.rowCount,
      currentDf.colCount
    );
    renderer.hideDetailPanel();
    setTimeout(() => {
      alert(`已过滤 ${removed} 行异常数据`);
    }, 400);
  }
});

function setupUploadHandlers(): void {
  const uploadZone = document.getElementById('uploadZone') as HTMLElement;
  const fileInput = document.getElementById('fileInput') as HTMLInputElement;
  const browseBtn = document.getElementById('browseBtn') as HTMLElement;

  browseBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    fileInput.click();
  });

  uploadZone.addEventListener('click', () => {
    fileInput.click();
  });

  uploadZone.addEventListener('dragover', (e) => {
    e.preventDefault();
    uploadZone.classList.add('dragover');
  });

  uploadZone.addEventListener('dragleave', () => {
    uploadZone.classList.remove('dragover');
  });

  uploadZone.addEventListener('drop', (e) => {
    e.preventDefault();
    uploadZone.classList.remove('dragover');
    const files = e.dataTransfer?.files;
    if (files && files.length > 0) {
      handleFile(files[0]);
    }
  });

  fileInput.addEventListener('change', () => {
    const files = fileInput.files;
    if (files && files.length > 0) {
      handleFile(files[0]);
    }
    fileInput.value = '';
  });
}

async function handleFile(file: File): Promise<void> {
  try {
    renderer.showLoading();
    await new Promise(r => setTimeout(r, 150));
    const df = await parseFile(file);
    currentDf = df;
    currentReports = analyze(df);

    const totalMissing = currentReports.reduce((s, r) => s + r.missingCount, 0);
    const totalOutliers = currentReports.reduce((s, r) => s + r.outlierCount, 0);

    renderer.renderReports(
      currentReports,
      df.filename,
      totalMissing,
      totalOutliers,
      df.rowCount,
      df.colCount
    );
  } catch (err) {
    const msg = err instanceof Error ? err.message : '解析失败';
    renderer.showError(msg);
  }
}

setupUploadHandlers();
