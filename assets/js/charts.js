/**
 * Chart data is driven entirely by data attributes on each [data-chart-card] element.
 * WordPress / ACF developers: update the data attributes below to make charts dynamic.
 *
 * Per-card attributes:
 *   data-chart-fill          — CSS color for the area fill (e.g. "rgba(76,99,184,0.16)")
 *   data-default-range       — which range tab is active on load (1m | 1q | 1y | 5y)
 *
 * Per-range attributes (repeat for each range key: 1m, 1q, 1y, 5y):
 *   data-range1m-values      — comma-separated price values
 *   data-range1m-labels      — comma-separated x-axis labels (4 evenly spaced ticks)
 *   data-range1m-date        — date string shown above the chart
 *
 * Example ACF PHP output:
 *   data-range1m-values="<?php echo get_field('wti_1m_values'); ?>"
 */

function getSeriesData(card) {
  const fill = card.dataset.chartFill || 'rgba(76, 99, 184, 0.16)';
  const ranges = {};

  ['1m', '1q', '1y', '5y'].forEach((range) => {
    // "1m" → "range1mValues", "5y" → "range5yValues", etc.
    const camel = range; // already alphanumeric
    const valStr = card.dataset[`range${camel}Values`];
    const labStr = card.dataset[`range${camel}Labels`];
    const dateStr = card.dataset[`range${camel}Date`];

    if (valStr) {
      ranges[range] = {
        values: valStr.split(',').map((v) => parseFloat(v.trim())),
        labels: labStr ? labStr.split(',').map((l) => l.trim()) : [],
        date: dateStr || '',
      };
    }
  });

  return { fill, ranges };
}

function formatMoney(value) {
  return `$${value.toFixed(2)}`;
}

function formatDelta(value) {
  const sign = value >= 0 ? '▲' : '▼';
  return `${sign} ${Math.abs(value).toFixed(2)}`;
}

function formatPercent(value) {
  const sign = value >= 0 ? '' : '-';
  return `${sign}${Math.abs(value).toFixed(2)}%`;
}

function buildTicks(min, max) {
  const step = (max - min) / 3 || 1;
  return [max, max - step, max - step * 2, min].map((tick) => {
    const rounded = Math.abs(tick) >= 10 ? tick.toFixed(0) : tick.toFixed(1);
    return rounded.replace(/\.0$/, '');
  });
}

function smoothCurvePath(points) {
  if (points.length < 2) {
    return points.map(([x, y], i) => `${i === 0 ? 'M' : 'L'} ${x.toFixed(2)} ${y.toFixed(2)}`).join(' ');
  }

  const tension = 0.35;
  let d = `M ${points[0][0].toFixed(2)} ${points[0][1].toFixed(2)}`;

  for (let i = 1; i < points.length; i++) {
    const p0 = points[Math.max(0, i - 2)];
    const p1 = points[i - 1];
    const p2 = points[i];
    const p3 = points[Math.min(points.length - 1, i + 1)];

    const cp1x = p1[0] + (p2[0] - p0[0]) * tension;
    const cp1y = p1[1] + (p2[1] - p0[1]) * tension;
    const cp2x = p2[0] - (p3[0] - p1[0]) * tension;
    const cp2y = p2[1] - (p3[1] - p1[1]) * tension;

    d += ` C ${cp1x.toFixed(2)} ${cp1y.toFixed(2)}, ${cp2x.toFixed(2)} ${cp2y.toFixed(2)}, ${p2[0].toFixed(2)} ${p2[1].toFixed(2)}`;
  }

  return d;
}

function buildLinePath(values, width, height, padding) {
  const min = Math.min(...values);
  const max = Math.max(...values);
  const xStep = (width - padding * 2) / (values.length - 1 || 1);
  const safeRange = max - min || 1;

  const points = values.map((value, index) => {
    const x = padding + xStep * index;
    const y = height - padding - ((value - min) / safeRange) * (height - padding * 2);
    return [x, y];
  });

  const linePath = smoothCurvePath(points);

  const firstPoint = points[0];
  const lastPoint = points[points.length - 1];
  const areaPath = `${linePath} L ${lastPoint[0].toFixed(2)} ${(height - padding).toFixed(2)} L ${firstPoint[0].toFixed(2)} ${(height - padding).toFixed(2)} Z`;

  const gridYPositions = [0, 1, 2, 3].map((i) => {
    return padding + (i / 3) * (height - padding * 2);
  });

  return {
    linePath,
    areaPath,
    min,
    max,
    gridYPositions,
    chartWidth: width,
    padding,
  };
}

