import * as d3 from 'd3';
import type { ColumnReport, OutlierRow } from './analyzer';
import type { ColumnType } from './parser';

const TYPE_LABELS: Record<ColumnType, string> = {
  number: '数字',
  date: '日期',
  text: '文本',
  boolean: '布尔'
};

function getMissingRateColor(rate: number): string {
  const clamped = Math.min(Math.max(rate, 0), 1);

  if (clamped <= 0) return '#38A169';
  if (clamped >= 1) return '#E53E3E';

  const greenR = 56, greenG = 161, greenB = 105;
  const redR = 229, redG = 62, redB = 62;
  const r = Math.round(greenR + (redR - greenR) * clamped);
  const g = Math.round(greenG + (redG - greenG) * clamped);
  const b = Math.round(greenB + (redB - greenB) * clamped);
  return `rgb(${r}, ${g}, ${b})`;
}

function renderMiniChart(
  container: HTMLElement,
  distribution: { value: string; count: number }[],
  delay = 0
): void {
  container.innerHTML = '';
  if (distribution.length === 0) return;

  const rect = container.getBoundingClientRect();
  const width = Math.max(rect.width, 200);
  const height = Math.max(rect.height, 44);
  const padding = { top: 2, right: 2, bottom: 2, left: 2 };

  const svg = d3.select(container)
    .append('svg')
    .attr('width', '100%')
    .attr('height', '100%')
    .attr('viewBox', `0 0 ${width} ${height}`);

  const innerW = width - padding.left - padding.right;
  const innerH = height - padding.top - padding.bottom;
  const data = distribution.slice(0, 15);

  const x = d3.scaleBand()
    .domain(data.map((_, i) => String(i)))
    .range([padding.left, padding.left + innerW])
    .padding(0.15);

  const maxCount = d3.max(data, d => d.count) ?? 1;
  const y = d3.scaleLinear()
    .domain([0, maxCount])
    .range([padding.top + innerH, padding.top]);

  svg.selectAll('rect.bar-mini')
    .data(data)
    .enter()
    .append('rect')
    .attr('class', 'bar-mini')
    .attr('x', (_, i) => x(String(i)) ?? 0)
    .attr('width', x.bandwidth())
    .attr('fill', '#3182CE')
    .attr('rx', 1.5)
    .attr('y', y(0))
    .attr('height', 0)
    .transition()
    .delay((_, i) => delay + i * 30)
    .duration(600)
    .ease(d3.easeCubicOut)
    .attr('y', d => y(d.count))
    .attr('height', d => y(0) - y(d.count));
}

