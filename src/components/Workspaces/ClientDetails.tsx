import React, { useMemo } from 'react';
import {
  ArrowLeft,
  Building2,
  Globe,
  Linkedin,
  MapPin,
  Phone,
  Mail,
  Sparkles,
  FileText,
  BarChart3,
} from 'lucide-react';
import { Client, Project } from '../../types';
import { Card } from '../Shared/Card';
import { Button } from '../Shared/Button';

const formatCurrency = (value: number) => {
  if (!Number.isFinite(value)) {
    return '$0';
  }
  if (value >= 1_000_000) {
    return `$${(value / 1_000_000).toFixed(1)}M`;
  }
  if (value >= 1_000) {
    return `$${(value / 1_000).toFixed(1)}K`;
  }
  return `$${Math.round(value).toLocaleString()}`;
};

const deterministicNumber = (seed: string, min: number, max: number) => {
  let hash = 0;
  for (let index = 0; index < seed.length; index += 1) {
    hash = (hash * 31 + seed.charCodeAt(index)) % 10_000;
  }
  const ratio = hash / 10_000;
  return Math.round(min + ratio * (max - min));
};

const formatStatus = (status: string) =>
  status
    .replace(/-/g, ' ')
    .replace(/\b\w/g, (char) => char.toUpperCase());

const formatDate = (value: string) => {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return '—';
  }
  return date.toLocaleDateString();
};

const statusProgress: Record<string, number> = {
  planning: 20,
  development: 50,
  testing: 70,
  deployed: 100,
  maintenance: 60,
  active: 80,
  prospect: 30,
};

interface ClientDetailsProps {
  client: Client;
  projects: Project[];
  onBack: () => void;
  onEdit: (client: Client) => void;
  onCreateInvoice: () => void;
  onCreateProposal: () => void;
}

