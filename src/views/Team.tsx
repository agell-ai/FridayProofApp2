import React, { useMemo, useState } from 'react';
import type { LucideIcon } from 'lucide-react';
import {
  Activity,
  CalendarClock,
  Filter,
  Mail,
  MapPin,
  Phone,
  Plus,
  Search,
  Sparkles,
  Users,
  UserCheck,
} from 'lucide-react';
import TeamMemberModal from '../components/Clients/TeamMemberModal';
import { Card } from '../components/Shared/Card';
import { Button } from '../components/Shared/Button';
import { useTeam } from '../hooks/useTeam';
import type { TeamMember } from '../types';
import {
  DEFAULT_TIME_RANGE,
  DateRangeKey,
  getDateRange,
  getDateRangeLabel,
  isWithinTimeRange,
  timeRangeOptions,
} from '../utils/timeRanges';

const roleOrder: TeamMember['role'][] = ['manager', 'employee', 'contractor'];

type RoleFilterValue = 'all' | TeamMember['role'];
type MetricKey = 'total' | 'active' | 'new' | 'engaged';
type RangeValue = ReturnType<typeof getDateRange>;

interface MetricDefinition {
  key: MetricKey;
  label: string;
  description: string;
  icon: LucideIcon;
  accentClass: string;
  predicate: (member: TeamMember, range: RangeValue) => boolean;
}

const getEffectiveRecentRange = (range: RangeValue) => range ?? getDateRange('last-30-days');

const joinedWithinRange = (member: TeamMember, range: RangeValue) => {
  const effectiveRange = getEffectiveRecentRange(range);
  return isWithinTimeRange(member.createdAt, effectiveRange);
};

const hasRecentActivity = (member: TeamMember, range: RangeValue) => {
  const effectiveRange = getEffectiveRecentRange(range);
  return (
    isWithinTimeRange(member.lastActiveAt, effectiveRange) ||
    isWithinTimeRange(member.lastAssignedAt, effectiveRange)
  );
};