function renderDetailChart(
  container: HTMLElement,
  distribution: { value: string; count: number }[]
): void {
  container.innerHTML = '';
  if (distribution.length === 0) {
    container.innerHTML = '<div class="empty-state"><div class="empty-state-icon">—</div><div style="font-size:0.8125rem">暂无分布数据</div></div>';
    return;
  }

  const rect = container.getBoundingClientRect();
  const width = rect.width || 420;
  const height = rect.height || 140;
  const padding = { top: 16, right: 16, bottom: 32, left: 40 };

  const svg = d3.select(container)
    .append('svg')
    .attr('width', '100%')
    .attr('height', '100%')
    .attr('viewBox', `0 0 ${width} ${height}`);

  const innerW = width - padding.left - padding.right;
  const innerH = height - padding.top - padding.bottom;
  const data = distribution.slice(0, 12);

  const x = d3.scaleBand()
    .domain(data.map(d => d.value))
    .range([padding.left, padding.left + innerW])
    .padding(0.2);

  const maxCount = d3.max(data, d => d.count) ?? 1;
  const y = d3.scaleLinear()
    .domain([0, maxCount])
    .range([padding.top + innerH, padding.top])
    .nice();

  const yAxis = d3.axisLeft(y).ticks(4).tickSize(-innerW);
  svg.append('g')
    .attr('transform', `translate(${padding.left}, 0)`)
    .call(yAxis)
    .call(g => g.selectAll('.domain').remove())
    .call(g => g.selectAll('.tick line').attr('stroke', '#E2E8F0').attr('stroke-dasharray', '2,2'))
    .call(g => g.selectAll('.tick text').attr('fill', '#718096').attr('font-size', 10));

  svg.selectAll('rect.bar')
    .data(data)
    .enter()
    .append('rect')
    .attr('class', 'bar')
    .attr('x', d => x(d.value) ?? 0)
    .attr('width', x.bandwidth())
    .attr('fill', '#3182CE')
    .attr('rx', 3)
    .attr('y', y(0))
    .attr('height', 0)
    .transition()
    .delay((_, i) => 80 + i * 50)
    .duration(700)
    .ease(d3.easeCubicOut)
    .attr('y', d => y(d.count))
    .attr('height', d => y(0) - y(d.count));

  svg.selectAll('text.bar-label')
    .data(data)
    .enter()
    .append('text')
    .attr('class', 'bar-label')
    .attr('x', d => (x(d.value) ?? 0) + x.bandwidth() / 2)
    .attr('y', d => y(d.count) - 4)
    .attr('text-anchor', 'middle')
    .attr('font-size', 10)
    .attr('fill', '#4A5568')
    .attr('font-weight', 600)
    .text(d => d.count)
    .style('opacity', 0)
    .transition()
    .delay((_, i) => 500 + i * 50)
    .duration(300)
    .style('opacity', 1);

  const xAxis = d3.axisBottom(x).tickSize(0);
  svg.append('g')
    .attr('transform', `translate(0, ${y(0)})`)
    .call(xAxis)
    .call(g => g.selectAll('.domain').attr('stroke', '#E2E8F0'))
    .call(g => g.selectAll('.tick text')
      .attr('fill', '#718096')
      .attr('font-size', 9)
      .each(function() {
        const el = this as SVGTextElement;
        if (el.textContent && el.textContent.length > 8) {
          el.textContent = el.textContent.slice(0, 7) + '…';
        }
      })
    );
}

function formatNumber(n: number, digits = 2): string {
  if (Number.isInteger(n)) return String(n);
  return n.toFixed(digits).replace(/\.?0+$/, '');
}

function formatPct(n: number): string {
  return (n * 100).toFixed(1) + '%';
}

function createCard(report: ColumnReport, index: number): HTMLElement {
  const card = document.createElement('div');
  card.className = 'card';
  card.style.opacity = '0';
  card.style.transform = 'translateY(12px)';
  card.dataset.colName = report.name;

  const typeClass = `type-${report.type}`;

  card.innerHTML = `
    <div class="card-header">
      <div class="col-name">${report.name}</div>
      <span class="type-tag ${typeClass}">${TYPE_LABELS[report.type]}</span>
    </div>
    <div class="stats-row">
      <div class="stat-item">
        <span class="stat-label">总数</span>
        <span class="stat-value">${report.totalCount}</span>
      </div>
      <div class="stat-item">
        <span class="stat-label">缺失</span>
        <span class="stat-value">${report.missingCount}</span>
      </div>
      <div class="stat-item">
        <span class="stat-label">唯一值</span>
        <span class="stat-value">${report.uniqueCount}</span>
      </div>
    </div>
    <div class="progress-wrap">
      <div class="progress-label-row">
        <span class="progress-label">缺失率</span>
        <span class="progress-label">${formatPct(report.missingRate)}</span>
      </div>
      <div class="progress-bar">
        <div class="progress-fill" data-width="${report.missingRate}"></div>
      </div>
    </div>
    <div class="mini-chart-wrap"></div>
  `;

  requestAnimationFrame(() => {
    card.style.transition = `opacity 0.5s cubic-bezier(0.16, 1, 0.3, 1) ${index * 60}ms, transform 0.5s cubic-bezier(0.16, 1, 0.3, 1) ${index * 60}ms, box-shadow 300ms ease-out`;
    card.style.opacity = '1';
    card.style.transform = 'translateY(0)';
  });

  setTimeout(() => {
    const chartWrap = card.querySelector('.mini-chart-wrap') as HTMLElement;
    const fill = card.querySelector('.progress-fill') as HTMLElement;
    if (fill) {
      const color = getMissingRateColor(report.missingRate);
      fill.style.background = color;
      fill.style.width = Math.min(report.missingRate * 100, 100) + '%';
    }
    if (chartWrap) {
      renderMiniChart(chartWrap, report.valueDistribution, 100);
    }
  }, index * 60 + 150);

  return card;
}

