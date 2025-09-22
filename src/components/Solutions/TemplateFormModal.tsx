import React, { useEffect, useMemo, useState } from 'react';
import { FileText, X } from 'lucide-react';
import { Button } from '../Shared/Button';
import type { Client } from '../../types';

export interface TemplateFormValues {
  templateId?: string;
  clientId: string;
  name: string;
  category: string;
  usage: number;
  description?: string;
}

interface TemplateFormModalProps {
  isOpen: boolean;
  mode: 'create' | 'edit';
  clients: Client[];
  initialValues?: TemplateFormValues;
  onClose: () => void;
  onSubmit: (values: TemplateFormValues) => void;
}

const inputClassName =
  'w-full rounded-lg border border-[var(--border)] bg-[var(--surface)] px-3 py-2 text-sm text-[var(--fg)] focus:outline-none focus:ring-2 focus:ring-[var(--accent-purple)] focus:border-transparent transition';

const labelClassName = 'text-xs font-medium uppercase tracking-wide text-[var(--fg-muted)]';

const TemplateFormModal: React.FC<TemplateFormModalProps> = ({
  isOpen,
  mode,
  clients,
  initialValues,
  onClose,
  onSubmit,
}) => {
  const defaultClientId = useMemo(() => initialValues?.clientId || clients[0]?.id || '', [initialValues?.clientId, clients]);

  const [formValues, setFormValues] = useState<TemplateFormValues>({
    templateId: initialValues?.templateId,
    clientId: defaultClientId,
    name: initialValues?.name || '',
    category: initialValues?.category || '',
    usage: initialValues?.usage ?? 0,
    description: initialValues?.description || '',
  });

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    setFormValues({
      templateId: initialValues?.templateId,
      clientId: initialValues?.clientId || clients[0]?.id || '',
      name: initialValues?.name || '',
      category: initialValues?.category || '',
      usage: initialValues?.usage ?? 0,
      description: initialValues?.description || '',
    });
  }, [clients, initialValues, isOpen]);

  if (!isOpen) {
    return null;
  }

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!formValues.clientId) {
      return;
    }

    onSubmit({ ...formValues, description: formValues.description?.trim() || undefined });
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4 py-6"
      role="dialog"
      aria-modal="true"
      aria-labelledby="template-form-title"
      onClick={onClose}
    >
      <div
        className="w-full max-w-2xl overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--card)] shadow-2xl"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex items-center justify-between gap-4 border-b border-[var(--border)] bg-[var(--surface)]/70 px-6 py-4">
          <div className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-[var(--fg-muted)]" />
            <div>
              <h2 id="template-form-title" className="text-lg font-semibold text-[var(--fg)]">
                {mode === 'create' ? 'Create template' : 'Edit template'}
              </h2>
              <p className="text-sm text-[var(--fg-muted)]">
                Package your best workflows and automations for reuse.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full p-2 text-[var(--fg-muted)] transition hover:bg-[var(--surface)] hover:text-[var(--fg)]"
            aria-label="Close template form"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <form className="space-y-5 p-6" onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <label className="space-y-1">
              <span className={labelClassName}>Client / owner</span>
              <select
                className={inputClassName}
                value={formValues.clientId}
                onChange={(event) =>
                  setFormValues((prev) => ({ ...prev, clientId: event.target.value }))
                }
                required
              >
                {clients.map((client) => (
                  <option key={client.id} value={client.id}>
                    {client.companyName}
                  </option>
                ))}
              </select>
            </label>

            <label className="space-y-1">
              <span className={labelClassName}>Category</span>
              <input
                className={inputClassName}
                value={formValues.category}
                onChange={(event) =>
                  setFormValues((prev) => ({ ...prev, category: event.target.value }))
                }
                placeholder="Automation"
                required
              />
            </label>

            <label className="space-y-1">
              <span className={labelClassName}>Template name</span>
              <input
                className={inputClassName}
                value={formValues.name}
                onChange={(event) =>
                  setFormValues((prev) => ({ ...prev, name: event.target.value }))
                }
                placeholder="Onboarding workflow template"
                required
              />
            </label>

            <label className="space-y-1">
              <span className={labelClassName}>Usage</span>
              <input
                type="number"
                min="0"
                className={inputClassName}
                value={formValues.usage}
                onChange={(event) =>
                  setFormValues((prev) => ({ ...prev, usage: Number(event.target.value) || 0 }))
                }
              />
            </label>
          </div>

          <label className="space-y-1">
            <span className={labelClassName}>Description</span>
            <textarea
              className={`${inputClassName} min-h-[120px]`}
              value={formValues.description || ''}
              onChange={(event) =>
                setFormValues((prev) => ({ ...prev, description: event.target.value }))
              }
              placeholder="Explain the best use case for this template."
            />
          </label>

          <div className="flex items-center justify-end gap-3">
            <Button type="button" variant="ghost" size="sm" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" size="sm" glowOnHover>
              {mode === 'create' ? 'Create template' : 'Save changes'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default TemplateFormModal;
