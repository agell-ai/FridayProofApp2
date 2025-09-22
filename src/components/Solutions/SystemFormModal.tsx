import React, { useEffect, useMemo, useState } from 'react';
import { X, Wrench } from 'lucide-react';
import { Button } from '../Shared/Button';
import type { Project, System } from '../../types';

export interface SystemFormValues {
  systemId?: string;
  projectId: string;
  name: string;
  description: string;
  type: System['type'];
  status: System['status'];
  businessImpact: string;
}

interface SystemFormModalProps {
  isOpen: boolean;
  mode: 'create' | 'edit';
  projects: Project[];
  initialValues?: SystemFormValues;
  onClose: () => void;
  onSubmit: (values: SystemFormValues) => void;
}

const fieldClassName =
  'w-full rounded-lg border border-[var(--border)] bg-[var(--surface)] px-3 py-2 text-sm text-[var(--fg)] focus:outline-none focus:ring-2 focus:ring-[var(--accent-purple)] focus:border-transparent transition';

const labelClassName = 'text-xs font-medium uppercase tracking-wide text-[var(--fg-muted)]';

const SystemFormModal: React.FC<SystemFormModalProps> = ({
  isOpen,
  mode,
  projects,
  initialValues,
  onClose,
  onSubmit,
}) => {
  const defaultProjectId = useMemo(() => initialValues?.projectId || projects[0]?.id || '', [initialValues?.projectId, projects]);

  const [formValues, setFormValues] = useState<SystemFormValues>({
    systemId: initialValues?.systemId,
    projectId: defaultProjectId,
    name: initialValues?.name || '',
    description: initialValues?.description || '',
    type: initialValues?.type || 'automation',
    status: initialValues?.status || 'development',
    businessImpact: initialValues?.businessImpact || '',
  });

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    setFormValues({
      systemId: initialValues?.systemId,
      projectId: initialValues?.projectId || projects[0]?.id || '',
      name: initialValues?.name || '',
      description: initialValues?.description || '',
      type: initialValues?.type || 'automation',
      status: initialValues?.status || 'development',
      businessImpact: initialValues?.businessImpact || '',
    });
  }, [initialValues, isOpen, projects]);

  if (!isOpen) {
    return null;
  }

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!formValues.projectId) {
      return;
    }

    onSubmit({ ...formValues, businessImpact: formValues.businessImpact.trim() });
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4 py-6"
      role="dialog"
      aria-modal="true"
      aria-labelledby="system-form-title"
      onClick={onClose}
    >
      <div
        className="w-full max-w-2xl overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--card)] shadow-2xl"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex items-center justify-between gap-4 border-b border-[var(--border)] bg-[var(--surface)]/70 px-6 py-4">
          <div className="flex items-center gap-2">
            <Wrench className="h-5 w-5 text-[var(--fg-muted)]" />
            <div>
              <h2 id="system-form-title" className="text-lg font-semibold text-[var(--fg)]">
                {mode === 'create' ? 'Create system' : 'Edit system'}
              </h2>
              <p className="text-sm text-[var(--fg-muted)]">
                Define how this system operates within its project workspace.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full p-2 text-[var(--fg-muted)] transition hover:bg-[var(--surface)] hover:text-[var(--fg)]"
            aria-label="Close system form"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <form className="space-y-5 p-6" onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <label className="space-y-1">
              <span className={labelClassName}>Project</span>
              <select
                className={fieldClassName}
                value={formValues.projectId}
                onChange={(event) =>
                  setFormValues((prev) => ({ ...prev, projectId: event.target.value }))
                }
                disabled={mode === 'edit'}
                required
              >
                {projects.map((project) => (
                  <option key={project.id} value={project.id}>
                    {project.name}
                  </option>
                ))}
              </select>
            </label>

            <label className="space-y-1">
              <span className={labelClassName}>Status</span>
              <select
                className={fieldClassName}
                value={formValues.status}
                onChange={(event) =>
                  setFormValues((prev) => ({ ...prev, status: event.target.value as System['status'] }))
                }
              >
                {['design', 'development', 'testing', 'active', 'inactive'].map((status) => (
                  <option key={status} value={status}>
                    {status.charAt(0).toUpperCase() + status.slice(1)}
                  </option>
                ))}
              </select>
            </label>

            <label className="space-y-1">
              <span className={labelClassName}>System name</span>
              <input
                className={fieldClassName}
                value={formValues.name}
                onChange={(event) =>
                  setFormValues((prev) => ({ ...prev, name: event.target.value }))
                }
                placeholder="Invoice processing engine"
                required
              />
            </label>

            <label className="space-y-1">
              <span className={labelClassName}>System type</span>
              <select
                className={fieldClassName}
                value={formValues.type}
                onChange={(event) =>
                  setFormValues((prev) => ({ ...prev, type: event.target.value as System['type'] }))
                }
              >
                {['automation', 'workflow', 'integration', 'ai-model'].map((type) => (
                  <option key={type} value={type}>
                    {type.replace('-', ' ')}
                  </option>
                ))}
              </select>
            </label>
          </div>

          <label className="space-y-1">
            <span className={labelClassName}>Description</span>
            <textarea
              className={`${fieldClassName} min-h-[120px]`}
              value={formValues.description}
              onChange={(event) =>
                setFormValues((prev) => ({ ...prev, description: event.target.value }))
              }
              placeholder="Describe the primary workflow and value this system delivers."
              required
            />
          </label>

          <label className="space-y-1">
            <span className={labelClassName}>Business impact</span>
            <textarea
              className={`${fieldClassName} min-h-[100px]`}
              value={formValues.businessImpact}
              onChange={(event) =>
                setFormValues((prev) => ({ ...prev, businessImpact: event.target.value }))
              }
              placeholder="Share the measurable impact this system creates for the team or client."
            />
          </label>

          <div className="flex items-center justify-end gap-3">
            <Button type="button" variant="ghost" size="sm" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" size="sm" glowOnHover>
              {mode === 'create' ? 'Create system' : 'Save changes'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SystemFormModal;
