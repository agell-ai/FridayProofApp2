import React, { useState } from 'react';
import { Plus } from 'lucide-react';
import ClientCard from '../components/Clients/ClientCard';
import ClientDetails from '../components/Clients/ClientDetails';
import { useClients } from '../hooks/useClients';
import { Client } from '../types';

const Clients: React.FC = () => {
  const { clients, isLoading } = useClients();
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);

  if (selectedClient) {
    return <ClientDetails client={selectedClient} onClose={() => setSelectedClient(null)} />;
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-sunset-purple"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
        </div>
        <button className="bg-sunset-orange text-white font-semibold py-2 px-4 rounded-lg hover:opacity-90 transition-opacity flex items-center space-x-2">
          <Plus className="w-5 h-5" />
          <span>New Client</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {clients.map((client) => (
          <ClientCard
            key={client.id}
            client={client}
            onClick={() => setSelectedClient(client)}
          />
        ))}
      </div>

      {clients.length === 0 && (
        <div className="text-center py-12">
          <div className="text-gray-400 mb-4">No clients found</div>
          <button className="bg-sunset-orange text-white font-semibold py-2 px-4 rounded-lg hover:opacity-90 transition-opacity flex items-center space-x-2 mx-auto">
            <Plus className="w-5 h-5" />
            <span>Add Your First Client</span>
          </button>
        </div>
      )}
    </div>
  );
};

export default Clients;