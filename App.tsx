import React, { useState, useCallback, useMemo, useEffect } from 'react';
import type { Client, Contract, Address } from './types';
import { ContractType } from './types';
import * as api from './services/api';
import { ClientListView, ContractListView } from './components/ClientListView';
import { ClientFormModal, ContractFormModal } from './components/ClientFormModal';
import ClientChart from './components/ClientChart';
import Sidebar from './components/Sidebar';
import { SearchIcon, MenuIcon } from './components/Icons';
import ExpiringContractsWidget from './components/ExpiringContractsWidget';
import CommissionSummaryWidget from './components/CommissionSummaryWidget';
import SearchModal from './components/SearchModal';
import TelephonyProviderPieChart from './components/TelephonyProviderPieChart';
import EnergyProviderPieChart from './components/EnergyProviderPieChart';
import { Spinner } from './components/Spinner';
import TotalContractsWidget from './components/TotalContractsWidget';
import TotalClientsWidget from './components/TotalClientsWidget';

type View = 'dashboard' | 'contracts' | 'clients';

const months = [
    { value: 1, name: 'Gennaio' }, { value: 2, name: 'Febbraio' },
    { value: 3, name: 'Marzo' }, { value: 4, name: 'Aprile' },
    { value: 5, name: 'Maggio' }, { value: 6, name: 'Giugno' },
    { value: 7, name: 'Luglio' }, { value: 8, name: 'Agosto' },
    { value: 9, name: 'Settembre' }, { value: 10, name: 'Ottobre' },
    { value: 11, name: 'Novembre' }, { value: 12, name: 'Dicembre' },
];