const ClientDetails: React.FC<ClientDetailsProps> = ({
  client,
  projects,
  onBack,
  onEdit,
  onCreateInvoice,
  onCreateProposal,
}) => {
  const associatedProjects = useMemo(() => {
    const displayProjects = new Map<string, {
      id: string;
      name: string;
      status: string;
      progress: number;
      budget: number;
      revenue: number;
    }>();

    client.projects.forEach((project) => {
      const progressValue = project.progress ?? statusProgress[project.status] ?? 40;
      displayProjects.set(project.id, {
        id: project.id,
        name: project.name,
        status: project.status,
        progress: progressValue,
        budget: project.budget,
        revenue: deterministicNumber(`${client.id}-${project.id}-revenue`, 30_000, 200_000),
      });
    });

    projects
      .filter((project) => project.clientId === client.id)
      .forEach((project) => {
        const key = project.id;
        const existing = displayProjects.get(key);
        if (existing) {
          displayProjects.set(key, {
            ...existing,
            status: project.status,
            progress: existing.progress ?? statusProgress[project.status] ?? 40,
          });
        } else {
          displayProjects.set(key, {
            id: key,
            name: project.name,
            status: project.status,
            progress: statusProgress[project.status] ?? 40,
            budget: deterministicNumber(`${client.id}-${project.id}-budget`, 25_000, 120_000),
            revenue: deterministicNumber(`${client.id}-${project.id}-revenue`, 30_000, 200_000),
          });
        }
      });

    return Array.from(displayProjects.values());
  }, [client, projects]);

  const totalRevenue = client.analytics.totalRevenue ?? client.financials.revenue ?? 0;

  const metrics = [
    { label: 'Total Revenue', value: formatCurrency(totalRevenue) },
    { label: 'Monthly Revenue', value: formatCurrency(client.analytics.monthlyRevenue ?? 0) },
    { label: 'Active Projects', value: String(associatedProjects.length) },
    { label: 'Avg. Project Value', value: formatCurrency(client.analytics.averageProjectValue ?? 0) },
  ];

  return (
    <div className="space-y-6">
      <button
        type="button"
        onClick={onBack}
        className="inline-flex items-center gap-2 text-sm text-[var(--accent-purple)] hover:text-[var(--fg)]"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to clients
      </button>

      <Card className="p-6 space-y-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <h2 className="text-2xl font-semibold text-[var(--fg)]">{client.companyName}</h2>
              <span className="px-2 py-1 text-xs font-semibold rounded-full border border-[var(--border)] text-[var(--fg-muted)]">
                {formatStatus(client.status)}
              </span>
            </div>
            <p className="text-sm text-[var(--fg-muted)]">Updated {formatDate(client.updatedAt)}</p>
            <div className="flex items-center gap-2 text-sm text-[var(--fg-muted)]">
              <Building2 className="w-4 h-4" />
              <span>{client.industry}</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-[var(--fg-muted)]">
              <MapPin className="w-4 h-4" />
              <span>{client.location}</span>
            </div>
          </div>

          <div className="flex flex-col gap-2 sm:flex-row">
            <Button type="button" variant="outline" onClick={onCreateInvoice} className="gap-2">
              <FileText className="w-4 h-4" />
              Create Invoice
            </Button>
            <Button type="button" variant="outline" onClick={onCreateProposal} className="gap-2">
              <Sparkles className="w-4 h-4" />
              Create Proposal
            </Button>
            <Button type="button" variant="gradient" onClick={() => onEdit(client)} className="gap-2">
              <BarChart3 className="w-4 h-4" />
              Edit Client
            </Button>
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {metrics.map((metric) => (
            <Card key={metric.label} className="p-4 bg-[var(--surface)]">
              <p className="text-xs uppercase tracking-wide text-[var(--fg-muted)]">{metric.label}</p>
              <p className="mt-2 text-lg font-semibold text-[var(--fg)]">{metric.value}</p>
            </Card>
          ))}
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <Card className="p-4 bg-[var(--surface)] space-y-4">
            <p className="text-sm font-semibold text-[var(--fg)]">Contacts</p>
            <div className="space-y-4">
              {client.contacts.length === 0 ? (
                <p className="text-sm text-[var(--fg-muted)]">No contacts have been added for this client.</p>
              ) : (
                client.contacts.map((contact) => (
                  <div key={contact.id} className="space-y-1 rounded-lg border border-[var(--border)] bg-[var(--card)]/60 p-3">
                    <p className="text-sm font-medium text-[var(--fg)]">{contact.name}</p>
                    <p className="text-xs text-[var(--fg-muted)]">{contact.title}</p>
                    <a
                      href={`mailto:${contact.email}`}
                      className="flex items-center gap-2 text-xs text-[var(--accent-purple)] hover:underline"
                    >
                      <Mail className="w-4 h-4" />
                      {contact.email}
                    </a>
                    <p className="flex items-center gap-2 text-xs text-[var(--fg)]">
                      <Phone className="w-4 h-4" />
                      {contact.phone}
                    </p>
                    <div className="flex items-center gap-3 text-xs text-[var(--accent-purple)]">
                      {client.website && (
                        <a href={client.website} target="_blank" rel="noreferrer" className="flex items-center gap-1 hover:underline">
                          <Globe className="w-4 h-4" />
                          Website
                        </a>
                      )}
                      {contact.linkedinUrl && (
                        <a href={contact.linkedinUrl} target="_blank" rel="noreferrer" className="flex items-center gap-1 hover:underline">
                          <Linkedin className="w-4 h-4" />
                          LinkedIn
                        </a>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </Card>

          <Card className="p-4 bg-[var(--surface)] space-y-4">
            <p className="text-sm font-semibold text-[var(--fg)]">Invoices</p>
            <div className="space-y-3">
              {client.invoices.length === 0 ? (
                <p className="text-sm text-[var(--fg-muted)]">No invoices have been issued.</p>
              ) : (
                client.invoices.map((invoice) => (
                  <div key={invoice.id} className="rounded-lg border border-[var(--border)] bg-[var(--card)]/60 p-3">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-medium text-[var(--fg)]">Invoice {invoice.number}</p>
                      <span className="text-xs font-semibold text-[var(--accent-purple)]">
                        {formatStatus(invoice.status)}
                      </span>
                    </div>
                    <p className="mt-1 text-xs text-[var(--fg-muted)]">Amount: {formatCurrency(invoice.amount)}</p>
                    <p className="mt-1 text-xs text-[var(--fg-muted)]">Due: {formatDate(invoice.dueDate)}</p>
                    {invoice.paidDate && (
                      <p className="mt-1 text-xs text-[var(--fg-muted)]">Paid: {formatDate(invoice.paidDate)}</p>
                    )}
                  </div>
                ))
              )}
            </div>
          </Card>
        </div>

        <Card className="p-4 bg-[var(--surface)] space-y-4">
          <p className="text-sm font-semibold text-[var(--fg)]">Projects</p>
          <div className="space-y-3">
            {associatedProjects.length === 0 ? (
              <p className="text-sm text-[var(--fg-muted)]">No projects currently associated with this client.</p>
            ) : (
              associatedProjects.map((project) => (
                <div
                  key={project.id}
                  className="rounded-lg border border-[var(--border)] bg-[var(--card)]/60 p-3"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-[var(--fg)]">{project.name}</p>
                      <p className="text-xs text-[var(--fg-muted)]">Status: {formatStatus(project.status)}</p>
                    </div>
                    <p className="text-xs font-semibold text-[var(--accent-orange)]">
                      Revenue {formatCurrency(project.revenue)}
                    </p>
                  </div>
                  <div className="mt-3 h-1.5 rounded-full bg-[var(--surface)]">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-[var(--accent-orange)] via-[var(--accent-pink)] to-[var(--accent-purple)]"
                      style={{ width: `${Math.max(project.progress, 6)}%` }}
                    />
                  </div>
                  <div className="mt-2 flex items-center justify-between text-xs text-[var(--fg-muted)]">
                    <span>Progress {project.progress}%</span>
                    <span>Budget {formatCurrency(project.budget)}</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </Card>
      </Card>
    </div>
  );
};

export default ClientDetails;