export interface RendererCallbacks {
  onCardClick: (report: ColumnReport) => void;
  onFilterOutliers: (report: ColumnReport) => void;
}

export class Renderer {
  private grid: HTMLElement;
  private summaryBar: HTMLElement;
  private reportSection: HTMLElement;
  private uploadSection: HTMLElement;
  private loadingState: HTMLElement;
  private filenameBadge: HTMLElement;
  private panelOverlay: HTMLElement;
  private detailPanel: HTMLElement;
  private closePanelBtn: HTMLElement;
  private detailColName: HTMLElement;
  private detailTypeTag: HTMLElement;
  private detailStats: HTMLElement;
  private detailChart: HTMLElement;
  private outlierList: HTMLElement;
  private filterBtn: HTMLButtonElement;
  private currentReport: ColumnReport | null = null;
  private callbacks: RendererCallbacks;

  constructor(callbacks: RendererCallbacks) {
    this.callbacks = callbacks;

    this.grid = document.getElementById('cardsGrid')!;
    this.summaryBar = document.getElementById('summaryBar')!;
    this.reportSection = document.getElementById('reportSection')!;
    this.uploadSection = document.getElementById('uploadSection')!;
    this.loadingState = document.getElementById('loadingState')!;
    this.filenameBadge = document.getElementById('filenameBadge')!;
    this.panelOverlay = document.getElementById('panelOverlay')!;
    this.detailPanel = document.getElementById('detailPanel')!;
    this.closePanelBtn = document.getElementById('closePanel')!;
    this.detailColName = document.getElementById('detailColName')!;
    this.detailTypeTag = document.getElementById('detailTypeTag')!;
    this.detailStats = document.getElementById('detailStats')!;
    this.detailChart = document.getElementById('detailChart')!;
    this.outlierList = document.getElementById('outlierList')!;
    this.filterBtn = document.getElementById('filterOutliersBtn') as HTMLButtonElement;

    this.bindEvents();
  }

