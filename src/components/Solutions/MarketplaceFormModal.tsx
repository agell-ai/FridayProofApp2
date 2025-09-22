import React, { useEffect, useMemo, useState } from 'react';
import { ShoppingBag, X } from 'lucide-react';
import { Button } from '../Shared/Button';
import type { Client } from '../../types';

export interface MarketplaceFormValues {
  itemId?: string;
  clientId: string;
  name: string;
  type: string;
  category: string;
  description?: string;
  downloads?: number;
  rating?: number;
  templateId?: string;
}

interface MarketplaceFormModalProps {
  isOpen: boolean;
  mode: 'create' | 'edit';
  clients: Client[];
  initialValues?: MarketplaceFormValues;
  onClose: () => void;
  onSubmit: (values: MarketplaceFormValues) => void;
}

const inputClassName =
  'w-full rounded-lg border border-[var(--border)] bg-[var(--surface)] px-3 py-2 text-sm text-[var(--fg)] focus:outline-none focus:ring-2 focus:ring-[var(--accent-purple)] focus:border-transparent transition';

const labelClassName = 'text-xs font-medium uppercase tracking-wide text-[var(--fg-muted)]';

const MarketplaceFormModal: React.FC<MarketplaceFormModalProps> = ({
  isOpen,
  mode,
  clients,
  initialValues,
  onClose,
  onSubmit,
}) => {
  const defaultClientId = useMemo(() => initialValues?.clientId || clients[0]?.id || '', [clients, initialValues?.clientId]);

  const [formValues, setFormValues] = useState<MarketplaceFormValues>({
    itemId: initialValues?.itemId,
    templateId: initialValues?.templateId,
    clientId: defaultClientId,
    name: initialValues?.name || '',
    type: initialValues?.type || 'template',
    category: initialValues?.category || '',
    description: initialValues?.description || '',
    downloads: initialValues?.downloads ?? 0,
    rating: initialValues?.rating ?? 5,
  });

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    setFormValues({
      itemId: initialValues?.itemId,
      templateId: initialValues?.templateId,
      clientId: initialValues?.clientId || clients[0]?.id || '',
      name: initialValues?.name || '',
      type: initialValues?.type || 'template',
      category: initialValues?.category || '',
      description: initialValues?.description || '',
      downloads: initialValues?.downloads ?? 0,
      rating: initialValues?.rating ?? 5,
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

    onSubmit({
      ...formValues,
      description: formValues.description?.trim() || undefined,
      downloads: formValues.downloads ?? 0,
      rating: formValues.rating ?? 0,
    });
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4 py-6"
      role="dialog"
      aria-modal="true"
      aria-labelledby="marketplace-form-title"
      onClick={onClose}
    >
      <div
        className="w-full max-w-2xl overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--card)] shadow-2xl"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex items-center justify-between gap-4 border-b border-[var(--border)] bg-[var(--surface)]/70 px-6 py-4">
          <div className="flex items-center gap-2">
            <ShoppingBag className="h-5 w-5 text-[var(--fg-muted)]" />
            <div>
              <h2 id="marketplace-form-title" className="text-lg font-semibold text-[var(--fg)]">
                {mode === 'create' ? 'Create marketplace asset' : 'Edit marketplace asset'}
              </h2>
              <p className="text-sm text-[var(--fg-muted)]">
                Publish automation assets for agencies and operators to deploy.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full p-2 text-[var(--fg-muted)] transition hover:bg-[var(--surface)] hover:text-[var(--fg)]"
            aria-label="Close marketplace form"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <form className="space-y-5 p-6" onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <label className="space-y-1">
              <span className={labelClassName}>Publisher</span>
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
              <span className={labelClassName}>Asset type</span>
              <input
                className={inputClassName}
                value={formValues.type}
                onChange={(event) =>
                  setFormValues((prev) => ({ ...prev, type: event.target.value }))
                }
                placeholder="Template"
              />
            </label>

            <label className="space-y-1">
              <span className={labelClassName}>Title</span>
              <input
                className={inputClassName}
                value={formValues.name}
                onChange={(event) =>
                  setFormValues((prev) => ({ ...prev, name: event.target.value }))
                }
                placeholder="AI onboarding workflow"
                required
              />
            </label>

            <label className="space-y-1">
              <span className={labelClassName}>Category</span>
              <input
                className={inputClassName}
                value={formValues.category}
                onChange={(event) =>
                  setFormValues((prev) => ({ ...prev, category: event.target.value }))
                }
                placeholder="Customer success"
                required
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
              placeholder="Share the value buyers receive when deploying this asset."
            />
          </label>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <label className="space-y-1">
              <span className={labelClassName}>Downloads</span>
              <input
                type="number"
                min="0"
                className={inputClassName}
                value={formValues.downloads ?? 0}
                onChange={(event) =>
                  setFormValues((prev) => ({ ...prev, downloads: Number(event.target.value) || 0 }))
                }
              />
            </label>

            <label className="space-y-1">
              <span className={labelClassName}>Rating</span>
              <input
                type="number"
                min="0"
                max="5"
                step="0.1"
                className={inputClassName}
                value={formValues.rating ?? 0}
                onChange={(event) =>
                  setFormValues((prev) => ({ ...prev, rating: Number(event.target.value) }))
                }
              />
            </label>
          </div>

          <div className="flex items-center justify-end gap-3">
            <Button type="button" variant="ghost" size="sm" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" size="sm" glowOnHover>
              {mode === 'create' ? 'Create listing' : 'Save changes'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default MarketplaceFormModal;
