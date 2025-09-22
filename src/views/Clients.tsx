import React, { useCallback, useEffect, useMemo, useState } from 'react';
import type { LucideIcon } from 'lucide-react';
import {
  Building2,
  CalendarClock,
  Filter,
  Plus,
  Search,
  Sparkles,
  Target,
  TrendingUp,
  Users,
} from 'lucide-react';

import ClientCard from '../components/Clients/ClientCard';
import ClientDetails from '../components/Clients/ClientDetails';
import { Card } from '../components/Shared/Card';
import { EntityFormModal, ClientFormValues, FormMode } from '../components/Shared/EntityFormModal';
import { useClients } from '../hooks/useClients';
import { useAuth } from '../hooks/useAuth';
import type { Client } from '../types';
import {
  DEFAULT_TIME_RANGE,
  DateRangeKey,
  getDateRange,
  getDateRangeLabel,
  isWithinTimeRange,
  timeRangeOptions,
} from '../utils/timeRanges';

type StatusFilterValue = 'all' | Client['status'];
type MetricKey = 'total' | 'active' | 'prospects' | 'advocates';

interface MetricDefinition {
  key: MetricKey;
  label: string;
  description: string;
  predicate: (client: Client) => boolean;
  icon: LucideIcon;
  accentClass: string;
}

interface ClientFormState {
  mode: FormMode;
  client: Client | null;
}

const statusOrder: Client['status'][] = ['active', 'prospect', 'inactive'];

const METRIC_DEFINITIONS: MetricDefinition[] = [
  {
    key: 'total',
    label: 'Clients',
    description: 'Relationships in workspace',
    predicate: () => true,
    icon: Users,
    accentClass: 'text-[var(--accent-purple)]',
  },
  {
    key: 'active',
    label: 'Active',
    description: 'In delivery right now',
    predicate: (client) => client.status === 'active',
    icon: Target,
    accentClass: 'text-emerald-500',
  },
  {
    key: 'prospects',
    label: 'Prospects',
    description: 'Pipeline opportunities',
    predicate: (client) => client.status === 'prospect',
    icon: Sparkles,
    accentClass: 'text-amber-500',
  },
  {
    key: 'advocates',
    label: 'Advocates',
    description: 'Satisfaction ≥ 4.5',
    predicate: (client) => client.analytics.clientSatisfaction >= 4.5,
    icon: TrendingUp,
    accentClass: 'text-sky-500',
  },
];

const METRIC_BY_KEY = METRIC_DEFINITIONS.reduce<Record<MetricKey, MetricDefinition>>(
  (acc, definition) => {
    acc[definition.key] = definition;
    return acc;
  },
  {} as Record<MetricKey, MetricDefinition>,
);

