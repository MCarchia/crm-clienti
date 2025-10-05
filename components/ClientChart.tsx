
import React, { useMemo } from 'react';
import type { Client } from '../types';
import { ChartBarIcon } from './Icons';

interface ClientChartProps {
  clients: Client[];
}

const ClientChart: React.FC<ClientChartProps> = ({ clients }) => {
  const chartData = useMemo(() => {
    const data: { month: string; year: number; key: string; count: number }[] = [];
    const now = new Date();
    
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      data.push({
        month: d.toLocaleString('it-IT', { month: 'short' }).replace('.', '').replace(/^\w/, (c) => c.toUpperCase()),
        year: d.getFullYear(),
        key: `${d.getFullYear()}-${d.getMonth()}`,
        count: 0,
      });
    }

    clients.forEach(client => {
      const clientDate = new Date(client.createdAt);
      const clientKey = `${clientDate.getFullYear()}-${clientDate.getMonth()}`;
      const monthData = data.find(m => m.key === clientKey);
      if (monthData) {
        monthData.count++;
      }
    });

    return data;
  }, [clients]);

  const maxCount = useMemo(() => {
    const count = Math.max(...chartData.map(d => d.count));
    return count === 0 ? 1 : count;
  }, [chartData]);
  
  const totalClientsLast6Months = useMemo(() => chartData.reduce((sum, item) => sum + item.count, 0), [chartData]);

  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      <div className="flex items-center mb-4">
        <ChartBarIcon className="h-6 w-6 text-sky-500 mr-3" />
        <h2 className="text-xl font-bold text-slate-800">Andamento Clienti (Ultimi 6 Mesi)</h2>
      </div>
      <div className="text-sm text-slate-500 mb-6">
        Totale nuovi clienti negli ultimi 6 mesi: <span className="font-bold text-slate-700">{totalClientsLast6Months}</span>
      </div>
      <div className="flex justify-around items-end h-48 space-x-2 text-center" aria-label="Grafico a barre dei nuovi clienti">
        {chartData.map(({ month, count, year }) => (
          <div key={`${month}-${year}`} className="flex flex-col items-center justify-end w-full h-full group">
             <div className="text-sm font-bold text-slate-700 mb-1 opacity-0 group-hover:opacity-100 transition-opacity duration-300" aria-hidden="true">
              {count}
            </div>
            <div
              className="w-3/4 bg-sky-300 hover:bg-sky-500 rounded-t-lg transition-all duration-500 ease-out cursor-pointer"
              style={{ height: `${(count / maxCount) * 100}%` }}
              role="img"
              aria-label={`Barra per ${month}: ${count} clienti`}
            >
               <div className="sr-only">{`${month}: ${count} clienti`}</div>
            </div>
            <div className="mt-2 text-xs font-medium text-slate-500 uppercase">{month}</div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ClientChart;