const App: React.FC = () => {
  const [clients, setClients] = useState<Client[]>([]);
  const [contracts, setContracts] = useState<Contract[]>([]);
  const [providers, setProviders] = useState<string[]>([]);
  
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  const [view, setView] = useState<View>('dashboard');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const [isClientModalOpen, setIsClientModalOpen] = useState(false);
  const [editingClient, setEditingClient] = useState<Client | null>(null);

  const [isContractModalOpen, setIsContractModalOpen] = useState(false);
  const [editingContract, setEditingContract] = useState<Contract | null>(null);

  // State for commission filters
  const [selectedCommissionYear, setSelectedCommissionYear] = useState<string>('all');
  const [selectedCommissionMonth, setSelectedCommissionMonth] = useState<string>('all');
  const [selectedDashboardProvider, setSelectedDashboardProvider] = useState<string>('all');

  // State for contract provider filter
  const [selectedProviderFilter, setSelectedProviderFilter] = useState<string>('all');

  // State for global search
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchModalOpen, setIsSearchModalOpen] = useState(false);

  // State for dark mode
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    if (typeof window !== 'undefined' && window.localStorage) {
      if (localStorage.theme === 'dark' || (!('theme' in localStorage) && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
        return 'dark';
      }
    }
    return 'light';
  });

  useEffect(() => {
    const root = window.document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      root.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [theme]);

  const handleThemeSwitch = () => {
    setTheme(theme === 'dark' ? 'light' : 'dark');
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        const [clientsData, contractsData, providersData] = await Promise.all([
          api.getAllClients(),
          api.getAllContracts(),
          api.getAllProviders(),
        ]);
        setClients(clientsData);
        setContracts(contractsData);
        setProviders(providersData);
      } catch (error) {
        console.error("Failed to fetch initial data", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);


  const expiringContracts = useMemo(() => {
    const now = new Date();
    const thirtyDaysFromNow = new Date();
    thirtyDaysFromNow.setDate(now.getDate() + 30);

    now.setHours(0, 0, 0, 0);

    return contracts.filter(c => {
      if (!c.endDate) return false;
      const endDate = new Date(c.endDate);
      return endDate >= now && endDate <= thirtyDaysFromNow;
    });
  }, [contracts]);

  const availableYears = useMemo(() => {
    const years = new Set(
      contracts
        .map(c => c.startDate ? new Date(c.startDate).getFullYear() : null)
        .filter((year): year is number => year !== null)
    );

    for (let i = 2050; i >= 2023; i--) {
        years.add(i);
    }

    return Array.from(years).sort((a, b) => Number(a) - Number(b));
  }, [contracts]);

  const filteredContractsByDate = useMemo(() => {
    return contracts.filter(contract => {
        if (!contract.startDate) return false;
        const contractDate = new Date(contract.startDate);
        const contractYear = contractDate.getFullYear();
        const contractMonth = contractDate.getMonth() + 1;

        const yearAsNum = parseInt(selectedCommissionYear, 10);
        const monthAsNum = parseInt(selectedCommissionMonth, 10);

        const yearMatch = (selectedCommissionYear === 'all') || (contractYear === yearAsNum);
        const monthMatch = (selectedCommissionMonth === 'all') || (contractMonth === monthAsNum);
        const providerMatch = (selectedDashboardProvider === 'all') || (contract.provider === selectedDashboardProvider);

        return yearMatch && monthMatch && providerMatch;
    });
  }, [contracts, selectedCommissionYear, selectedCommissionMonth, selectedDashboardProvider]);

  const totalCommission = useMemo(() => {
    return filteredContractsByDate
        .reduce((sum, contract) => sum + (contract.commission ?? 0), 0);
  }, [filteredContractsByDate]);
  
  const totalFilteredContracts = useMemo(() => {
    return filteredContractsByDate.length;
  }, [filteredContractsByDate]);

  const totalClients = useMemo(() => clients.length, [clients]);

  const filteredContracts = useMemo(() => {
    if (selectedProviderFilter === 'all') {
      return contracts;
    }
    return contracts.filter(c => c.provider === selectedProviderFilter);
  }, [contracts, selectedProviderFilter]);

  const energyAndGasContracts = useMemo(() => 
    contracts.filter(c => c.type === ContractType.Electricity || c.type === ContractType.Gas),
    [contracts]
  );

  const telephonyContracts = useMemo(() => 
    contracts.filter(c => c.type === ContractType.Telephony),
    [contracts]
  );

  const formatAddressForSearch = (address?: Address): string => {
    if (!address) return '';
    return [
        address.street,
        address.zipCode,
        address.city,
        address.state,
        address.country
    ].filter(Boolean).join(' ').toLowerCase();
  };

  const searchResults = useMemo(() => {
    if (searchQuery.length < 2) {
        return { clients: [], contracts: [] };
    }
    
    const lowerCaseQuery = searchQuery.toLowerCase();
    
    const foundClients = clients.filter(client => {
      const clientIbans = client.ibans ? client.ibans.map(iban => iban.value).join(' ') : '';
      const oldIban = (client as any).iban || ''; // For backward compatibility with data not yet migrated

      const clientSearchableString = [
        client.firstName,
        client.lastName,
        client.email,
        client.codiceFiscale,
        client.mobilePhone,
        clientIbans,
        oldIban,
        formatAddressForSearch(client.legalAddress),
        formatAddressForSearch(client.residentialAddress)
      ].filter(Boolean).join(' ').toLowerCase();
      
      return clientSearchableString.includes(lowerCaseQuery);
    });

    const foundContracts = contracts.filter(contract => 
        contract.provider.toLowerCase().includes(lowerCaseQuery) ||
        (contract.contractCode && contract.contractCode.toLowerCase().includes(lowerCaseQuery)) ||
        formatAddressForSearch(contract.supplyAddress).includes(lowerCaseQuery)
    );

    return { clients: foundClients, contracts: foundContracts };
  }, [searchQuery, clients, contracts]);


  // Client Handlers
  const handleOpenClientModal = useCallback(() => {
    setEditingClient(null);
    setIsClientModalOpen(true);
  }, []);

  const handleEditClient = useCallback((client: Client) => {
    setEditingClient(client);
    setIsClientModalOpen(true);
  }, []);

  const handleCloseClientModal = useCallback(() => {
    setIsClientModalOpen(false);
    setEditingClient(null);
  }, []);

  const handleSaveClient = useCallback(async (clientData: Omit<Client, 'id' | 'createdAt'>) => {
    setIsSaving(true);
    try {
      if (editingClient) {
        const updatedClient = await api.updateClient({ ...editingClient, ...clientData });
        setClients(clients.map(c => c.id === updatedClient.id ? updatedClient : c));
      } else {
        const newClient = await api.createClient(clientData);
        setClients([...clients, newClient]);
      }
      handleCloseClientModal();
    } catch(error) {
        console.error("Failed to save client:", error);
    } finally {
        setIsSaving(false);
    }
  }, [clients, editingClient, handleCloseClientModal]);

  const handleDeleteClient = useCallback(async (clientId: string) => {
    if (window.confirm('Sei sicuro di voler eliminare questo cliente? Verranno eliminati anche tutti i contratti associati.')) {
      await api.deleteClient(clientId);
      setClients(clients.filter(c => c.id !== clientId));
      setContracts(contracts.filter(c => c.clientId !== clientId));
    }
  }, [clients, contracts]);

  // Contract Handlers
  const handleOpenContractModal = useCallback(() => {
    setEditingContract(null);
    setIsContractModalOpen(true);
  }, []);
  
  const handleEditContract = useCallback((contract: Contract) => {
    setEditingContract(contract);
    setIsContractModalOpen(true);
  }, []);

  const handleCloseContractModal = useCallback(() => {
    setIsContractModalOpen(false);
    setEditingContract(null);
  }, []);

  const handleSaveContract = useCallback(async (contractData: Omit<Contract, 'id'>) => {
    setIsSaving(true);
    try {
        if (editingContract) {
            const updatedContract = await api.updateContract({ ...editingContract, ...contractData });
            setContracts(contracts.map(c => c.id === updatedContract.id ? updatedContract : c));
        } else {
            const newContract = await api.createContract(contractData);
            setContracts([...contracts, newContract]);
        }
        handleCloseContractModal();
    } catch (error) {
        console.error("Failed to save contract", error);
    } finally {
        setIsSaving(false);
    }
  }, [contracts, editingContract, handleCloseContractModal]);

  const handleDeleteContract = useCallback(async (contractId: string) => {
    if (window.confirm('Sei sicuro di voler eliminare questo contratto?')) {
      await api.deleteContract(contractId);
      setContracts(contracts.filter(c => c.id !== contractId));
    }
  }, [contracts]);

  const handleAddProvider = useCallback(async (newProvider: string) => {
    const trimmedProvider = newProvider.trim();
    if (trimmedProvider && !providers.some(p => p.toLowerCase() === trimmedProvider.toLowerCase())) {
        const updatedProviders = await api.addProvider(trimmedProvider);
        setProviders(updatedProviders);
    }
  }, [providers]);

  // Search Handlers
  const handleOpenSearchModal = useCallback(() => {
    setIsSearchModalOpen(true);
  }, []);
  
  const handleCloseSearchModal = useCallback(() => {
    setIsSearchModalOpen(false);
  }, []);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        handleCloseSearchModal();
      }
    };
    if (isSearchModalOpen) {
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isSearchModalOpen, handleCloseSearchModal]);

  const getClientNameForContract = useCallback((clientId: string) => {
    const client = clients.find(c => c.id === clientId);
    return client ? `${client.firstName} ${client.lastName}` : 'Sconosciuto';
  }, [clients]);

  const handleClientSearchResultClick = useCallback((client: Client) => {
      setView('clients');
      handleEditClient(client);
      setSearchQuery('');
      handleCloseSearchModal();
  }, [handleEditClient, handleCloseSearchModal]);

  const handleContractSearchResultClick = useCallback((contract: Contract) => {
      setView('contracts');
      handleEditContract(contract);
      setSearchQuery('');
      handleCloseSearchModal();
  }, [handleEditContract, handleCloseSearchModal]);

  const handleNavigation = (view: View) => {
    setView(view);
    setIsSidebarOpen(false);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen bg-slate-50 dark:bg-slate-900">
        <Spinner size="lg" />
      </div>
    );
  }

  const renderView = () => {
    switch(view) {
      case 'dashboard':
        return (
          <div className="space-y-6 animate-fade-in">
            <ExpiringContractsWidget contracts={expiringContracts} clients={clients} onEdit={handleEditContract} onDelete={(contractId) => handleDeleteContract(contractId)} />
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
               <div className="lg:col-span-1 space-y-6">
                    <TotalClientsWidget totalClients={totalClients} />
                    <CommissionSummaryWidget 
                        totalCommission={totalCommission}
                        selectedYear={selectedCommissionYear}
                        selectedMonth={selectedCommissionMonth}
                        selectedProvider={selectedDashboardProvider}
                    />
                    <TotalContractsWidget
                        totalContracts={totalFilteredContracts}
                        selectedYear={selectedCommissionYear}
                        selectedMonth={selectedCommissionMonth}
                        selectedProvider={selectedDashboardProvider}
                    />
                    <div className="bg-white rounded-xl shadow-lg p-6 dark:bg-slate-800">
                        <h3 className="text-lg font-bold text-slate-800 dark:text-slate-200 mb-4">Filtri Dashboard</h3>
                        <div className="space-y-4">
                            <div>
                                <label htmlFor="year-filter" className="block text-sm font-medium text-slate-600 dark:text-slate-400 mb-1">Anno</label>
                                <select id="year-filter" value={selectedCommissionYear} onChange={e => setSelectedCommissionYear(e.target.value)} className="w-full p-2 border border-slate-300 rounded-md dark:bg-slate-700 dark:border-slate-600 dark:text-white">
                                    <option value="all">Tutti</option>
                                    {availableYears.map(year => <option key={year} value={year}>{year}</option>)}
                                </select>
                            </div>
                            <div>
                                <label htmlFor="month-filter" className="block text-sm font-medium text-slate-600 dark:text-slate-400 mb-1">Mese</label>
                                <select id="month-filter" value={selectedCommissionMonth} onChange={e => setSelectedCommissionMonth(e.target.value)} className="w-full p-2 border border-slate-300 rounded-md dark:bg-slate-700 dark:border-slate-600 dark:text-white">
                                    <option value="all">Tutti</option>
                                    {months.map(month => <option key={month.value} value={month.value}>{month.name}</option>)}
                                </select>
                            </div>
                             <div>
                                <label htmlFor="provider-dashboard-filter" className="block text-sm font-medium text-slate-600 dark:text-slate-400 mb-1">Fornitore</label>
                                <select 
                                    id="provider-dashboard-filter" 
                                    value={selectedDashboardProvider} 
                                    onChange={e => setSelectedDashboardProvider(e.target.value)} 
                                    className="w-full p-2 border border-slate-300 rounded-md dark:bg-slate-700 dark:border-slate-600 dark:text-white"
                                >
                                    <option value="all">Tutti</option>
                                    {providers.sort().map(provider => <option key={provider} value={provider}>{provider}</option>)}
                                </select>
                            </div>
                        </div>
                    </div>
               </div>
               <div className="lg:col-span-2">
                 <ClientChart clients={clients} />
               </div>
            </div>
             <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <TelephonyProviderPieChart contracts={telephonyContracts} />
                <EnergyProviderPieChart contracts={energyAndGasContracts} />
             </div>
          </div>
        );
      case 'clients':
        return <ClientListView clients={clients} contracts={contracts} onAdd={handleOpenClientModal} onEdit={handleEditClient} onDelete={(clientId) => handleDeleteClient(clientId)} />;
      case 'contracts':
        return <ContractListView
          contracts={filteredContracts}
          clients={clients}
          onAdd={handleOpenContractModal}
          onEdit={handleEditContract}
          onDelete={(contractId) => handleDeleteContract(contractId)}
          availableProviders={providers}
          selectedProvider={selectedProviderFilter}
          onProviderChange={setSelectedProviderFilter}
        />;
      default:
        return <div>Seleziona una vista</div>;
    }
  };

  return (
    <div className="bg-slate-50 text-slate-800 dark:bg-slate-900 dark:text-slate-200 min-h-screen">
      <Sidebar
        currentView={view}
        onNavigate={handleNavigation}
        expiringContractsCount={expiringContracts.length}
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
        theme={theme}
        onThemeSwitch={handleThemeSwitch}
      />
      
      <div className="lg:pl-64">
        <div className="flex flex-col h-screen">
            <header className="bg-white/80 backdrop-blur-sm border-b border-slate-200 px-4 sm:px-6 py-3 sticky top-0 z-20 dark:bg-slate-900/80 dark:border-slate-700">
                <div className="flex items-center">
                    <button
                        onClick={() => setIsSidebarOpen(true)}
                        className="lg:hidden p-2 -ml-2 mr-2 text-slate-600 hover:bg-slate-100 rounded-md dark:text-slate-300 dark:hover:bg-slate-800"
                        aria-label="Apri menu"
                    >
                        <MenuIcon className="h-6 w-6" />
                    </button>
                    <div className="relative w-full max-w-lg lg:mx-auto">
                        <button
                            onClick={handleOpenSearchModal}
                            className="w-full flex items-center text-left bg-slate-100 border border-transparent rounded-md py-2.5 pl-10 pr-4 text-sm text-slate-500 hover:bg-slate-200 transition-colors dark:bg-slate-800 dark:text-slate-400 dark:hover:bg-slate-700"
                        >
                            Cerca clienti, contratti...
                        </button>
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <SearchIcon className="h-5 w-5 text-slate-400" />
                        </div>
                    </div>
              </div>
            </header>

            <main className="flex-1 overflow-y-auto p-6 lg:p-8">
            {renderView()}
            </main>
        </div>
      </div>

      <SearchModal
        isOpen={isSearchModalOpen}
        onClose={handleCloseSearchModal}
        query={searchQuery}
        onQueryChange={setSearchQuery}
        results={searchResults}
        onClientClick={handleClientSearchResultClick}
        onContractClick={handleContractSearchResultClick}
        getClientName={getClientNameForContract}
      />

      {isClientModalOpen && (
        <ClientFormModal
          isOpen={isClientModalOpen}
          onClose={handleCloseClientModal}
          onSave={handleSaveClient}
          client={editingClient}
          isSaving={isSaving}
        />
      )}
      {isContractModalOpen && (
        <ContractFormModal
          isOpen={isContractModalOpen}
          onClose={handleCloseContractModal}
          onSave={handleSaveContract}
          contract={editingContract}
          clients={clients}
          providers={providers}
          onAddProvider={handleAddProvider}
          isSaving={isSaving}
        />
      )}
    </div>
  );
};

export default App;