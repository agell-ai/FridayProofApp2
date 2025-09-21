import React from 'react';
import { Building2, ExternalLink, MapPin, Users } from 'lucide-react';
import { Client } from '../../types';
import { Card } from '../Shared/Card';

interface ClientCardProps {
  client: Client;
  onClick: () => void;
}

const statusColors: Record<Client['status'], string> = {
  active: 'bg-green-500/20 text-green-400 border-green-500/30',
  inactive: 'bg-gray-500/20 text-gray-400 border-gray-500/30',
  prospect: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30'
};

const ClientCard: React.FC<ClientCardProps> = ({ client, onClick }) => {
  return (
    <Card
      glowOnHover={true}
      onClick={onClick}
      className="group flex h-full flex-col p-6"
    >
      <div className="flex flex-col gap-4">
        <div className="flex items-start justify-between gap-3">
          <div className="flex min-w-0 items-start gap-3">
            <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-lg bg-gradient-primary">
              <Building2 className="w-6 h-6 text-white" />
            </div>
            <div className="min-w-0">
              <h3 className="break-words text-lg font-semibold leading-tight text-gray-900 transition-colors group-hover:text-gradient-orange dark:text-white">
                {client.companyName}
              </h3>
              <p className="mt-1 break-words text-sm text-[var(--fg-muted)]">{client.industry}</p>
            </div>
          </div>
          <span className={`flex-shrink-0 rounded-full border px-3 py-1 text-xs font-medium ${statusColors[client.status]}`}>
            {client.status.charAt(0).toUpperCase() + client.status.slice(1)}
          </span>
        </div>

        <div className="space-y-3">
          <div className="flex items-start gap-2 text-sm text-[var(--fg-muted)]">
            <MapPin className="mt-0.5 h-4 w-4 flex-shrink-0" />
            <span className="text-[var(--fg)] break-words">{client.location}</span>
          </div>

          <div className="flex items-start gap-2 text-sm text-[var(--fg-muted)]">
            <Users className="mt-0.5 h-4 w-4 flex-shrink-0" />
            <span className="text-[var(--fg)]">
              {client.contacts.length} contact{client.contacts.length !== 1 ? 's' : ''}
            </span>
          </div>

          {client.website && (
            <div className="flex items-start gap-2 text-sm text-[var(--fg-muted)]">
              <ExternalLink className="mt-0.5 h-4 w-4 flex-shrink-0" />
              <span className="text-[var(--fg)] break-words">
                {client.website.replace('https://', '').replace('http://', '')}
              </span>
            </div>
          )}
        </div>
      </div>

      <div className="mt-6 border-t border-[var(--border)] pt-4">
        <div className="flex flex-col gap-2 text-sm text-[var(--fg-muted)] sm:flex-row sm:items-center sm:justify-between">
          <span className="text-[var(--fg)]">
            {client.projectIds.length} active project{client.projectIds.length !== 1 ? 's' : ''}
          </span>
          <span className="text-[var(--fg-muted)]">Updated {new Date(client.updatedAt).toLocaleDateString()}</span>
        </div>
      </div>
    </Card>
  );
};

export default ClientCard;