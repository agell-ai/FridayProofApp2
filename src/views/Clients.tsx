import React, { useMemo, useState } from 'react';
import { CalendarRange, ChevronDown, Plus, Search } from 'lucide-react';
import ClientCard from '../components/Clients/ClientCard';
import ClientDetails from '../components/Clients/ClientDetails';
import { useClients } from '../hooks/useClients';
import { Client } from '../types';
import {
  DEFAULT_TIME_RANGE,
  TimeRangeKey,
  getTimeRangeStart,
  isWithinTimeRange,
  timeRangeOptions
} from '../utils/timeRanges';

type MetricFilter = 'total' | 'active' | 'prospect' | 'new';

interface MetricDefinition {
  key: MetricFilter;
  label: string;
  description: string;
  value: number;
}

const Clients: React.FC = () => {
  const { clients, isLoading } = useClients();
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedMetric, setSelectedMetric] = useState<MetricFilter>('total');
  const [timeRange, setTimeRange] = useState<TimeRangeKey>(DEFAULT_TIME_RANGE);

  const rangeStart = useMemo(() => getTimeRangeStart(timeRange), [timeRange]);

  const selectedRangeOption = useMemo(() => {
    return (
      timeRangeOptions.find((option) => option.value === timeRange) ?? timeRangeOptions[0]
    );
  }, [timeRange]);

  const metricCounts = useMemo(() => {
    let active = 0;
    let prospects = 0;
    let newClients = 0;

    clients.forEach((client) => {
      if (client.status === 'active') {
        active += 1;
      }

      if (client.status === 'prospect') {
        prospects += 1;
      }

      if (isWithinTimeRange(client.createdAt, rangeStart)) {
        newClients += 1;
      }
    });

    return {
      total: clients.length,
      active,
      prospects,
      new: newClients
    };
  }, [clients, rangeStart]);

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
        value: metricCounts.prospects
      },
      {
        key: 'new',
        label: 'New',
        description: selectedRangeOption.label,
        value: metricCounts.new
      }
    ];
  }, [metricCounts, selectedRangeOption]);

  const filteredClients = useMemo(() => {
    const normalizedSearch = searchTerm.trim().toLowerCase();

    return clients.filter((client) => {
      const matchesSearch =
        normalizedSearch.length === 0 ||
        [
          client.companyName,
          client.industry,
          client.location,
          client.status,
          client.website ?? '',
          client.linkedinUrl ?? ''
        ].some((value) => value.toLowerCase().includes(normalizedSearch)) ||
        client.contacts.some((contact) =>
          [contact.name, contact.title, contact.email ?? '']
            .map((value) => value.toLowerCase())
            .some((value) => value.includes(normalizedSearch))
        );

      if (!matchesSearch) {
        return false;
      }

      switch (selectedMetric) {
        case 'total':
          return true;
        case 'active':
          return client.status === 'active';
        case 'prospect':
          return client.status === 'prospect';
        case 'new':
          return isWithinTimeRange(client.createdAt, rangeStart);
        default:
          return true;
      }
    });
  }, [clients, rangeStart, searchTerm, selectedMetric]);

  const handleResetFilters = () => {
    setSearchTerm('');
    setSelectedMetric('total');
    setTimeRange(DEFAULT_TIME_RANGE);
  };

  if (selectedClient) {
    return <ClientDetails client={selectedClient} onBack={() => setSelectedClient(null)} />;
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
                className="w-full rounded-lg border border-[var(--border)] bg-[var(--surface)] py-2 pl-9 pr-3 text-sm text-[var(--fg)] focus:outline-none focus:ring-2 focus:ring-[var(--accent-purple)]"
                placeholder="Search clients by name, industry, or location"
                value={searchTerm}
                onChange={(event) => setSearchTerm(event.target.value)}
              />
            </div>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <div className="relative w-full sm:w-auto">
              <CalendarRange className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--fg-muted)]" />
              <select
                className="w-full appearance-none rounded-lg border border-[var(--border)] bg-[var(--surface)] py-2 pl-9 pr-10 text-sm text-[var(--fg)] focus:outline-none focus:ring-2 focus:ring-[var(--accent-purple)]"
                value={timeRange}
                onChange={(event) => setTimeRange(event.target.value as TimeRangeKey)}
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
              className="flex items-center justify-center gap-2 rounded-lg bg-sunset-orange px-4 py-2 font-semibold text-white transition-opacity hover:opacity-90"
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
                onClick={() => setSelectedMetric(metric.key)}
                aria-pressed={isActive}
                className={`rounded-xl border px-4 py-3 text-left transition focus:outline-none focus:ring-2 focus:ring-[var(--accent-purple)] ${
                  isActive
                    ? 'border-transparent bg-gradient-to-r from-[var(--accent-orange)] via-[var(--accent-pink)] to-[var(--accent-purple)] text-white shadow'
                    : 'border-[var(--border)] bg-[var(--surface)] text-[var(--fg)] hover:border-[var(--accent-orange)]'
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
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filteredClients.map((client) => (
            <ClientCard
              key={client.id}
              client={client}
              onClick={() => setSelectedClient(client)}
            />
          ))}
        </div>
      ) : (
        <div className="rounded-xl border border-dashed border-[var(--border)] bg-[var(--surface)]/60 py-12 text-center">
          <p className="mb-4 text-[var(--fg-muted)]">
            {hasClients ? 'No clients match your filters.' : 'No clients found'}
          </p>
          {hasClients ? (
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
              className="mx-auto flex items-center justify-center gap-2 rounded-lg bg-sunset-orange px-4 py-2 font-semibold text-white transition-opacity hover:opacity-90"
            >
              <Plus className="h-5 w-5" />
              <span>Add Your First Client</span>
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default Clients;