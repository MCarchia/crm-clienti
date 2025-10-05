
import React from 'react';
import type { Client, Contract } from '../types';
import { ContractType } from '../types';
import { PencilIcon, TrashIcon, PlusIcon, LightningBoltIcon, DeviceMobileIcon, UserGroupIcon } from './Icons';

// --- VISTA GESTIONE CLIENTI ---
interface ClientListViewProps {
  clients: Client[];
  onAdd: () => void;
  onEdit: (client: Client) => void;
  onDelete: (clientId: string) => void;
}

export const ClientListView: React.FC<ClientListViewProps> = ({ clients, onAdd, onEdit, onDelete }) => {
  return (
    <div className="animate-fade-in">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-slate-700">Anagrafica Clienti</h1>
        <button
          onClick={onAdd}
          className="flex items-center justify-center bg-sky-500 hover:bg-sky-600 text-white font-bold py-2 px-4 rounded-lg shadow-md transition-transform transform hover:scale-105"
        >
          <PlusIcon className="h-5 w-5 mr-2" />
          Nuovo Cliente
        </button>
      </div>
      <div className="bg-white rounded-xl shadow-lg overflow-hidden">
        <div className="overflow-x-auto">
           {clients.length > 0 ? (
            <table className="w-full text-sm text-left text-slate-500">
                <thead className="text-xs text-slate-700 uppercase bg-slate-50">
                <tr>
                    <th scope="col" className="px-6 py-3">Nome</th>
                    <th scope="col" className="px-6 py-3">Contatti</th>
                    <th scope="col" className="px-6 py-3 text-right">Azioni</th>
                </tr>
                </thead>
                <tbody>
                {/* FIX: Property 'name' does not exist on type 'Client'. Sort by lastName then firstName. */}
                {clients.sort((a,b) => a.lastName.localeCompare(b.lastName) || a.firstName.localeCompare(b.firstName)).map(client => (
                    <tr key={client.id} className="bg-white border-b hover:bg-slate-50">
                    {/* FIX: Property 'name' does not exist on type 'Client'. Use firstName and lastName. */}
                    <td className="px-6 py-4 font-medium text-slate-900 whitespace-nowrap">{`${client.firstName} ${client.lastName}`}</td>
                    <td className="px-6 py-4">
                        <div>{client.email}</div>
                        {/* FIX: Property 'phone' does not exist on type 'Client'. Use 'mobilePhone'. */}
                        <div className="text-xs text-slate-400">{client.mobilePhone}</div>
                    </td>
                    <td className="px-6 py-4 text-right">
                        <button onClick={() => onEdit(client)} className="font-medium text-sky-600 hover:underline mr-4">Modifica</button>
                        <button onClick={() => onDelete(client.id)} className="font-medium text-red-600 hover:underline">Elimina</button>
                    </td>
                    </tr>
                ))}
                </tbody>
            </table>
            ) : (
                <div className="text-center py-20 px-6">
                    <UserGroupIcon className="mx-auto h-12 w-12 text-slate-400" />
                    <h3 className="mt-2 text-lg font-medium text-slate-800">Nessun cliente trovato</h3>
                    <p className="mt-1 text-sm text-slate-500">Inizia aggiungendo il tuo primo cliente.</p>
                </div>
            )}
        </div>
      </div>
    </div>
  );
};

// --- VISTA GESTIONE CONTRATTI ---
interface ContractListViewProps {
  contracts: Contract[];
  clients: Client[];
  onAdd: () => void;
  onEdit: (contract: Contract) => void;
  onDelete: (contractId: string) => void;
}

export const ContractListView: React.FC<ContractListViewProps> = ({ contracts, clients, onAdd, onEdit, onDelete }) => {
  const getClientName = (clientId: string) => {
    // FIX: Property 'name' does not exist on type 'Client'. Use firstName and lastName.
    const client = clients.find(c => c.id === clientId);
    return client ? `${client.firstName} ${client.lastName}` : 'N/D';
  };
  
  return (
    <div className="animate-fade-in">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-slate-700">Gestione Contratti</h1>
        <button
          onClick={onAdd}
          disabled={clients.length === 0}
          className="flex items-center justify-center bg-sky-500 hover:bg-sky-600 text-white font-bold py-2 px-4 rounded-lg shadow-md transition-transform transform hover:scale-105 disabled:bg-slate-300 disabled:cursor-not-allowed disabled:transform-none"
          title={clients.length === 0 ? "Aggiungi almeno un cliente prima di creare un contratto" : ""}
        >
          <PlusIcon className="h-5 w-5 mr-2" />
          Nuovo Contratto
        </button>
      </div>
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
            <div className="overflow-x-auto">
            {contracts.length > 0 ? (
                <table className="w-full text-sm text-left text-slate-500">
                    <thead className="text-xs text-slate-700 uppercase bg-slate-50">
                    <tr>
                        <th scope="col" className="px-6 py-3">Tipo</th>
                        <th scope="col" className="px-6 py-3">Cliente</th>
                        <th scope="col" className="px-6 py-3">Fornitore</th>
                        <th scope="col" className="px-6 py-3">Scadenza</th>
                        <th scope="col" className="px-6 py-3 text-right">Azioni</th>
                    </tr>
                    </thead>
                    <tbody>
                    {contracts.map(contract => (
                        <tr key={contract.id} className="bg-white border-b hover:bg-slate-50">
                        <td className="px-6 py-4">
                            {contract.type === ContractType.Electricity ? (
                                <LightningBoltIcon className="h-5 w-5 text-yellow-500" title="Energia Elettrica" />
                            ) : (
                                <DeviceMobileIcon className="h-5 w-5 text-sky-500" title="Telefonia" />
                            )}
                        </td>
                        <td className="px-6 py-4 font-medium text-slate-900 whitespace-nowrap">{getClientName(contract.clientId)}</td>
                        <td className="px-6 py-4">{contract.provider}</td>
                        <td className={`px-6 py-4 font-semibold ${contract.endDate ? 'text-red-600' : 'text-slate-400'}`}>
                           {contract.endDate ? new Date(contract.endDate).toLocaleDateString('it-IT') : 'N/D'}
                        </td>
                        <td className="px-6 py-4 text-right">
                            <button onClick={() => onEdit(contract)} className="font-medium text-sky-600 hover:underline mr-4">Modifica</button>
                            <button onClick={() => onDelete(contract.id)} className="font-medium text-red-600 hover:underline">Elimina</button>
                        </td>
                        </tr>
                    ))}
                    </tbody>
                </table>
             ) : (
                <div className="text-center py-20 px-6">
                    <svg className="mx-auto h-12 w-12 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                        <path vectorEffect="non-scaling-stroke" strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    <h3 className="mt-2 text-lg font-medium text-slate-800">Nessun contratto trovato</h3>
                    <p className="mt-1 text-sm text-slate-500">{clients.length > 0 ? 'Crea il tuo primo contratto.' : 'Aggiungi un cliente per poter creare un contratto.'}</p>
                 </div>
             )}
            </div>
        </div>
    </div>
  );
};
