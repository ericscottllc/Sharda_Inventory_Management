import { useState, useEffect } from 'react';
import { supabase } from '../../../lib/supabase';

export function useTransactionForm() {
  const [warehouses, setWarehouses] = useState<{ "Common Name": string }[]>([]);
  const [items, setItems] = useState<{ item_name: string }[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  async function fetchData() {
    try {
      setLoading(true);
      // Fetch warehouses
      const { data: warehouseData, error: whError } = await supabase
        .from('warehouse')
        .select('"Common Name"');
      if (whError) throw whError;
      setWarehouses(warehouseData || []);

      // Fetch items
      const { data: itemData, error: itemError } = await supabase
        .from('item')
        .select('item_name');
      if (itemError) throw itemError;
      setItems(itemData || []);
    } catch (error) {
      console.error('Error fetching form data:', error);
    } finally {
      setLoading(false);
    }
  }

  return { warehouses, items, loading };
}
