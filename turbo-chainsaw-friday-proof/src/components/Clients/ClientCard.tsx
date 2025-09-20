import React from 'react';
import { Building2, MapPin, Users, ExternalLink } from 'lucide-react';
import { Client } from '../../types';
import { Card } from '../Shared/Card';

interface ClientCardProps {
  client: Client;
  onClick: () => void;
}

const statusColors = {
  active: 'bg-green-500/20 text-green-400 border-green-500/30',
  inactive: 'bg-gray-500/20 text-gray-400 border-gray-500/30',
  prospect: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
};

const ClientCard: React.FC<ClientCardProps> = ({ client, onClick }) => {
  return (
    <Card
      glowOnHover={true}
      onClick={onClick}
      className="p-6 group"
    >
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center space-x-3">
          <div className="w-12 h-12 bg-gradient-primary rounded-lg flex items-center justify-center">
            <Building2 className="w-6 h-6 text-white" />
          </div>
          <div>
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white group-hover:text-gradient-orange transition-colors">
              {client.companyName}
            </h3>
            <p className="text-sm text-[var(--fg-muted)]">{client.industry}</p>
          </div>
        </div>
        <span className={`px-3 py-1 rounded-full text-xs font-medium border ${statusColors[client.status]}`}>
          {client.status.charAt(0).toUpperCase() + client.status.slice(1)}
        </span>
      </div>

      <div className="space-y-3">
        <div className="flex items-center space-x-2 text-sm text-[var(--fg-muted)]">
          <MapPin className="w-4 h-4" />
          <span className="text-[var(--fg)]">{client.location}</span>
        </div>

        <div className="flex items-center space-x-2 text-sm text-[var(--fg-muted)]">
          <Users className="w-4 h-4" />
          <span className="text-[var(--fg)]">{client.contacts.length} contact{client.contacts.length !== 1 ? 's' : ''}</span>
        </div>

        {client.website && (
          <div className="flex items-center space-x-2 text-sm text-[var(--fg-muted)]">
            <ExternalLink className="w-4 h-4" />
            <span className="truncate text-[var(--fg)]">{client.website.replace('https://', '')}</span>
          </div>
        )}
      </div>

      <div className="mt-4 pt-4 border-t border-[var(--border)]">
        <div className="flex items-center justify-between text-sm text-[var(--fg-muted)]">
          <span className="text-[var(--fg)]">{client.projectIds.length} active project{client.projectIds.length !== 1 ? 's' : ''}</span>
          <span className="text-[var(--fg-muted)]">Updated {new Date(client.updatedAt).toLocaleDateString()}</span>
        </div>
      </div>
    </Card>
  );
};

export default ClientCard;