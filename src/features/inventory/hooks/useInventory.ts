import { useState, useEffect } from 'react';
import { supabase } from '../../../lib/supabase';
import { InventoryItem, InventoryFilters } from '../types';
import toast from 'react-hot-toast';

export function useInventory() {
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [warehouses, setWarehouses] = useState<string[]>([]);

  useEffect(() => {
    fetchWarehouses();
  }, []);

  async function fetchWarehouses() {
    try {
      const { data, error } = await supabase
        .from('warehouse')
        .select('"Common Name"');

      if (error) throw error;
      setWarehouses(data?.map(w => w['Common Name']) || []);
    } catch (error) {
      console.error('Error fetching warehouses:', error);
      toast.error('Failed to fetch warehouses');
    }
  }

  async function calculateInventory(filters: InventoryFilters) {
    try {
      setLoading(true);

      // First, get all items
      const { data: items, error: itemsError } = await supabase
        .from('item')
        .select('item_name');

      if (itemsError) throw itemsError;

      // Get all transactions
      const { data: transactions, error: transError } = await supabase
        .from('transaction_header')
        .select(`
          transaction_id,
          transaction_type,
          transaction_date,
          warehouse,
          details:transaction_detail (
            item_name,
            quantity,
            inventory_status,
            status
          )
        `)
        .order('transaction_date', { ascending: true });

      if (transError) throw transError;

      // Calculate inventory for each item
      const inventoryMap = new Map<string, InventoryItem>();

      // Initialize inventory for all items
      items?.forEach(item => {
        warehouses.forEach(warehouse => {
          ['Stock', 'Consignment', 'Hold'].forEach(status => {
            const key = `${item.item_name}|${warehouse}|${status}`;
            inventoryMap.set(key, {
              item_name: item.item_name,
              warehouse,
              inventory_status: status as InventoryStatus,
              on_hand: 0,
              committed: 0,
              on_order: 0
            });
          });
        });
      });

      // Sort transactions by date and type (Inbound first, then Outbound)
      const sortedTransactions = transactions?.sort((a, b) => {
        // First sort by date
        const dateCompare = new Date(a.transaction_date).getTime() - new Date(b.transaction_date).getTime();
        if (dateCompare !== 0) return dateCompare;
        
        // If same date, Inbound comes before Outbound
        if (a.transaction_type === 'Inbound' && b.transaction_type === 'Outbound') return -1;
        if (a.transaction_type === 'Outbound' && b.transaction_type === 'Inbound') return 1;
        
        return 0;
      });

      // Process transactions
      sortedTransactions?.forEach(trans => {
        trans.details?.forEach(detail => {
          // Default to 'Stock' if inventory_status is missing
          const status = detail.inventory_status || 'Stock';
          const key = `${detail.item_name}|${trans.warehouse}|${status}`;
          const item = inventoryMap.get(key) || {
            item_name: detail.item_name,
            warehouse: trans.warehouse,
            inventory_status: status,
            on_hand: 0,
            committed: 0,
            on_order: 0
          };

          // Ensure quantity is a number
          const quantity = typeof detail.quantity === 'number' ? detail.quantity : parseFloat(detail.quantity) || 0;

          if (trans.transaction_type === 'Inbound') {
            if (detail.status === 'Received') {
              item.on_hand += quantity;
            } else if (detail.status === 'Pending') {
              item.on_order += quantity;
            }
          } else if (trans.transaction_type === 'Outbound') {
            if (detail.status === 'Shipped') {
              item.on_hand -= quantity;
            } else if (detail.status === 'Pending') {
              item.committed += quantity;
            }
          }

          inventoryMap.set(key, item);
        });
      });

      // Convert map to array and filter
      let results = Array.from(inventoryMap.values());

      // Apply filters
      if (filters.status) {
        results = results.filter(item => item.inventory_status === filters.status);
      }
      if (filters.search) {
        const search = filters.search.toLowerCase();
        results = results.filter(item => 
          item.item_name.toLowerCase().includes(search) ||
          item.warehouse.toLowerCase().includes(search)
        );
      }

      setInventory(results);
    } catch (error) {
      console.error('Error calculating inventory:', error);
      toast.error('Failed to calculate inventory');
    } finally {
      setLoading(false);
    }
  }

  return {
    inventory,
    loading,
    warehouses,
    calculateInventory
  };
}