function renderLabels(container, className, labels) {
  container.innerHTML = labels.map((label) => `<span class="${className}">${label}</span>`).join('');
}

function updateDeltaClasses(element, value) {
  element.classList.remove('is-up', 'is-down');
  element.classList.add(value >= 0 ? 'is-up' : 'is-down');
}

function renderChart(card, seriesName, rangeKey) {
  const series = getSeriesData(card);
  const dataset = series.ranges[rangeKey];

  if (!dataset) return;

  const price = dataset.values[dataset.values.length - 1];
  const previous = dataset.values[dataset.values.length - 2] ?? price;
  const delta = price - previous;
  const percent = previous === 0 ? 0 : (delta / previous) * 100;
  const { linePath, areaPath, min, max, gridYPositions, chartWidth, padding } = buildLinePath(dataset.values, 220, 120, 10);

  const priceNode = card.querySelector('[data-chart-price]');
  const deltaNode = card.querySelector('[data-chart-delta]');
  const percentNode = card.querySelector('[data-chart-percent]');
  const dateNode = card.querySelector('[data-chart-date]');
  const areaNode = card.querySelector('[data-chart-area]');
  const lineNode = card.querySelector('[data-chart-line]');
  const yAxisNode = card.querySelector('[data-chart-y-axis]');
  const xAxisNode = card.querySelector('[data-chart-x-axis]');
  const svgNode = card.querySelector('[data-chart-svg]');

  priceNode.textContent = formatMoney(price);
  deltaNode.textContent = formatDelta(delta);
  percentNode.textContent = formatPercent(percent);
  dateNode.textContent = dataset.date;

  updateDeltaClasses(deltaNode, delta);
  updateDeltaClasses(percentNode, delta);

  areaNode.setAttribute('d', areaPath);
  lineNode.setAttribute('d', linePath);
  areaNode.style.fill = series.fill;
  svgNode.style.setProperty('--chart-fill', series.fill);

  // Dashed horizontal grid lines
  let gridGroup = svgNode.querySelector('[data-chart-grid]');
  if (!gridGroup) {
    gridGroup = document.createElementNS('http://www.w3.org/2000/svg', 'g');
    gridGroup.setAttribute('data-chart-grid', '');
    svgNode.insertBefore(gridGroup, areaNode);
  }
  gridGroup.innerHTML = gridYPositions
    .map(
      (y) =>
        `<line x1="${padding}" y1="${y.toFixed(2)}" x2="${(chartWidth - padding).toFixed(2)}" y2="${y.toFixed(2)}" stroke="rgba(0,0,0,0.08)" stroke-width="1" stroke-dasharray="4 3"/>`,
    )
    .join('');

  renderLabels(yAxisNode, 'market-card-y-tick', buildTicks(min, max));
  renderLabels(xAxisNode, 'market-card-x-tick', dataset.labels);

  card.querySelectorAll('[data-range]').forEach((button) => {
    const isActive = button.dataset.range === rangeKey;
    button.classList.toggle('is-active', isActive);
    button.setAttribute('aria-pressed', String(isActive));
  });
}

function bindCard(card) {
  const seriesName = card.dataset.series;
  const defaultRange = card.dataset.defaultRange || '1m';

  card.querySelectorAll('[data-range]').forEach((button) => {
    button.addEventListener('click', function () {
      renderChart(card, seriesName, button.dataset.range);
    });
  });

  renderChart(card, seriesName, defaultRange);
}

export default function initCharts() {
  const cards = document.querySelectorAll('[data-chart-card]');

  if (!cards.length) {
    return;
  }

  cards.forEach(bindCard);
}
