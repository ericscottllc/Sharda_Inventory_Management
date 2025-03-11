import { useState, useCallback, useEffect } from 'react';
import { supabase } from '../../../lib/supabase';
import { CountData, Variance, PendingTransaction } from '../types';
import toast from 'react-hot-toast';

export function useInventoryCount() {
  const [selectedWarehouse, setSelectedWarehouse] = useState('');
  const [selectedDate, setSelectedDate] = useState('');
  const [countData, setCountData] = useState<CountData[]>([]);
  const [calculatedInventory, setCalculatedInventory] = useState<any[]>([]);
  const [variances, setVariances] = useState<Variance[]>([]);
  const [pendingTransactions, setPendingTransactions] = useState<PendingTransaction[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Fetch initial inventory when warehouse and date are selected
  useEffect(() => {
    async function fetchInitialInventory() {
      if (!selectedWarehouse || !selectedDate) return;

      try {
        setLoading(true);
        setError('');

        // Get inventory snapshot using the view and subquery to get latest snapshot
        const { data: snapshot, error: snapshotError } = await supabase
          .from('transactions_inventory_snapshot_by_date')
          .select('*')
          .eq('warehouse', selectedWarehouse)
          .lte('transaction_date', selectedDate)
          .order('transaction_date', { ascending: false });

        if (snapshotError) throw snapshotError;

        // Get unique items with their latest snapshot
        const latestSnapshots = snapshot?.reduce((acc: any[], curr: any) => {
          const existingIndex = acc.findIndex(item => item.item_name === curr.item_name);
          if (existingIndex === -1) {
            acc.push(curr);
          }
          return acc;
        }, []);

        // Pre-populate count data with existing inventory items
        const initialCountData = (latestSnapshots || [])
          .filter(item => 
            item['On Hand: Total'] !== 0 || 
            item['Inbound: Total'] !== 0 || 
            item['Scheduled Outbound: Total'] !== 0
          )
          .map(item => ({
            itemName: item.item_name,
            quantity: 0, // Start with 0 for physical count
            notes: ''
          }));

        setCountData(initialCountData);
        setCalculatedInventory(latestSnapshots || []);

      } catch (err: any) {
        console.error('Error fetching initial inventory:', err);
        setError(err.message);
        toast.error('Failed to fetch inventory items');
      } finally {
        setLoading(false);
      }
    }

    fetchInitialInventory();
  }, [selectedWarehouse, selectedDate]);

  const calculateVariances = useCallback(async () => {
    if (!selectedWarehouse || !selectedDate || !countData.length) return;

    try {
      setLoading(true);
      setError('');

      // Calculate variances using the existing calculated inventory
      const newVariances = countData.map(count => {
        const calculated = calculatedInventory.find(calc => calc.item_name === count.itemName) || {
          'On Hand: Total': 0
        };

        return {
          itemName: count.itemName,
          physicalCount: count.quantity,
          calculatedCount: calculated['On Hand: Total'] || 0,
          variance: count.quantity - (calculated['On Hand: Total'] || 0)
        };
      });

      setVariances(newVariances);

      // Get pending transactions that might explain variances
      const { data: pendingTx, error: pendingError } = await supabase
        .from('transaction_header')
        .select(`
          *,
          details:transaction_detail(*)
        `)
        .eq('warehouse', selectedWarehouse)
        .eq('details.status', 'Pending')
        .lte('transaction_date', selectedDate)
        .order('transaction_date', { ascending: true });

      if (pendingError) throw pendingError;

      setPendingTransactions(pendingTx || []);

    } catch (err: any) {
      console.error('Error calculating variances:', err);
      setError(err.message);
      toast.error('Failed to calculate variances');
    } finally {
      setLoading(false);
    }
  }, [selectedWarehouse, selectedDate, countData, calculatedInventory]);

  const generateAdjustment = useCallback(async () => {
    if (!selectedWarehouse || !selectedDate || variances.length === 0) return;

    try {
      setLoading(true);
      setError('');

      // Create adjustment transaction
      const adjustmentId = crypto.randomUUID();
      const { error: headerError } = await supabase
        .from('transaction_header')
        .insert({
          transaction_id: adjustmentId,
          transaction_type: 'Adjustment',
          transaction_date: selectedDate,
          warehouse: selectedWarehouse,
          reference_type: 'Inventory Count',
          reference_number: `ADJ-COUNT-${new Date().getTime()}`,
          comments: `Inventory count adjustment for ${selectedWarehouse} as of ${selectedDate}`
        });

      if (headerError) throw headerError;

      // Create adjustment details for each variance
      const details = variances
        .filter(v => v.variance !== 0)
        .map(variance => ({
          detail_id: crypto.randomUUID(),
          transaction_id: adjustmentId,
          item_name: variance.itemName,
          quantity: Math.abs(variance.variance),
          inventory_status: 'Stock',
          status: 'Completed',
          comments: variance.variance > 0 ? 'Count overage' : 'Count shortage'
        }));

      const { error: detailsError } = await supabase
        .from('transaction_detail')
        .insert(details);

      if (detailsError) throw detailsError;

      toast.success('Adjustment transaction created successfully');
      return adjustmentId;

    } catch (err: any) {
      console.error('Error generating adjustment:', err);
      setError(err.message);
      toast.error('Failed to generate adjustment');
      return null;
    } finally {
      setLoading(false);
    }
  }, [selectedWarehouse, selectedDate, variances]);

  return {
    selectedWarehouse,
    selectedDate,
    countData,
    calculatedInventory,
    variances,
    pendingTransactions,
    loading,
    error,
    setSelectedWarehouse,
    setSelectedDate,
    setCountData,
    calculateVariances,
    generateAdjustment
  };
}