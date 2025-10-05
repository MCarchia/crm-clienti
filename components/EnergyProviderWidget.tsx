
import React, { useMemo } from 'react';
import type { Contract } from '../types';
import { LightningBoltIcon, FireIcon } from './Icons';

interface EnergyProviderWidgetProps {
  contracts: Contract[];
}

const EnergyProviderWidget: React.FC<EnergyProviderWidgetProps> = ({ contracts }) => {
  const providerStats = useMemo(() => {
    const providersToTrack = ['Enel', 'Duferco', 'Edison', 'Lenergia', 'A2A'];

    const stats = providersToTrack.map(provider => {
      return {
        name: provider,
        count: contracts.filter(c => c.provider.toLowerCase() === provider.toLowerCase()).length,
        colorKey: provider,
      };
    });

    return stats;
  }, [contracts]);

  const providerColors: Record<string, { bg: string, text: string }> = {
    'Enel': { bg: 'bg-yellow-100', text: 'text-yellow-600' },
    'Duferco': { bg: 'bg-green-100', text: 'text-green-600' },
    'Edison': { bg: 'bg-red-100', text: 'text-red-600' },
    'Lenergia': { bg: 'bg-purple-100', text: 'text-purple-600' },
    'A2A': { bg: 'bg-sky-100', text: 'text-sky-600' },
  };

  const totalEnergyContracts = useMemo(() => contracts.length, [contracts]);
  if (totalEnergyContracts === 0) {
    return null;
  }

  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      <div className="flex items-center mb-4">
        <LightningBoltIcon className="h-6 w-6 text-yellow-500 mr-1" />
        <FireIcon className="h-6 w-6 text-orange-500 mr-3" />
        <h2 className="text-xl font-bold text-slate-800">Riepilogo Contratti Energia e Gas</h2>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4 text-center">
        {providerStats.map(stat => (
          <div key={stat.name} className={`p-4 rounded-lg flex flex-col items-center justify-center ${providerColors[stat.colorKey]?.bg || 'bg-slate-100'}`}>
            <div className="flex-grow flex flex-col items-center justify-center">
              <LightningBoltIcon className={`h-8 w-8 mb-2 ${providerColors[stat.colorKey]?.text || 'text-slate-600'}`} />
              <p className="text-2xl font-bold text-slate-800">{stat.count}</p>
              <p className={`text-sm font-semibold ${providerColors[stat.colorKey]?.text || 'text-slate-600'}`}>{stat.name}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default EnergyProviderWidget;
