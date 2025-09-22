import React, { useEffect, useState } from 'react';
import { X, FileText, Calendar, DollarSign } from 'lucide-react';
import { ClientInvoice } from '../../types';
import { Button } from '../Shared/Button';

export interface InvoiceFormValues {
  number: string;
  amount: number;
  dueDate: string;
  status: ClientInvoice['status'];
  paidDate?: string;
}

interface InvoiceFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (values: InvoiceFormValues) => void;
}

const inputClassName =
  'w-full rounded-lg border border-[var(--border)] bg-[var(--surface)] px-3 py-2 text-[var(--fg)] placeholder:text-[var(--fg-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--accent-purple)] focus:border-transparent transition';

const InvoiceFormModal: React.FC<InvoiceFormModalProps> = ({ isOpen, onClose, onSubmit }) => {
  const [formValues, setFormValues] = useState({
    number: '',
    amount: '',
    dueDate: '',
    status: 'pending' as ClientInvoice['status'],
    paidDate: '',
  });

  useEffect(() => {
    if (!isOpen) {
      setFormValues({ number: '', amount: '', dueDate: '', status: 'pending', paidDate: '' });
    }
  }, [isOpen]);

  if (!isOpen) {
    return null;
  }

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const numericAmount = Number(formValues.amount);
    const amount = Number.isNaN(numericAmount) ? 0 : Math.max(0, numericAmount);

    onSubmit({
      number: formValues.number.trim(),
      amount,
      dueDate: formValues.dueDate,
      status: formValues.status,
      paidDate: formValues.paidDate ? formValues.paidDate : undefined,
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[var(--fg)]/20 backdrop-blur-sm p-4">
      <div className="w-full max-w-lg rounded-2xl border border-[var(--border)] bg-[var(--card)] shadow-xl">
        <div className="flex items-center justify-between px-6 py-4 border-b border-[var(--border)]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[var(--accent-orange)] via-[var(--accent-pink)] to-[var(--accent-purple)] text-white flex items-center justify-center">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-[var(--fg)]">Create Invoice</h2>
              <p className="text-sm text-[var(--fg-muted)]">Capture billing details for this client engagement.</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-full text-[var(--fg-muted)] hover:text-[var(--fg)] hover:bg-[var(--surface)] transition"
            aria-label="Close invoice form"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 px-6 py-5">
          <div className="space-y-2">
            <label className="text-sm font-medium text-[var(--fg-muted)]">Invoice Number</label>
            <input
              className={inputClassName}
              value={formValues.number}
              onChange={(event) => setFormValues((prev) => ({ ...prev, number: event.target.value }))}
              placeholder="INV-2024-010"
              required
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <label className="text-sm font-medium text-[var(--fg-muted)]">Amount ($)</label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[var(--fg-muted)]" />
                <input
                  type="number"
                  min={0}
                  step="0.01"
                  className={`${inputClassName} pl-8`}
                  value={formValues.amount}
                  onChange={(event) => setFormValues((prev) => ({ ...prev, amount: event.target.value }))}
                  placeholder="25000"
                  required
                />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-[var(--fg-muted)]">Due Date</label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[var(--fg-muted)]" />
                <input
                  type="date"
                  className={`${inputClassName} pl-9`}
                  value={formValues.dueDate}
                  onChange={(event) => setFormValues((prev) => ({ ...prev, dueDate: event.target.value }))}
                  required
                />
              </div>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <label className="text-sm font-medium text-[var(--fg-muted)]">Status</label>
              <select
                className={inputClassName}
                value={formValues.status}
                onChange={(event) =>
                  setFormValues((prev) => ({ ...prev, status: event.target.value as ClientInvoice['status'] }))
                }
              >
                <option value="pending">Pending</option>
                <option value="paid">Paid</option>
                <option value="overdue">Overdue</option>
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-[var(--fg-muted)]">Paid Date (optional)</label>
              <input
                type="date"
                className={inputClassName}
                value={formValues.paidDate}
                onChange={(event) => setFormValues((prev) => ({ ...prev, paidDate: event.target.value }))}
                disabled={formValues.status !== 'paid'}
              />
            </div>
          </div>

          <div className="flex items-center justify-end gap-3">
            <Button type="button" variant="outline" onClick={onClose} className="px-4 py-2">
              Cancel
            </Button>
            <Button type="submit" variant="gradient" className="px-4 py-2 font-semibold gap-2">
              <FileText className="w-4 h-4" />
              Save Invoice
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default InvoiceFormModal;
