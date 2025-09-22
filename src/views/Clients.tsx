import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { CalendarRange, ChevronDown, Plus, Search } from 'lucide-react';
import ClientCard from '../components/Clients/ClientCard';
import ClientDetails from '../components/Clients/ClientDetails';
import { EntityFormModal, ClientFormValues } from '../components/Shared/EntityFormModal';
import { useClients } from '../hooks/useClients';
import { useAuth } from '../hooks/useAuth';
import { Client } from '../types';
import {
  DEFAULT_TIME_RANGE,
  TimeRangeKey,
  getTimeRangeStart,
  isWithinTimeRange,
  timeRangeOptions
} from '../utils/timeRanges';

type MetricFilter = 'total' | 'active' | 'prospect' | 'new';

type ClientsByMetric = Record<MetricFilter, Client[]>;

interface MetricDefinition {
  key: MetricFilter;
  label: string;
  description: string;
  value: number;
}

type ClientFormState = {
  mode: 'create' | 'edit';
  client: Client | null;
};

const CLIENTS_PER_PAGE = 9;

const Clients: React.FC = () => {
  const { clients, isLoading, createClient, updateClient } = useClients();
  const { user } = useAuth();
  const [selectedClientId, setSelectedClientId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedMetric, setSelectedMetric] = useState<MetricFilter>('total');
  const [timeRange, setTimeRange] = useState<TimeRangeKey>(DEFAULT_TIME_RANGE);
  const [clientFormState, setClientFormState] = useState<ClientFormState | null>(null);
  const [currentPage, setCurrentPage] = useState(1);

  const isBusinessAccount = user?.accountType === 'business';
  const canManageClients = !isBusinessAccount;

  const selectedClient = useMemo(() => {
    if (!selectedClientId) {
      return null;
    }

    return clients.find((client) => client.id === selectedClientId) ?? null;
  }, [clients, selectedClientId]);

  useEffect(() => {
    if (selectedClientId && !selectedClient) {
      setSelectedClientId(null);
    }
  }, [selectedClientId, selectedClient]);

  const rangeStart = useMemo(() => getTimeRangeStart(timeRange), [timeRange]);

  const normalizedSearch = useMemo(
    () => searchTerm.trim().toLowerCase(),
    [searchTerm]
  );

  const selectedRangeOption = useMemo(() => {
    return (
      timeRangeOptions.find((option) => option.value === timeRange) ??
      timeRangeOptions.find((option) => option.value === DEFAULT_TIME_RANGE) ??
      timeRangeOptions[0]
    );
  }, [timeRange]);

  const newMetricDescription = useMemo(() => {
    switch (selectedRangeOption.value) {
      case 'all':
        return 'Created all time';
      case 'ytd':
        return 'Created year to date';
      default:
        return `Created ${selectedRangeOption.label.toLowerCase()}`;
    }
  }, [selectedRangeOption]);

  const { metricCounts, clientsByMetric } = useMemo(() => {
    const counts: Record<MetricFilter, number> = {
      total: 0,
      active: 0,
      prospect: 0,
      new: 0
    };

    const grouped: ClientsByMetric = {
      total: [],
      active: [],
      prospect: [],
      new: []
    };

    const hasSearch = normalizedSearch.length > 0;

    const includesSearch = (value: string | null | undefined) =>
      String(value ?? '').toLowerCase().includes(normalizedSearch);

    clients.forEach((client) => {
      const matchesSearch =
        !hasSearch ||
        [
          client.companyName,
          client.industry,
          client.location,
          client.status,
          client.website ?? '',
          client.linkedinUrl ?? ''
        ].some((value) => includesSearch(value)) ||
        client.contacts.some((contact) =>
          [
            contact.name,
            contact.title,
            contact.email ?? '',
            contact.phone ?? '',
            contact.linkedinUrl ?? ''
          ].some((value) => includesSearch(value))
        );

      if (!matchesSearch) {
        return;
      }

      if (isWithinTimeRange(client.updatedAt, rangeStart)) {
        grouped.total.push(client);
        counts.total += 1;

        if (client.status === 'active') {
          grouped.active.push(client);
          counts.active += 1;
        } else if (client.status === 'prospect') {
          grouped.prospect.push(client);
          counts.prospect += 1;
        }
      }

      if (isWithinTimeRange(client.createdAt, rangeStart)) {
        grouped.new.push(client);
        counts.new += 1;
      }
    });

    return { metricCounts: counts, clientsByMetric: grouped };
  }, [clients, normalizedSearch, rangeStart]);

  const metrics = useMemo<MetricDefinition[]>(() => {
    return [
      {
        key: 'total',
        label: 'Total',
        description: 'All clients',
        value: metricCounts.total
      },
      {
        key: 'active',
        label: 'Active',
        description: 'Active partnerships',
        value: metricCounts.active
      },
      {
        key: 'prospect',
        label: 'Prospects',
        description: 'Sales pipeline',
        value: metricCounts.prospect
      },
      {
        key: 'new',
        label: 'New',
        description: newMetricDescription,
        value: metricCounts.new
      }
    ];
  }, [metricCounts, newMetricDescription]);

  const filteredClients = useMemo(
    () => clientsByMetric[selectedMetric] ?? [],
    [clientsByMetric, selectedMetric]
  );
  const totalPages = Math.max(1, Math.ceil(filteredClients.length / CLIENTS_PER_PAGE));

  const paginatedClients = useMemo(() => {
    const startIndex = (currentPage - 1) * CLIENTS_PER_PAGE;
    return filteredClients.slice(startIndex, startIndex + CLIENTS_PER_PAGE);
  }, [filteredClients, currentPage]);

  const hasFilters =
    normalizedSearch.length > 0 ||
    selectedMetric !== 'total' ||
    timeRange !== DEFAULT_TIME_RANGE;

  const isClientModalOpen = clientFormState !== null;
  const clientModalMode = clientFormState?.mode ?? 'create';
  const clientModalInitialData = clientFormState?.client ?? null;

  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [currentPage, totalPages]);

  const handleOpenCreateClient = useCallback(() => {
    if (!canManageClients) {
      return;
    }

    setClientFormState({ mode: 'create', client: null });
  }, [canManageClients]);

  const handleSearchChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      setSearchTerm(event.target.value);
      setCurrentPage(1);
    },
    []
  );

  const handleTimeRangeChange = useCallback(
    (event: React.ChangeEvent<HTMLSelectElement>) => {
      setTimeRange(event.target.value as TimeRangeKey);
      setCurrentPage(1);
    },
    []
  );

  const handleSelectMetric = useCallback((metric: MetricFilter) => {
    setSelectedMetric(metric);
    setCurrentPage(1);
  }, []);

  const handleEditClient = useCallback(
    (client: Client) => {
      if (!canManageClients) {
        return;
      }

      setClientFormState({ mode: 'edit', client });
    },
    [canManageClients]
  );

  const handleClientModalClose = useCallback(() => {
    setClientFormState(null);
  }, []);

  const handleClientSubmit = useCallback(
    (values: ClientFormValues) => {
      if (!clientFormState || !canManageClients) {
        return;
      }

      if (clientFormState.mode === 'edit' && clientFormState.client) {
        updateClient(clientFormState.client.id, {
          companyName: values.companyName,
          industry: values.industry,
          location: values.location,
          status: values.status,
          website: values.website,
          linkedinUrl: values.linkedinUrl,
        });
      } else {
        const createdClient = createClient({
          companyName: values.companyName,
          industry: values.industry,
          location: values.location,
          status: values.status,
          website: values.website,
          linkedinUrl: values.linkedinUrl,
        });

        if (createdClient) {
          setSelectedClientId(createdClient.id);
        }
      }

      setClientFormState(null);
    },
    [canManageClients, clientFormState, createClient, updateClient]
  );

  const clientFormModal = (
    <EntityFormModal
      isOpen={isClientModalOpen}
      type="client"
      mode={clientModalMode}
      initialData={clientModalInitialData ?? undefined}
      onClose={handleClientModalClose}
      onSubmit={handleClientSubmit}
    />
  );

  const handleResetFilters = useCallback(() => {
    setSearchTerm('');
    setSelectedMetric('total');
    setTimeRange(DEFAULT_TIME_RANGE);
    setCurrentPage(1);
  }, []);

  const handleBackToList = useCallback(() => {
    setSelectedClientId(null);
  }, []);

  if (selectedClient) {
    return (
      <>
        <ClientDetails
          client={selectedClient}
          onBack={handleBackToList}
          onEdit={canManageClients ? handleEditClient : undefined}
        />
        {clientFormModal}
      </>
    );
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-sunset-purple"></div>
      </div>
    );
  }

  const hasClients = clients.length > 0;

  return (
    <>
      <div className="space-y-6">
        <div className="space-y-4">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div className="space-y-3">
            <h1 className="text-2xl font-semibold text-[var(--fg)]">Clients</h1>
            <p className="text-sm text-[var(--fg-muted)]">
              Monitor relationships, opportunities, and delivery activity across every account.
            </p>
            <div className="relative max-w-md">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--fg-muted)]" />
              <input
                className="w-full rounded-lg border border-[var(--border)] bg-[var(--surface)] py-2 pl-9 pr-3 text-sm text-[var(--fg)] focus:outline-none focus:ring-2 focus:ring-[var(--accent-purple)] disabled:cursor-not-allowed disabled:opacity-60"
                placeholder="Search clients by company, industry, location, or contact details"
                value={searchTerm}
                onChange={handleSearchChange}
                disabled={!canManageClients}
              />
            </div>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <div className="relative w-full sm:w-auto">
              <CalendarRange className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--fg-muted)]" />
              <select
                className="w-full appearance-none rounded-lg border border-[var(--border)] bg-[var(--surface)] py-2 pl-9 pr-10 text-sm text-[var(--fg)] focus:outline-none focus:ring-2 focus:ring-[var(--accent-purple)] disabled:cursor-not-allowed disabled:opacity-60"
                value={timeRange}
                onChange={handleTimeRangeChange}
                disabled={!canManageClients}
              >
                {timeRangeOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
              <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--fg-muted)]" />
            </div>

            <button
              type="button"
              className="flex items-center justify-center gap-2 rounded-lg bg-sunset-orange px-4 py-2 font-semibold text-white transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
              onClick={handleOpenCreateClient}
              disabled={!canManageClients}
              aria-disabled={!canManageClients}
              title={!canManageClients ? 'Client management is unavailable for business accounts' : undefined}
            >
              <Plus className="h-5 w-5" />
              <span>New Client</span>
            </button>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
          {metrics.map((metric) => {
            const isActive = selectedMetric === metric.key;
            return (
              <button
                key={metric.key}
                type="button"
                onClick={() => handleSelectMetric(metric.key)}
                aria-pressed={isActive}
                disabled={!canManageClients}
                className={`rounded-xl border px-4 py-3 text-left transition focus:outline-none focus:ring-2 focus:ring-[var(--accent-purple)] ${
                  isActive
                    ? 'border-transparent bg-gradient-to-r from-[var(--accent-orange)] via-[var(--accent-pink)] to-[var(--accent-purple)] text-white shadow'
                    : 'border-[var(--border)] bg-[var(--surface)] text-[var(--fg)] hover:border-[var(--accent-orange)]'
                } ${
                  !canManageClients ? 'cursor-not-allowed opacity-60' : ''
                }`}
              >
                <div className="flex items-center justify-between gap-3">
                  <p className={`text-sm font-medium ${isActive ? 'text-white/90' : 'text-[var(--fg-muted)]'}`}>
                    {metric.label}
                  </p>
                  <p className={`text-2xl font-semibold ${isActive ? 'text-white' : 'text-[var(--fg)]'}`}>
                    {metric.value}
                  </p>
                </div>
                <p className={`mt-1 text-xs ${isActive ? 'text-white/80' : 'text-[var(--fg-muted)]'}`}>
                  {metric.description}
                </p>
              </button>
            );
          })}
        </div>
      </div>

      {filteredClients.length > 0 ? (
        <>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {paginatedClients.map((client) => (
              <ClientCard
                key={client.id}
                client={client}
                onClick={() => setSelectedClientId(client.id)}
              />
            ))}
          </div>

          {totalPages > 1 && (
            <div className="mt-6 flex items-center justify-between gap-4">
              <button
                type="button"
                onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                disabled={currentPage === 1}
                className="rounded-lg border border-[var(--border)] bg-transparent px-4 py-2 text-sm font-medium text-[var(--fg)] transition hover:border-[var(--accent-orange)] disabled:cursor-not-allowed disabled:opacity-60"
              >
                Previous
              </button>
              <span className="text-sm text-[var(--fg-muted)]">
                Page {currentPage} of {totalPages}
              </span>
              <button
                type="button"
                onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
                disabled={currentPage === totalPages}
                className="rounded-lg border border-[var(--border)] bg-transparent px-4 py-2 text-sm font-medium text-[var(--fg)] transition hover:border-[var(--accent-orange)] disabled:cursor-not-allowed disabled:opacity-60"
              >
                Next
              </button>
            </div>
          )}
        </>
      ) : (
        <div className="rounded-xl border border-dashed border-[var(--border)] bg-[var(--surface)]/60 py-12 text-center">
          {canManageClients ? (
            <div className="space-y-4">
              <p className="text-[var(--fg-muted)]">
                {hasClients ? 'No clients match your filters.' : 'No clients found'}
              </p>
              {hasClients && hasFilters ? (
                <button
                  type="button"
                  onClick={handleResetFilters}
                  className="rounded-lg border border-[var(--border)] bg-transparent px-4 py-2 text-sm font-medium text-[var(--fg)] transition hover:border-[var(--accent-orange)]"
                >
                  Clear filters
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleOpenCreateClient}
                  disabled={!canManageClients}
                  aria-disabled={!canManageClients}
                  className="mx-auto flex items-center justify-center gap-2 rounded-lg bg-sunset-orange px-4 py-2 font-semibold text-white transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  <Plus className="h-5 w-5" />
                  <span>Add Your First Client</span>
                </button>
              )}
            </div>
          ) : (
            <div className="mx-auto max-w-xl space-y-3 px-4">
              <p className="text-base font-medium text-[var(--fg)]">
                Client management is unavailable for business accounts.
              </p>
              <p className="text-sm text-[var(--fg-muted)]">
                Switch to an agency or consultant workspace to manage client relationships, track projects, and measure delivery performance.
              </p>
            </div>
          )}
        </div>
      )}
      </div>
      {clientFormModal}
    </>
  );
};

export default Clients;
