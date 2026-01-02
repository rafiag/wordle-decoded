import React from 'react';

/**
 * Flexible, reusable tooltip component for Recharts
 * Eliminates duplication across BoldDifficultySection, BoldSentimentSection, BoldTrapsSection
 */

export interface ChartTooltipProps<T = any> {
  active?: boolean;
  payload?: T[];
  label?: string;
  title?: string;
  renderHeader?: (data: any) => React.ReactNode;
  renderRow: (entry: T, index: number) => React.ReactNode;
  className?: string;
}

export function ChartTooltip<T = any>({
  active,
  payload,
  label,
  title,
  renderHeader,
  renderRow,
  className = '',
}: ChartTooltipProps<T>) {
  if (!active || !payload?.length) return null;

  return (
    <div
      className={`bg-[var(--bg-card)] border border-[var(--border-color)] p-3 rounded shadow-lg min-w-[200px] ${className}`}
    >
      {/* Title/Label */}
      {(title || label) && (
        <p className="font-bold text-[var(--text-primary)] mb-1">
          {title ?? label}
        </p>
      )}

      {/* Optional custom header (for extra info like word, total, etc.) */}
      {renderHeader && renderHeader(payload[0])}

      {/* Render each payload entry using the custom render function */}
      {payload.map(renderRow)}
    </div>
  );
}

/**
 * Preset: Standard tooltip for guess distribution charts
 * Shows percentages with color-coded labels
 */
interface GuessDistributionTooltipEntry {
  value: number;
  name: string;
  color: string;
  payload: {
    word_solution?: string;
    [key: string]: any;
  };
}

export function GuessDistributionTooltip({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: GuessDistributionTooltipEntry[];
  label?: string;
}) {
  if (!active || !payload?.length) return null;

  const total = payload.reduce((sum, entry) => sum + (entry.value || 0), 0);
  const data = payload[0].payload;

  return (
    <ChartTooltip
      active={active}
      payload={payload}
      label={label}
      renderHeader={() => (
        <div className="mb-3 text-xs text-[var(--text-secondary)] border-b border-[var(--border-color)] pb-2">
          <div className="flex justify-between">
            <span>Solution:</span>
            <span className="font-bold text-[var(--text-primary)] uppercase">
              {data.word_solution || 'N/A'}
            </span>
          </div>
          <div className="flex justify-between mt-1">
            <span>Total data:</span>
            <span className="font-mono text-[var(--text-primary)]">
              {total.toLocaleString()}
            </span>
          </div>
        </div>
      )}
      renderRow={(entry, index) => {
        const percentage = total > 0 ? ((entry.value / total) * 100).toFixed(1) : '0.0';
        return (
          <div key={index} className="text-sm flex justify-between gap-4">
            <span style={{ color: entry.color }}>{entry.name}:</span>
            <span className="font-mono text-[var(--text-primary)]">
              {percentage}%
            </span>
          </div>
        );
      }}
    />
  );
}

/**
 * Preset: Standard tooltip for sentiment charts
 * Shows sentiment counts with color-coded labels
 */
interface SentimentTooltipEntry {
  name: string;
  value: number;
  color: string;
  payload: {
    date?: string;
    total_tweets?: number;
    [key: string]: any;
  };
}

export function SentimentTooltip({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: SentimentTooltipEntry[];
  label?: string;
}) {
  if (!active || !payload?.length) return null;

  const data = payload[0].payload;
  const total = data.total_tweets || 0;

  return (
    <ChartTooltip
      active={active}
      payload={payload}
      label={label}
      renderHeader={() => (
        <div className="mb-2 text-xs text-[var(--text-secondary)] border-b border-[var(--border-color)] pb-2">
          <div className="flex justify-between">
            <span>Total Tweets:</span>
            <span className="font-mono text-[var(--text-primary)]">
              {total.toLocaleString()}
            </span>
          </div>
        </div>
      )}
      renderRow={(entry, index) => (
        <div key={index} className="text-sm flex justify-between gap-4 items-center">
          <div className="flex items-center gap-2">
            <div
              className="w-3 h-3 rounded-sm"
              style={{ backgroundColor: entry.color }}
            />
            <span className="text-[var(--text-secondary)]">{entry.name}</span>
          </div>
          <span className="font-mono text-[var(--text-primary)]">
            {entry.value}
          </span>
        </div>
      )}
    />
  );
}

/**
 * Preset: Tooltip for trap words bar chart
 * Shows trap score with color-coded bar
 */
interface TrapTooltipEntry {
  name: string;
  value: number;
  color: string;
  payload: {
    word?: string;
    trap_score?: number;
    neighbor_count?: number;
    [key: string]: any;
  };
}

export function TrapTooltip({
  active,
  payload,
}: {
  active?: boolean;
  payload?: TrapTooltipEntry[];
}) {
  if (!active || !payload?.length) return null;

  const data = payload[0].payload;

  return (
    <div className="bg-[var(--bg-card)] border border-[var(--border-color)] p-3 rounded shadow-lg min-w-[180px]">
      <p className="font-bold text-[var(--text-primary)] mb-2 uppercase tracking-wide text-sm">
        {data.word || 'N/A'}
      </p>
      <div className="text-xs text-[var(--text-secondary)] space-y-1">
        <div className="flex justify-between">
          <span>Trap Score:</span>
          <span className="font-mono font-bold" style={{ color: payload[0].color }}>
            {data.trap_score?.toFixed(1) || '0.0'}
          </span>
        </div>
        {data.neighbor_count !== undefined && (
          <div className="flex justify-between">
            <span>Neighbors:</span>
            <span className="font-mono text-[var(--text-primary)]">
              {data.neighbor_count}
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
