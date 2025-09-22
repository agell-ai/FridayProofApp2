import React from 'react';
import { Pencil, CalendarDays } from 'lucide-react';
import { Client } from '../../types';
import { Card } from '../Shared/Card';

const statusStyles: Record<Client['status'], string> = {
  active: 'bg-emerald-500/10 text-emerald-500 border-emerald-500/30',
  inactive: 'bg-slate-500/10 text-slate-400 border-slate-500/30',
  prospect: 'bg-amber-500/10 text-amber-500 border-amber-500/30',
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

interface ClientCardProps {
  client: Client;
  onOpen: (client: Client) => void;
  onEdit: (client: Client) => void;
}

const ClientCard: React.FC<ClientCardProps> = ({ client, onOpen, onEdit }) => {
  const statusClass = statusStyles[client.status] ?? 'bg-slate-500/10 text-slate-400 border-slate-500/30';

  return (
    <Card
      glowOnHover
      onClick={() => onOpen(client)}
      className="p-5 h-full"
      aria-label={`Open client ${client.companyName}`}
    >
      <div className="flex items-start justify-between gap-4">
        <div>
          <h3 className="text-lg font-semibold text-[var(--fg)]">{client.companyName}</h3>
        </div>
        <div className="flex items-center gap-2">
          <span className={`px-2 py-1 text-xs font-semibold rounded-full border ${statusClass}`}>
            {formatStatus(client.status)}
          </span>
          <button
            type="button"
            onClick={(event) => {
              event.stopPropagation();
              onEdit(client);
            }}
            className="p-2 rounded-full text-[var(--fg-muted)] hover:text-[var(--fg)] hover:bg-[var(--surface)] transition"
            aria-label={`Edit ${client.companyName}`}
          >
            <Pencil className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="mt-6 flex items-center gap-2 text-sm text-[var(--fg-muted)]">
        <CalendarDays className="w-4 h-4" />
        <span>Updated {formatDate(client.updatedAt)}</span>
      </div>
    </Card>
  );
};

export default ClientCard;