const METRIC_DEFINITIONS: MetricDefinition[] = [
  {
    key: 'total',
    label: 'Team Members',
    description: 'In this view',
    icon: Users,
    accentClass: 'text-[var(--accent-orange)]',
    predicate: () => true,
  },
  {
    key: 'active',
    label: 'Active',
    description: 'Status: active',
    icon: UserCheck,
    accentClass: 'text-emerald-500',
    predicate: (member) => member.status === 'active',
  },
  {
    key: 'new',
    label: 'New',
    description: 'Joined this range',
    icon: Sparkles,
    accentClass: 'text-amber-500',
    predicate: (member, range) => joinedWithinRange(member, range),
  },
  {
    key: 'engaged',
    label: 'Engaged',
    description: 'Collaboration this range',
    icon: Activity,
    accentClass: 'text-sky-500',
    predicate: (member, range) => hasRecentActivity(member, range),
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

const formatRoleLabel = (role: TeamMember['role']) =>
  role.charAt(0).toUpperCase() + role.slice(1);

const formatDate = (value: string) => {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return '—';
  }

  return date.toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
};

const Team: React.FC = () => {
  const { teamMembers, isLoading } = useTeam();
  const [selectedTeamMember, setSelectedTeamMember] = useState<TeamMember | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState<RoleFilterValue>('all');
  const [activeMetric, setActiveMetric] = useState<MetricKey>('total');
  const [timeRange, setTimeRange] = useState<DateRangeKey>(DEFAULT_TIME_RANGE);

  const normalizedSearch = useMemo(
    () => normalizeSearchValue(searchTerm.trim()),
    [searchTerm],
  );
  const activeRange = useMemo(() => getDateRange(timeRange), [timeRange]);

  const availableRoles = useMemo(() => {
    const roles = new Set<TeamMember['role']>();
    teamMembers.forEach((member) => roles.add(member.role));

    return roleOrder.filter((role) => roles.has(role));
  }, [teamMembers]);

  const baseFilteredMembers = useMemo(
    () =>
      teamMembers.filter((member) => {
        if (normalizedSearch) {
          const fieldMatches = [
            member.name,
            member.email,
            member.role,
            member.companyName,
            member.city,
            member.state,
          ]
            .filter(Boolean)
            .map((value) => normalizeSearchValue(value))
            .some((value) => value.includes(normalizedSearch));

          const skillMatches = member.skills
            .map((skill) => normalizeSearchValue(skill))
            .some((value) => value.includes(normalizedSearch));

          if (!fieldMatches && !skillMatches) {
            return false;
          }
        }

        if (roleFilter !== 'all' && member.role !== roleFilter) {
          return false;
        }

        if (activeRange) {
          const relevantDates = [
            member.createdAt,
            member.updatedAt,
            member.lastActiveAt,
            member.lastAssignedAt,
          ].filter((value): value is string => Boolean(value));

          if (!relevantDates.some((date) => isWithinTimeRange(date, activeRange))) {
            return false;
          }
        }

        return true;
      }),
    [teamMembers, normalizedSearch, roleFilter, activeRange],
  );

  const filteredMembers = useMemo(() => {
    const definition = METRIC_BY_KEY[activeMetric];

    if (!definition) {
      return baseFilteredMembers;
    }

    return baseFilteredMembers.filter((member) => definition.predicate(member, activeRange));
  }, [baseFilteredMembers, activeMetric, activeRange]);

  const metricCounts = useMemo(() => {
    const counts: Record<MetricKey, number> = {
      total: 0,
      active: 0,
      new: 0,
      engaged: 0,
    };

    baseFilteredMembers.forEach((member) => {
      METRIC_DEFINITIONS.forEach((definition) => {
        if (definition.predicate(member, activeRange)) {
          counts[definition.key] += 1;
        }
      });
    });

    return counts;
  }, [baseFilteredMembers, activeRange]);

  const activeFilterChips = useMemo(() => {
    const chips: string[] = [];
    const trimmedSearch = searchTerm.trim();

    if (trimmedSearch) {
      chips.push(`Search: "${trimmedSearch}"`);
    }

    if (roleFilter !== 'all') {
      chips.push(`Role: ${formatRoleLabel(roleFilter)}`);
    }

    if (activeMetric !== 'total') {
      chips.push(`Metric: ${METRIC_BY_KEY[activeMetric].label}`);
    }

    if (timeRange !== DEFAULT_TIME_RANGE) {
      chips.push(`Range: ${getDateRangeLabel(timeRange)}`);
    }

    return chips;
  }, [searchTerm, roleFilter, activeMetric, timeRange]);

  const handleMetricSelect = (key: MetricKey) => {
    setActiveMetric((previous) => (previous === key && key !== 'total' ? 'total' : key));
  };

  if (isLoading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="h-12 w-12 animate-spin rounded-full border-b-2 border-[var(--accent-purple)]" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div className="space-y-3">
            <div>
              <h1 className="text-2xl font-semibold text-[var(--fg)]">Team</h1>
              <p className="text-sm text-[var(--fg-muted)]">
                Search, filter, and spotlight the teammates keeping delivery on track.
              </p>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
              <div className="relative flex-1 max-w-xl">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--fg-muted)]" />
                <input
                  className="w-full rounded-lg border border-[var(--border)] bg-[var(--surface)] py-2 pl-9 pr-3 text-sm text-[var(--fg)] focus:outline-none focus:ring-2 focus:ring-[var(--accent-purple)]"
                  placeholder="Search by name, role, skill, or location"
                  value={searchTerm}
                  onChange={(event) => setSearchTerm(event.target.value)}
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
                    <Button
                      key={option.value}
                      type="button"
                      size="xs"
                      variant={isActive ? 'gradient' : 'outline'}
                      onClick={() => setTimeRange(option.value)}
                      aria-pressed={isActive}
                      className={`rounded-full px-3 py-1.5 text-xs font-medium focus-visible:ring-[var(--accent-purple)] focus-visible:ring-offset-[var(--card)] ${
                        isActive
                          ? ''
                          : 'bg-[var(--surface)] text-[var(--fg-muted)] hover:bg-[var(--surface)] hover:text-[var(--fg)]'
                      }`}
                    >
                      {option.label}
                    </Button>
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
                value={roleFilter}
                onChange={(event) => setRoleFilter(event.target.value as RoleFilterValue)}
              >
                <option value="all">All roles</option>
                {availableRoles.map((role) => (
                  <option key={role} value={role}>
                    {formatRoleLabel(role)}
                  </option>
                ))}
              </select>
            </div>

            <Button
              type="button"
              size="sm"
              variant="gradient"
              className="gap-2 px-4 py-2 text-sm font-semibold"
            >
              <Plus className="h-4 w-4" />
              Add Team Member
            </Button>
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
                      ? 'Click again to view all team members'
                      : 'Click to focus the roster'}
                  </div>
                </div>
              </Card>
            </button>
          );
        })}
      </div>

      <div className="flex flex-col gap-2 text-sm text-[var(--fg-muted)] sm:flex-row sm:items-center sm:justify-between">
        <span>
          Showing{' '}
          <span className="font-medium text-[var(--fg)]">{filteredMembers.length}</span>{' '}
          of {metricCounts.total ?? baseFilteredMembers.length} team members
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

      {filteredMembers.length > 0 ? (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
          {filteredMembers.map((member) => {
            const initials = member.name
              .split(' ')
              .map((segment) => segment[0])
              .join('');
            const isNew = joinedWithinRange(member, activeRange);

            return (
              <Card
                key={member.id}
                glowOnHover
                onClick={() => setSelectedTeamMember(member)}
                className="p-6 text-left"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-primary text-lg font-semibold text-white">
                      {initials}
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-[var(--fg)]">{member.name}</h3>
                      <p className="text-sm text-[var(--fg-muted)] capitalize">{member.role}</p>
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    <span
                      className={`h-2.5 w-2.5 rounded-full ${
                        member.status === 'active' ? 'bg-emerald-400' : 'bg-gray-400'
                      }`}
                    />
                    {isNew && (
                      <span className="rounded-full bg-amber-500/10 px-2 py-0.5 text-xs font-medium text-amber-600 dark:text-amber-400">
                        New
                      </span>
                    )}
                  </div>
                </div>

                <div className="mt-4 space-y-2 text-sm text-[var(--fg-muted)]">
                  <div className="flex items-center gap-2">
                    <Mail className="h-4 w-4" />
                    <span className="truncate text-[var(--fg)]">{member.email}</span>
                  </div>
                  {member.phone && (
                    <div className="flex items-center gap-2">
                      <Phone className="h-4 w-4" />
                      <span className="text-[var(--fg)]">{member.phone}</span>
                    </div>
                  )}
                  {(member.city || member.state) && (
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4" />
                      <span className="text-[var(--fg)]">
                        {[member.city, member.state].filter(Boolean).join(', ')}
                      </span>
                    </div>
                  )}
                </div>

                <div className="mt-4 grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wide text-[var(--fg-muted)]">
                      Projects
                    </p>
                    <p className="mt-1 text-lg font-semibold text-[var(--fg)]">{member.projectIds.length}</p>
                  </div>
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wide text-[var(--fg-muted)]">
                      Productivity
                    </p>
                    <p className="mt-1 text-lg font-semibold text-[var(--fg)]">
                      {member.analytics.monthlyProductivity}%
                    </p>
                  </div>
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wide text-[var(--fg-muted)]">
                      Last Active
                    </p>
                    <p className="mt-1 text-sm text-[var(--fg)]">{formatDate(member.lastActiveAt)}</p>
                  </div>
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wide text-[var(--fg-muted)]">
                      Joined
                    </p>
                    <p className="mt-1 text-sm text-[var(--fg)]">{formatDate(member.createdAt)}</p>
                  </div>
                </div>

                {member.lastAssignedAt && (
                  <div className="mt-4 rounded-lg border border-[var(--border)] bg-[var(--surface)]/60 p-3 text-xs">
                    <p className="font-semibold uppercase tracking-wide text-[var(--fg-muted)]">
                      Last Assignment
                    </p>
                    <p className="mt-1 text-sm text-[var(--fg)]">{formatDate(member.lastAssignedAt)}</p>
                  </div>
                )}

                {member.skills.length > 0 && (
                  <div className="mt-4 flex flex-wrap gap-2">
                    {member.skills.slice(0, 4).map((skill) => (
                      <span
                        key={skill}
                        className="rounded-md bg-[var(--surface)] px-2 py-1 text-xs text-[var(--fg-muted)]"
                      >
                        {skill}
                      </span>
                    ))}
                    {member.skills.length > 4 && (
                      <span className="rounded-md bg-[var(--surface)] px-2 py-1 text-xs text-[var(--fg-muted)]">
                        +{member.skills.length - 4} more
                      </span>
                    )}
                  </div>
                )}
              </Card>
            );
          })}
        </div>
      ) : (
        <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)]/60 p-12 text-center">
          <p className="text-lg font-semibold text-[var(--fg)]">
            {teamMembers.length === 0 ? 'No team members available yet' : 'No team members match your filters'}
          </p>
          <p className="mt-2 text-sm text-[var(--fg-muted)]">
            {teamMembers.length === 0
              ? 'Add teammates to start tracking collaboration and performance.'
              : 'Try adjusting your search, role selection, metric, or time range to broaden the results.'}
          </p>

          {activeFilterChips.length > 0 && (
            <div className="mt-4 flex flex-wrap justify-center gap-2">
              {activeFilterChips.map((chip) => (
                <span
                  key={chip}
                  className="rounded-full border border-dashed border-[var(--border)] bg-[var(--surface)] px-3 py-1 text-xs text-[var(--fg-muted)]"
                >
                  {chip}
                </span>
              ))}
            </div>
          )}

          <Button
            type="button"
            size="sm"
            variant="gradient"
            className="mt-6 inline-flex gap-2 px-4 py-2 text-sm font-semibold"
          >
            <Plus className="h-4 w-4" />
            Add Team Member
          </Button>
        </div>
      )}

      {selectedTeamMember && (
        <TeamMemberModal
          member={selectedTeamMember}
          onClose={() => setSelectedTeamMember(null)}
        />
      )}
    </div>
  );
};

export default Team;
