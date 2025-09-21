import React from 'react';
import { X, BarChart3 } from 'lucide-react';

export interface ResourceOption {
  key: string;
  label: string;
}

export interface ManualMetricsState {
  costSavings: string;
  hoursSaved: string;
  revenueGenerated: string;
  adoptionRate: string;
  efficiencyGain: string;
}

interface ManualRoiModalProps {
  isOpen: boolean;
  onClose: () => void;
  resourceOptions: ResourceOption[];
  selectedResourceKey: string;
  onSelectResource: (key: string) => void;
  metrics: ManualMetricsState;
  onChange: (field: keyof ManualMetricsState, value: string) => void;
  onSubmit: (event: React.FormEvent<HTMLFormElement>) => void;
}

const ManualRoiModal: React.FC<ManualRoiModalProps> = ({
  isOpen,
  onClose,
  resourceOptions,
  selectedResourceKey,
  onSelectResource,
  metrics,
  onChange,
  onSubmit,
}) => {
  if (!isOpen) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[var(--fg)]/10 backdrop-blur-sm p-4">
      <div className="w-full max-w-2xl bg-[var(--card)] border border-[var(--border)] rounded-2xl shadow-xl overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-[var(--border)] bg-[var(--card)]/90 backdrop-blur">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[var(--accent-orange)] via-[var(--accent-pink)] to-[var(--accent-purple)] text-white flex items-center justify-center">
              <BarChart3 className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-[var(--fg)]">Manual ROI Update</h2>
              <p className="text-sm text-[var(--fg-muted)]">Capture verified financial impact metrics for any active system.</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-full text-[var(--fg-muted)] hover:text-[var(--fg)] hover:bg-[var(--surface)] transition"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={onSubmit} className="px-6 py-5 space-y-4">
          <div>
            <label className="block text-sm font-medium text-[var(--fg-muted)]">Resource</label>
            <select
              className="mt-1 w-full rounded-lg border border-[var(--border)] bg-[var(--surface)] px-3 py-2 text-sm text-[var(--fg)] focus:outline-none focus:ring-2 focus:ring-[var(--accent-purple)]"
              value={selectedResourceKey}
              onChange={(event) => onSelectResource(event.target.value)}
            >
              {resourceOptions.map((option) => (
                <option key={option.key} value={option.key}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-[var(--fg-muted)]">Cost Savings ($)</label>
              <input
                className="mt-1 w-full rounded-lg border border-[var(--border)] bg-[var(--surface)] px-3 py-2 text-sm text-[var(--fg)] focus:outline-none focus:ring-2 focus:ring-[var(--accent-purple)]"
                value={metrics.costSavings}
                onChange={(event) => onChange('costSavings', event.target.value)}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-[var(--fg-muted)]">Hours Saved</label>
              <input
                className="mt-1 w-full rounded-lg border border-[var(--border)] bg-[var(--surface)] px-3 py-2 text-sm text-[var(--fg)] focus:outline-none focus:ring-2 focus:ring-[var(--accent-purple)]"
                value={metrics.hoursSaved}
                onChange={(event) => onChange('hoursSaved', event.target.value)}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-[var(--fg-muted)]">Revenue Generated ($)</label>
              <input
                className="mt-1 w-full rounded-lg border border-[var(--border)] bg-[var(--surface)] px-3 py-2 text-sm text-[var(--fg)] focus:outline-none focus:ring-2 focus:ring-[var(--accent-purple)]"
                value={metrics.revenueGenerated}
                onChange={(event) => onChange('revenueGenerated', event.target.value)}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-[var(--fg-muted)]">Adoption Rate (%)</label>
              <input
                className="mt-1 w-full rounded-lg border border-[var(--border)] bg-[var(--surface)] px-3 py-2 text-sm text-[var(--fg)] focus:outline-none focus:ring-2 focus:ring-[var(--accent-purple)]"
                value={metrics.adoptionRate}
                onChange={(event) => onChange('adoptionRate', event.target.value)}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-[var(--fg-muted)]">Efficiency Gain (%)</label>
              <input
                className="mt-1 w-full rounded-lg border border-[var(--border)] bg-[var(--surface)] px-3 py-2 text-sm text-[var(--fg)] focus:outline-none focus:ring-2 focus:ring-[var(--accent-purple)]"
                value={metrics.efficiencyGain}
                onChange={(event) => onChange('efficiencyGain', event.target.value)}
              />
            </div>
          </div>

          <div className="flex justify-end">
            <button
              type="submit"
              className="rounded-lg bg-gradient-to-r from-[var(--accent-orange)] via-[var(--accent-pink)] to-[var(--accent-purple)] px-4 py-2 text-sm font-semibold text-white shadow-sm"
            >
              Save Metrics
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ManualRoiModal;
