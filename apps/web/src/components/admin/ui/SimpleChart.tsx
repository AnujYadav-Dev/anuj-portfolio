'use client';

import React, { useState } from 'react';
import { cn } from '@/lib/cn';

// ──────────────────────────────────────────────
// 1. Time Series Area & Line Chart
// ──────────────────────────────────────────────

export interface TimeSeriesPoint {
  date: string;
  pageViews: number;
  uniqueVisitors: number;
}

interface TimeSeriesChartProps {
  data: TimeSeriesPoint[];
  height?: number;
  className?: string;
}

export function TimeSeriesChart({ data, height = 240, className }: TimeSeriesChartProps) {
  const [hoverIndex, setHoverIndex] = useState<number | null>(null);

  if (!data || data.length === 0) {
    return (
      <div
        className={cn('flex items-center justify-center text-xs text-muted font-mono', className)}
        style={{ height }}
      >
        No telemetry trend data available for this timeframe
      </div>
    );
  }

  const maxViews = Math.max(...data.map((d) => Math.max(d.pageViews, d.uniqueVisitors, 1)));
  const yTicks = [maxViews, Math.round(maxViews * 0.66), Math.round(maxViews * 0.33), 0];

  const svgWidth = 800;
  const svgHeight = height;
  const padding = { top: 20, right: 20, bottom: 30, left: 45 };
  const graphWidth = svgWidth - padding.left - padding.right;
  const graphHeight = svgHeight - padding.top - padding.bottom;

  const pointsViews = data.map((d, i) => {
    const x = padding.left + (i / (data.length - 1 || 1)) * graphWidth;
    const y = padding.top + graphHeight - (d.pageViews / maxViews) * graphHeight;
    return { x, y, data: d };
  });

  const pointsVisitors = data.map((d, i) => {
    const x = padding.left + (i / (data.length - 1 || 1)) * graphWidth;
    const y = padding.top + graphHeight - (d.uniqueVisitors / maxViews) * graphHeight;
    return { x, y, data: d };
  });

  const pathViews = pointsViews.reduce(
    (acc, p, i) => `${acc} ${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`,
    '',
  );

  const areaViews = `${pathViews} L ${pointsViews[pointsViews.length - 1]?.x || 0} ${
    padding.top + graphHeight
  } L ${pointsViews[0]?.x || 0} ${padding.top + graphHeight} Z`;

  const pathVisitors = pointsVisitors.reduce(
    (acc, p, i) => `${acc} ${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`,
    '',
  );

  const hoverPointViews = hoverIndex !== null ? pointsViews[hoverIndex] : null;
  const hoverPointVisitors = hoverIndex !== null ? pointsVisitors[hoverIndex] : null;

  return (
    <div className={cn('relative w-full overflow-hidden select-none', className)}>
      <svg
        viewBox={`0 0 ${svgWidth} ${svgHeight}`}
        className="w-full h-auto overflow-visible"
        style={{ maxHeight: height }}
      >
        <defs>
          <linearGradient id="areaGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="var(--color-accent, #ff8c42)" stopOpacity="0.25" />
            <stop offset="100%" stopColor="var(--color-accent, #ff8c42)" stopOpacity="0.0" />
          </linearGradient>
        </defs>

        {/* Grid Lines */}
        {yTicks.map((tick, i) => {
          const y = padding.top + (i / (yTicks.length - 1)) * graphHeight;
          return (
            <g key={i}>
              <line
                x1={padding.left}
                y1={y}
                x2={svgWidth - padding.right}
                y2={y}
                stroke="var(--color-border, #262626)"
                strokeDasharray="3 3"
                strokeWidth="1"
              />
              <text
                x={padding.left - 8}
                y={y + 3}
                fill="var(--color-placeholder, #666666)"
                fontSize="10"
                fontFamily="monospace"
                textAnchor="end"
              >
                {tick}
              </text>
            </g>
          );
        })}

        {/* Area fill for Page Views */}
        <path d={areaViews} fill="url(#areaGradient)" />

        {/* Line for Page Views (Accent Warm Orange) */}
        <path
          d={pathViews}
          fill="none"
          stroke="var(--color-accent, #ff8c42)"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {/* Line for Unique Visitors (White / Muted) */}
        <path
          d={pathVisitors}
          fill="none"
          stroke="var(--color-foreground, #ffffff)"
          strokeWidth="1.5"
          strokeDasharray="4 4"
          strokeLinecap="round"
          strokeLinejoin="round"
          opacity="0.8"
        />

        {/* Hover Highlight Marker */}
        {hoverPointViews && hoverPointVisitors && (
          <g>
            <line
              x1={hoverPointViews.x}
              y1={padding.top}
              x2={hoverPointViews.x}
              y2={padding.top + graphHeight}
              stroke="var(--color-border, #262626)"
              strokeWidth="1"
            />
            <circle
              cx={hoverPointViews.x}
              cy={hoverPointViews.y}
              r="4.5"
              fill="var(--color-accent, #ff8c42)"
              stroke="var(--color-background, #000)"
              strokeWidth="2"
            />
            <circle
              cx={hoverPointVisitors.x}
              cy={hoverPointVisitors.y}
              r="3.5"
              fill="var(--color-foreground, #fff)"
              stroke="var(--color-background, #000)"
              strokeWidth="1.5"
            />
          </g>
        )}

        {/* Invisible Overlay for Mouse Tracking */}
        {pointsViews.map((p, i) => (
          <rect
            key={i}
            x={p.x - graphWidth / (data.length * 2)}
            y={padding.top}
            width={graphWidth / data.length}
            height={graphHeight}
            fill="transparent"
            className="cursor-crosshair"
            onMouseEnter={() => setHoverIndex(i)}
            onMouseLeave={() => setHoverIndex(null)}
          />
        ))}

        {/* X-axis date labels */}
        {data.map((d, i) => {
          if (data.length > 10 && i % Math.ceil(data.length / 7) !== 0) return null;
          const x = padding.left + (i / (data.length - 1 || 1)) * graphWidth;
          return (
            <text
              key={i}
              x={x}
              y={svgHeight - 8}
              fill="var(--color-placeholder, #666666)"
              fontSize="10"
              fontFamily="monospace"
              textAnchor="middle"
            >
              {d.date.includes(':') ? d.date : d.date.substring(5)}
            </text>
          );
        })}
      </svg>

      {/* Hover Tooltip Box */}
      {hoverIndex !== null && data[hoverIndex] && (
        <div className="absolute top-2 right-4 bg-surface border border-border px-3 py-2 rounded-lg shadow-xl text-xs font-mono z-10 pointer-events-none">
          <p className="text-muted font-bold mb-1">{data[hoverIndex]?.date}</p>
          <div className="flex items-center gap-2 text-accent">
            <span className="w-2 h-2 rounded-full bg-accent" />
            <span>Views: {data[hoverIndex]?.pageViews}</span>
          </div>
          <div className="flex items-center gap-2 text-foreground">
            <span className="w-2 h-2 rounded-full bg-foreground" />
            <span>Visitors: {data[hoverIndex]?.uniqueVisitors}</span>
          </div>
        </div>
      )}

      {/* Legend */}
      <div className="flex items-center justify-end gap-5 mt-2 text-[11px] font-mono">
        <div className="flex items-center gap-1.5 text-accent">
          <span className="w-3 h-0.5 bg-accent rounded" />
          <span>Page Views</span>
        </div>
        <div className="flex items-center gap-1.5 text-muted">
          <span className="w-3 h-0.5 bg-foreground border-dashed rounded" />
          <span>Unique Visitors</span>
        </div>
      </div>
    </div>
  );
}

// ──────────────────────────────────────────────
// 2. Horizontal Distribution Bar List
// ──────────────────────────────────────────────

export interface DistributionItem {
  name: string;
  count: number;
  percentage: number;
}

interface DistributionBarProps {
  items: DistributionItem[];
  emptyMessage?: string;
}

export function DistributionBarList({
  items,
  emptyMessage = 'No telemetry data recorded',
}: DistributionBarProps) {
  if (!items || items.length === 0) {
    return <p className="text-xs text-placeholder italic py-4">{emptyMessage}</p>;
  }

  return (
    <div className="space-y-3">
      {items.map((item) => (
        <div key={item.name} className="space-y-1">
          <div className="flex items-center justify-between text-xs font-mono">
            <span className="text-foreground font-medium truncate max-w-[200px]">{item.name}</span>
            <span className="text-muted">
              <strong className="text-foreground">{item.count.toLocaleString()}</strong> (
              {item.percentage}%)
            </span>
          </div>
          <div className="h-1.5 w-full bg-surface-muted rounded-full overflow-hidden">
            <div
              className="h-full bg-accent rounded-full transition-all duration-500"
              style={{ width: `${Math.min(100, Math.max(2, item.percentage))}%` }}
            />
          </div>
        </div>
      ))}
    </div>
  );
}

// ──────────────────────────────────────────────
// 3. Compact Metric Sparkline
// ──────────────────────────────────────────────

export function Sparkline({
  data,
  width = 80,
  height = 24,
}: {
  data: number[];
  width?: number;
  height?: number;
}) {
  if (!data || data.length < 2) return null;

  const min = Math.min(...data);
  const max = Math.max(...data, 1);
  const range = max - min || 1;

  const points = data.map((val, i) => {
    const x = (i / (data.length - 1)) * width;
    const y = height - ((val - min) / range) * (height - 4) - 2;
    return `${x},${y}`;
  });

  return (
    <svg width={width} height={height} className="overflow-visible inline-block">
      <polyline
        fill="none"
        stroke="var(--color-accent, #ff8c42)"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        points={points.join(' ')}
      />
    </svg>
  );
}
