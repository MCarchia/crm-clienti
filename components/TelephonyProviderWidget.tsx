
import React, { useMemo } from 'react';
import type { Contract } from '../types';
import { DeviceMobileIcon } from './Icons';

interface TelephonyProviderWidgetProps {
  contracts: Contract[];
}

const TelephonyProviderWidget: React.FC<TelephonyProviderWidgetProps> = ({ contracts }) => {
  const providerStats = useMemo(() => {
    const providersToTrack = ['TIM', 'Vodafone', 'WindTre', 'Enel'];

    const stats = providersToTrack.map(provider => {
      const isEnel = provider === 'Enel';
      return {
        name: isEnel ? 'Enel Fibra' : provider,
        count: contracts.filter(c => c.provider.toLowerCase() === provider.toLowerCase()).length,
        colorKey: provider, 
      };
    });

    return stats;
  }, [contracts]);

  const providerColors: Record<string, { bg: string, text: string }> = {
    'TIM': { bg: 'bg-blue-100', text: 'text-blue-600' },
    'Vodafone': { bg: 'bg-red-100', text: 'text-red-600' },
    'WindTre': { bg: 'bg-orange-100', text: 'text-orange-600' },
    'Enel': { bg: 'bg-green-100', text: 'text-green-600' },
  };

  const totalTelephonyContracts = useMemo(() => contracts.length, [contracts]);
  if (totalTelephonyContracts === 0) {
    return null;
  }

  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      <h2 className="text-xl font-bold text-slate-800 mb-4">Riepilogo Contratti Telefonia</h2>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
        {providerStats.map(stat => (
          <div key={stat.name} className={`p-4 rounded-lg flex flex-col items-center justify-center ${providerColors[stat.colorKey]?.bg || 'bg-slate-100'}`}>
            <div className="flex-grow flex flex-col items-center justify-center">
              <DeviceMobileIcon className={`h-8 w-8 mb-2 ${providerColors[stat.colorKey]?.text || 'text-slate-600'}`} />
              <p className="text-2xl font-bold text-slate-800">{stat.count}</p>
              <p className={`text-sm font-semibold ${providerColors[stat.colorKey]?.text || 'text-slate-600'}`}>{stat.name}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TelephonyProviderWidget;
