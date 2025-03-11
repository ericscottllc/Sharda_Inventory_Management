import React, { useEffect, useState } from 'react';
import { useReports } from '../hooks/useReports';
import { CustomerReport as CustomerReportType, TransactionDetail } from '../types';

/**
 * A simpler substring search on customer_name to avoid flicker from repeated re-renders.
 */
export function CustomerReport() {
  const { getCustomerReport } = useReports();
  const [loading, setLoading] = useState(true);
  const [report, setReport] = useState<CustomerReportType | null>(null);

  const [searchTerm, setSearchTerm] = useState('');
  const [flattenedRows, setFlattenedRows] = useState<any[]>([]);

  // Load once on mount
  useEffect(() => {
    (async () => {
      setLoading(true);
      const data = await getCustomerReport();
      setReport(data);
      setLoading(false);
    })();
    // empty deps => won't re-run
  }, []);

  // Flatten transactions once we have them
  useEffect(() => {
    if (!report) {
      setFlattenedRows([]);
      return;
    }
    const allTx = report.all_transactions || [];
    const rows = allTx.flatMap((tx) =>
      tx.details.map((detail: TransactionDetail) => ({
        date: tx.transaction_date,
        customer_name: tx.customer_name || '',
        reference_number: tx.reference_number || '',
        warehouse: tx.warehouse,
        item_name: detail.item_name,
        quantity: detail.quantity,
      }))
    );
    setFlattenedRows(rows);
  }, [report]);

  if (loading) {
    return <div className="text-center py-10">Loading customer transactions...</div>;
  }

  if (!report || (report.all_transactions?.length ?? 0) === 0) {
    return <div className="text-center py-10">No customer transactions found.</div>;
  }

  // Filter by substring in customer_name
  const displayedRows = flattenedRows.filter((row) =>
    row.customer_name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-bold">Customer Report</h2>

      <label className="block font-medium mb-1">
        Search by Customer Name:
      </label>
      <input
        type="text"
        className="border rounded px-3 py-1 w-full max-w-md"
        placeholder="Type a customer name..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
      />

      {displayedRows.length > 0 ? (
        <table className="min-w-full bg-white mt-4">
          <thead>
            <tr>
              <th className="px-4 py-2">Date</th>
              <th className="px-4 py-2">Customer</th>
              <th className="px-4 py-2">Reference #</th>
              <th className="px-4 py-2">Warehouse</th>
              <th className="px-4 py-2">Item</th>
              <th className="px-4 py-2">Quantity</th>
            </tr>
          </thead>
          <tbody>
            {displayedRows.map((row, idx) => (
              <tr key={idx}>
                <td className="border px-4 py-2">
                  {row.date ? new Date(row.date).toLocaleDateString() : ''}
                </td>
                <td className="border px-4 py-2">{row.customer_name}</td>
                <td className="border px-4 py-2">{row.reference_number}</td>
                <td className="border px-4 py-2">{row.warehouse}</td>
                <td className="border px-4 py-2">{row.item_name}</td>
                <td className="border px-4 py-2">
                  {row.quantity.toLocaleString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <p className="mt-4">No matching transactions found.</p>
      )}
    </div>
  );
}