  private bindEvents(): void {
    this.closePanelBtn.addEventListener('click', () => this.hideDetailPanel());
    this.panelOverlay.addEventListener('click', () => this.hideDetailPanel());
    this.filterBtn.addEventListener('click', () => {
      if (this.currentReport) {
        this.callbacks.onFilterOutliers(this.currentReport);
      }
    });

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') this.hideDetailPanel();
    });
  }

  showLoading(): void {
    this.uploadSection.style.display = 'none';
    this.reportSection.classList.remove('show');
    this.loadingState.classList.add('show');
  }

  hideLoading(): void {
    this.loadingState.classList.remove('show');
  }

  showError(message: string): void {
    this.hideLoading();
    this.uploadSection.style.display = 'block';
    alert(message);
  }

  renderReports(
    reports: ColumnReport[],
    filename: string,
    totalMissing: number,
    totalOutliers: number,
    totalRows: number,
    totalCols: number
  ): void {
    this.hideLoading();
    this.filenameBadge.textContent = filename;
    this.reportSection.classList.add('show');

    (document.getElementById('totalRows') as HTMLElement).textContent = String(totalRows);
    (document.getElementById('totalCols') as HTMLElement).textContent = String(totalCols);
    (document.getElementById('totalMissing') as HTMLElement).textContent = String(totalMissing);
    (document.getElementById('totalOutliers') as HTMLElement).textContent = String(totalOutliers);
    this.summaryBar.style.display = 'flex';

    this.grid.innerHTML = '';
    reports.forEach((report, i) => {
      const card = createCard(report, i);
      card.addEventListener('click', () => this.callbacks.onCardClick(report));
      card.addEventListener('touchstart', () => {
        if (navigator.vibrate) navigator.vibrate(15);
      }, { passive: true });
      this.grid.appendChild(card);
    });
  }

  showDetailPanel(report: ColumnReport): void {
    this.currentReport = report;

    this.detailColName.textContent = report.name;
    this.detailTypeTag.textContent = TYPE_LABELS[report.type];
    this.detailTypeTag.className = `type-tag type-${report.type}`;

    const statsHtml: string[] = [
      `<div class="detail-stat"><span class="detail-stat-label">总数</span><span class="detail-stat-value">${report.totalCount}</span></div>`,
      `<div class="detail-stat"><span class="detail-stat-label">非空值</span><span class="detail-stat-value">${report.nonNullCount}</span></div>`,
      `<div class="detail-stat"><span class="detail-stat-label">缺失值</span><span class="detail-stat-value">${report.missingCount} (${formatPct(report.missingRate)})</span></div>`,
      `<div class="detail-stat"><span class="detail-stat-label">唯一值</span><span class="detail-stat-value">${report.uniqueCount}</span></div>`,
      `<div class="detail-stat"><span class="detail-stat-label">异常值</span><span class="detail-stat-value">${report.outlierCount} (${formatPct(report.outlierRate)})</span></div>`
    ];

    if (report.type === 'number') {
      if (report.min !== undefined) statsHtml.push(
        `<div class="detail-stat"><span class="detail-stat-label">最小值</span><span class="detail-stat-value">${formatNumber(report.min)}</span></div>`
      );
      if (report.max !== undefined) statsHtml.push(
        `<div class="detail-stat"><span class="detail-stat-label">最大值</span><span class="detail-stat-value">${formatNumber(report.max)}</span></div>`
      );
      if (report.mean !== undefined) statsHtml.push(
        `<div class="detail-stat"><span class="detail-stat-label">平均值</span><span class="detail-stat-value">${formatNumber(report.mean)}</span></div>`
      );
      if (report.median !== undefined) statsHtml.push(
        `<div class="detail-stat"><span class="detail-stat-label">中位数</span><span class="detail-stat-value">${formatNumber(report.median)}</span></div>`
      );
      if (report.stdDev !== undefined) statsHtml.push(
        `<div class="detail-stat"><span class="detail-stat-label">标准差</span><span class="detail-stat-value">${formatNumber(report.stdDev)}</span></div>`
      );
    }

    this.detailStats.innerHTML = statsHtml.join('');

    this.outlierList.innerHTML = '';
    if (report.outliers.length === 0) {
      this.outlierList.innerHTML = '<div class="empty-state"><div class="empty-state-icon">✓</div><div style="font-size:0.8125rem">未检测到异常值</div></div>';
      this.filterBtn.disabled = true;
    } else {
      this.filterBtn.disabled = false;
      report.outliers.forEach((o: OutlierRow) => {
        const item = document.createElement('div');
        item.className = 'outlier-item';
        const valStr = o.value === null || o.value === undefined ? '(空)' : String(o.value);
        const display = valStr.length > 80 ? valStr.slice(0, 80) + '…' : valStr;
        item.innerHTML = `
          <span class="outlier-value"></span>
          <span class="outlier-row-label">行 ${o.rowIndex + 1}</span>
        `;
        (item.querySelector('.outlier-value') as HTMLElement).textContent = display;
        this.outlierList.appendChild(item);
      });
      if (report.outlierCount > report.outliers.length) {
        const more = document.createElement('div');
        more.className = 'empty-state';
        more.style.padding = '16px';
        more.innerHTML = `<div style="font-size:0.75rem">还有 ${report.outlierCount - report.outliers.length} 个异常值未显示</div>`;
        this.outlierList.appendChild(more);
      }
    }

    requestAnimationFrame(() => {
      renderDetailChart(this.detailChart, report.valueDistribution);
    });

    this.panelOverlay.classList.add('show');
    this.detailPanel.classList.add('show');
  }

  hideDetailPanel(): void {
    this.detailPanel.classList.remove('show');
    this.panelOverlay.classList.remove('show');
    this.currentReport = null;
  }
}