const normalizeSearchValue = (value: string | null | undefined) =>
  (value || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase();

const formatStatusLabel = (status: Client['status']) =>
  status.charAt(0).toUpperCase() + status.slice(1);

const Clients: React.FC = () => {
  const { user } = useAuth();
  const {
    clients,
    isLoading,
    createClient,
    updateClient,
    createProposal,
    updateProposal,
  } = useClients();

  const [selectedClientId, setSelectedClientId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<StatusFilterValue>('all');
  const [activeMetric, setActiveMetric] = useState<MetricKey>('total');
  const [timeRange, setTimeRange] = useState<DateRangeKey>(DEFAULT_TIME_RANGE);
  const [formState, setFormState] = useState<ClientFormState | null>(null);

  const isBusinessAccount = user?.accountType === 'business';

  const activeClient = useMemo(
    () =>
      selectedClientId
        ? clients.find((clientItem) => clientItem.id === selectedClientId) ?? null
        : null,
    [clients, selectedClientId],
  );

  const normalizedSearchTerm = useMemo(
    () => normalizeSearchValue(searchTerm.trim()),
    [searchTerm],
  );

  const activeRange = useMemo(() => getDateRange(timeRange), [timeRange]);

  useEffect(() => {
    if (selectedClientId && !clients.some((clientItem) => clientItem.id === selectedClientId)) {
      setSelectedClientId(null);
    }
  }, [clients, selectedClientId]);

  const availableStatuses = useMemo(() => {
    const statuses = new Set<Client['status']>();
    clients.forEach((client) => {
      statuses.add(client.status);
    });

    return statusOrder.filter((status) => statuses.has(status));
  }, [clients]);

  const baseFilteredClients = useMemo(() =>
    clients.filter((client) => {
      if (normalizedSearchTerm) {
        const ownFieldMatches = [client.companyName, client.industry, client.location]
          .filter(Boolean)
          .map((value) => normalizeSearchValue(value))
          .some((value) => value.includes(normalizedSearchTerm));

        const contactMatches = client.contacts.some((contact) =>
          [contact.name, contact.title, contact.email, contact.phone]
            .filter(Boolean)
            .map((value) => normalizeSearchValue(value))
            .some((value) => value.includes(normalizedSearchTerm)),
        );

        const projectMatches = client.projects.some((project) =>
          [project.name, project.status]
            .filter(Boolean)
            .map((value) => normalizeSearchValue(value))
            .some((value) => value.includes(normalizedSearchTerm)),
        );

        const toolMatches = client.tools.some((tool) =>
          [tool.name, tool.type]
            .filter(Boolean)
            .map((value) => normalizeSearchValue(value))
            .some((value) => value.includes(normalizedSearchTerm)),
        );

        const libraryMatches = client.library.some((item) =>
          [item.name, item.category]
            .filter(Boolean)
            .map((value) => normalizeSearchValue(value))
            .some((value) => value.includes(normalizedSearchTerm)),
        );

        if (!ownFieldMatches && !contactMatches && !projectMatches && !toolMatches && !libraryMatches) {
          return false;
        }
      }

      if (statusFilter !== 'all' && client.status !== statusFilter) {
        return false;
      }

      if (!isWithinTimeRange(client.updatedAt, activeRange) && !isWithinTimeRange(client.createdAt, activeRange)) {
        return false;
      }

      return true;
    }),
  [activeRange, clients, normalizedSearchTerm, statusFilter]);

  const filteredClients = useMemo(() => {
    const definition = METRIC_BY_KEY[activeMetric];

    if (!definition) {
      return baseFilteredClients;
    }

    return baseFilteredClients.filter((client) => definition.predicate(client));
  }, [baseFilteredClients, activeMetric]);

  const metricCounts = useMemo(() => {
    const counts = METRIC_DEFINITIONS.reduce<Record<MetricKey, number>>((acc, definition) => {
      acc[definition.key] = 0;
      return acc;
    }, {
      total: 0,
      active: 0,
      prospects: 0,
      advocates: 0,
    });

    baseFilteredClients.forEach((client) => {
      METRIC_DEFINITIONS.forEach((definition) => {
        if (definition.predicate(client)) {
          counts[definition.key] += 1;
        }
      });
    });

    return counts;
  }, [baseFilteredClients]);

  const activeFilterChips = useMemo(() => {
    const chips: string[] = [];
    const trimmedSearch = searchTerm.trim();

    if (trimmedSearch) {
      chips.push(`Search: "${trimmedSearch}"`);
    }

    if (statusFilter !== 'all') {
      chips.push(`Status: ${formatStatusLabel(statusFilter)}`);
    }

    if (activeMetric !== 'total') {
      chips.push(`Metric: ${METRIC_BY_KEY[activeMetric].label}`);
    }

    if (timeRange !== DEFAULT_TIME_RANGE) {
      chips.push(`Range: ${getDateRangeLabel(timeRange)}`);
    }

    return chips;
  }, [searchTerm, statusFilter, activeMetric, timeRange]);

  const handleMetricSelect = useCallback((key: MetricKey) => {
    setActiveMetric((previous) => (previous === key && key !== 'total' ? 'total' : key));
  }, []);

  const handleSearchChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      setSearchTerm(event.target.value);
    },
    [],
  );

  const handleStatusFilterChange = useCallback(
    (event: React.ChangeEvent<HTMLSelectElement>) => {
      setStatusFilter(event.target.value as StatusFilterValue);
    },
    [],
  );

  const handleTimeRangeChange = useCallback((value: DateRangeKey) => {
    setTimeRange(value);
  }, []);

  const openCreateClientModal = useCallback(() => {
    if (isBusinessAccount) {
      return;
    }

    setFormState({ mode: 'create', client: null });
  }, [isBusinessAccount]);

  const openEditClientModal = useCallback(
    (client: Client) => {
      if (isBusinessAccount) {
        return;
      }

      setFormState({ mode: 'edit', client });
    },
    [isBusinessAccount],
  );

  const handleClientFormSubmit = useCallback(
    (values: ClientFormValues) => {
      if (isBusinessAccount) {
        setFormState(null);
        return;
      }

      const payload = {
        companyName: values.companyName.trim(),
        industry: values.industry.trim(),
        location: values.location.trim(),
        status: values.status,
        website: values.website?.trim() || undefined,
        linkedinUrl: values.linkedinUrl?.trim() || undefined,
      };

      if (formState?.mode === 'create') {
        const created = createClient(payload);
        if (created) {
          setSelectedClientId(created.id);
        }
      } else if (formState?.mode === 'edit' && formState.client) {
        updateClient(formState.client.id, payload);
      }

      setFormState(null);
    },
    [createClient, formState, isBusinessAccount, updateClient],
  );

  const handleModalClose = useCallback(() => {
    setFormState(null);
  }, []);

  const resetFilters = useCallback(() => {
    setSearchTerm('');
    setStatusFilter('all');
    setActiveMetric('total');
    setTimeRange(DEFAULT_TIME_RANGE);
  }, []);

  if (isBusinessAccount) {
    return (
      <div className="flex items-center justify-center py-16">
        <div className="max-w-xl space-y-4 rounded-2xl border border-[var(--border)] bg-[var(--surface)]/60 p-10 text-center shadow-sm">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-[var(--surface)]">
            <Building2 className="h-6 w-6 text-[var(--accent-purple)]" />
          </div>
          <h1 className="text-2xl font-semibold text-[var(--fg)]">Clients view unavailable</h1>
          <p className="text-sm text-[var(--fg-muted)]">
            Business accounts focus on internal operations. Switch to an agency or consultant account to manage external client relationships.
          </p>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="h-12 w-12 animate-spin rounded-full border-b-2 border-[var(--accent-purple)]" />
      </div>
    );
  }

  const showClientDetails = Boolean(selectedClientId && activeClient);

  return (
    <>
      {showClientDetails ? (
        <ClientDetails
          client={activeClient}
          onBack={() => setSelectedClientId(null)}
          onCreateProposal={(proposal) => createProposal(activeClient.id, proposal)}
          onUpdateProposal={(proposalId, updates) => updateProposal(activeClient.id, proposalId, updates)}
          onEdit={openEditClientModal}
        />
      ) : (
        <div className="space-y-6">
          <div className="space-y-4">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
              <div className="space-y-3">
                <div>
                  <h1 className="text-2xl font-semibold text-[var(--fg)]">Clients</h1>
                  <p className="text-sm text-[var(--fg-muted)]">
                    Track relationships, surface opportunities, and monitor delivery health.
                  </p>
                </div>

                <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                  <div className="relative flex-1 max-w-xl">
                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--fg-muted)]" />
                    <input
                      className="w-full rounded-lg border border-[var(--border)] bg-[var(--surface)] py-2 pl-9 pr-3 text-sm text-[var(--fg)] focus:outline-none focus:ring-2 focus:ring-[var(--accent-purple)]"
                      placeholder="Search by company, contact, project, or tool"
                      value={searchTerm}
                      onChange={handleSearchChange}
                    />
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    <span className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-[var(--fg-muted)]">
                      <CalendarClock className="h-3.5 w-3.5" />
                      Time range
                    </span>
                    {timeRangeOptions.map((option) => {
                      const isActive = option.value === timeRange;
                      return (
                        <button
                          key={option.value}
                          type="button"
                          onClick={() => handleTimeRangeChange(option.value)}
                          aria-pressed={isActive}
                          className={`rounded-full border px-3 py-1.5 text-xs font-medium transition focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent-purple)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--card)] ${
                            isActive
                              ? 'border-transparent bg-gradient-to-r from-[var(--accent-orange)] via-[var(--accent-pink)] to-[var(--accent-purple)] text-white shadow-sm'
                              : 'border-[var(--border)] bg-[var(--surface)] text-[var(--fg-muted)] hover:text-[var(--fg)]'
                          }`}
                        >
                          {option.label}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>

              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:self-end lg:self-start">
                <div className="relative">
                  <Filter className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--fg-muted)]" />
                  <select
                    className="appearance-none rounded-lg border border-[var(--border)] bg-[var(--surface)] py-2 pl-9 pr-8 text-sm text-[var(--fg)] focus:outline-none focus:ring-2 focus:ring-[var(--accent-purple)]"
                    value={statusFilter}
                    onChange={handleStatusFilterChange}
                  >
                    <option value="all">All statuses</option>
                    {availableStatuses.map((status) => (
                      <option key={status} value={status}>
                        {formatStatusLabel(status)}
                      </option>
                    ))}
                  </select>
                </div>

                <button
                  type="button"
                  onClick={openCreateClientModal}
                  className="flex items-center gap-2 rounded-lg bg-gradient-to-r from-[var(--accent-orange)] via-[var(--accent-pink)] to-[var(--accent-purple)] px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:opacity-90"
                >
                  <Plus className="h-4 w-4" />
                  New Client
                </button>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {METRIC_DEFINITIONS.map((definition) => {
              const count = metricCounts[definition.key] ?? 0;
              const isActive = activeMetric === definition.key;
              const Icon = definition.icon;

              return (
                <button
                  key={definition.key}
                  type="button"
                  onClick={() => handleMetricSelect(definition.key)}
                  aria-pressed={isActive}
                  className="w-full rounded-2xl text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent-purple)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--card)]"
                >
                  <Card glowOnHover activeGlow={isActive} className="h-full p-5">
                    <div className="flex h-full flex-col justify-between gap-4">
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <p className="text-xs font-semibold uppercase tracking-wide text-[var(--fg-muted)]">
                            {definition.label}
                          </p>
                          <p className="mt-2 text-3xl font-semibold text-[var(--fg)]">{count}</p>
                          <p className="mt-1 text-xs text-[var(--fg-muted)]">{definition.description}</p>
                        </div>
                        <div
                          className={`rounded-lg p-2 ${
                            isActive ? 'bg-[var(--surface)]/80' : 'bg-[var(--surface)]/60'
                          }`}
                        >
                          <Icon
                            className={`h-5 w-5 ${
                              isActive ? definition.accentClass : 'text-[var(--fg-muted)]'
                            }`}
                          />
                        </div>
                      </div>
                      <div className="text-xs text-[var(--fg-muted)]">
                        {isActive
                          ? 'Click again to view all clients'
                          : 'Click to filter client list'}
                      </div>
                    </div>
                  </Card>
                </button>
              );
            })}
          </div>

          {activeFilterChips.length > 0 && (
            <div className="flex flex-wrap items-center gap-2 text-xs text-[var(--fg-muted)]">
              {activeFilterChips.map((chip) => (
                <span
                  key={chip}
                  className="rounded-full border border-[var(--border)] bg-[var(--surface)] px-3 py-1 font-medium text-[var(--fg)]"
                >
                  {chip}
                </span>
              ))}
              <button
                type="button"
                onClick={resetFilters}
                className="text-[var(--accent-purple)] font-semibold transition hover:underline"
              >
                Reset filters
              </button>
            </div>
          )}

          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between text-sm text-[var(--fg-muted)]">
            <span>
              Showing{' '}
              <span className="font-medium text-[var(--fg)]">{filteredClients.length}</span>{' '}
              of {metricCounts.total ?? baseFilteredClients.length} clients
            </span>
            {activeMetric !== 'total' && (
              <button
                type="button"
                onClick={() => setActiveMetric('total')}
                className="text-xs font-semibold text-[var(--accent-purple)] transition hover:underline"
              >
                Clear metric filter
              </button>
            )}
          </div>

          {filteredClients.length > 0 ? (
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
              {filteredClients.map((client) => (
                <ClientCard
                  key={client.id}
                  client={client}
                  onClick={() => setSelectedClientId(client.id)}
                />
              ))}
            </div>
          ) : (
            <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)]/60 p-12 text-center">
              <p className="text-lg font-semibold text-[var(--fg)]">
                {clients.length === 0 ? 'You haven\'t added any clients yet' : 'No clients match your filters'}
              </p>
              <p className="mt-2 text-sm text-[var(--fg-muted)]">
                {clients.length === 0
                  ? 'Create your first client record to start tracking relationships.'
                  : 'Try adjusting your search, filters, or metric selection.'}
              </p>
              <div className="mt-6 flex justify-center">
                <button
                  type="button"
                  onClick={openCreateClientModal}
                  className="flex items-center gap-2 rounded-lg bg-gradient-to-r from-[var(--accent-orange)] via-[var(--accent-pink)] to-[var(--accent-purple)] px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:opacity-90"
                >
                  <Plus className="h-4 w-4" />
                  Add Client
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      <EntityFormModal
        isOpen={Boolean(formState)}
        type="client"
        mode={formState?.mode ?? 'create'}
        initialData={formState?.client ?? null}
        onClose={handleModalClose}
        onSubmit={(values) => handleClientFormSubmit(values as ClientFormValues)}
      />
    </>
  );
};

export default Clients;
