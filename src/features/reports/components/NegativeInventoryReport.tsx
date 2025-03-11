import React, { useEffect, useState } from 'react';
import { useReports } from '../hooks/useReports';
import { NegativeInventoryReport as NegativeInventoryReportType } from '../types';

interface NegativeInventoryReportProps {
  onItemClick: (itemName: string) => void;
}

export function NegativeInventoryReport({ onItemClick }: NegativeInventoryReportProps) {
  const { getNegativeInventoryReport } = useReports();
  const [loading, setLoading] = useState(true);
  const [report, setReport] = useState<NegativeInventoryReportType | null>(null);

  useEffect(() => {
    // Load once on mount
    (async () => {
      setLoading(true);
      const data = await getNegativeInventoryReport();
      setReport(data);
      setLoading(false);
    })();
    // no dependencies => won't re-run
  }, []);

  if (loading) {
    return <div className="text-center py-10">Loading negative inventory...</div>;
  }

  if (!report || report.negative_items.length === 0) {
    return <div className="text-center py-10">No negative inventory found.</div>;
  }

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-bold">Negative Inventory</h2>
      <table className="min-w-full bg-white">
        <thead>
          <tr>
            <th className="px-4 py-2">Item</th>
            <th className="px-4 py-2">Warehouse</th>
            <th className="px-4 py-2">On-Hand Total</th>
          </tr>
        </thead>
        <tbody>
          {report.negative_items.map((neg, i) => (
            <tr
              key={i}
              onClick={() => onItemClick(neg.item_name)}
              className="cursor-pointer hover:bg-gray-100"
            >
              <td className="border px-4 py-2">{neg.item_name}</td>
              <td className="border px-4 py-2">{neg.warehouse}</td>
              <td className="border px-4 py-2">{neg.on_hand_total}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <p className="text-sm text-gray-600">
        Click any row to view that Item’s report.
      </p>
    </div>
  );
}
