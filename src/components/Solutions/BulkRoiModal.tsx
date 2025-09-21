import React from 'react';
import { X, Upload } from 'lucide-react';

interface BulkRoiModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImport: (event: React.ChangeEvent<HTMLInputElement>) => void;
  feedback?: string;
}

const BulkRoiModal: React.FC<BulkRoiModalProps> = ({ isOpen, onClose, onImport, feedback }) => {
  if (!isOpen) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[var(--fg)]/10 backdrop-blur-sm p-4">
      <div className="w-full max-w-xl bg-[var(--card)] border border-[var(--border)] rounded-2xl shadow-xl overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-[var(--border)] bg-[var(--card)]/90 backdrop-blur">
          <div>
            <h2 className="text-lg font-semibold text-[var(--fg)]">Bulk ROI Import</h2>
            <p className="text-sm text-[var(--fg-muted)]">Drop in CSV exports to update adoption, efficiency, and savings metrics.</p>
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

        <div className="px-6 py-5 space-y-4">
          <div className="rounded-lg border border-dashed border-[var(--border)] bg-[var(--surface)]/40 p-5 text-sm text-[var(--fg-muted)]">
            <p className="font-medium text-[var(--fg)]">Expected columns</p>
            <p className="mt-1">resourceKey, costSavings, hoursSaved, revenueGenerated, adoptionRate, efficiencyGain</p>
          </div>

          <label className="flex w-full cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border border-[var(--border)] bg-[var(--surface)]/60 px-4 py-8 text-sm font-medium text-[var(--fg-muted)] hover:text-[var(--fg)]">
            <Upload className="h-5 w-5" />
            Upload CSV
            <input type="file" accept=".csv" className="hidden" onChange={onImport} />
          </label>

          {feedback && <p className="text-sm text-[var(--fg-muted)]">{feedback}</p>}
        </div>
      </div>
    </div>
  );
};

export default BulkRoiModal;
