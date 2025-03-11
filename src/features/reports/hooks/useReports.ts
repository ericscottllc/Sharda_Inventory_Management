import { useState } from 'react';
import toast from 'react-hot-toast';
import { supabase } from '../../../lib/supabase';
import {
  CustomerReport,
  ItemReport,
  ProductReport,
  WarehouseReport,
  NegativeInventoryReport,
  InventorySummary,
} from '../types';

/**
 * Fetch from the "inventory_view" view using filters.
 */
async function fetchInventorySummary(filters: {
  item?: string;
  items?: string[];
  warehouse?: string;
  negative?: boolean;
}): Promise<InventorySummary[]> {
  let query = supabase.from('inventory_view').select('*');

  if (filters.item) {
    query = query.eq('"Item Name"', filters.item);
  }
  if (filters.items && filters.items.length > 0) {
    query = query.in('"Item Name"', filters.items);
  }
  if (filters.warehouse) {
    query = query.eq('Warehouse', filters.warehouse);
  }
  if (filters.negative) {
    query = query.lt('"On Hand: Total"', 0);
  }

  const { data, error } = await query;
  if (error) {
    console.error('fetchInventorySummary error:', error);
    throw error;
  }
  return (data || []) as InventorySummary[];
}

export function useReports() {
  const [loading, setLoading] = useState(false);

  // 1) CUSTOMER REPORT
  async function getCustomerReport(): Promise<CustomerReport> {
    try {
      const { data, error } = await supabase
        .from('transaction_header')
        .select('*, details:transaction_detail(*)')
        .order('transaction_date', { ascending: false })
        .limit(1000);

      if (error) throw error;
      return { all_transactions: data || [] };
    } catch (err) {
      console.error('Error fetching customer report:', err);
      toast.error('Failed to fetch customer report');
      return { all_transactions: [] };
    }
  }

  // 2) ITEM REPORT
  async function getItemReport(itemName: string): Promise<ItemReport> {
    try {
      const summary = await fetchInventorySummary({ item: itemName });

      const totalOnHand = {
        total: 0,
        stock: 0,
        consign: 0,
        hold: 0
      };

      const byWarehouse = summary.map(row => ({
        warehouse: row.Warehouse,
        on_hand: {
          total: row['On Hand: Total'] || 0,
          stock: row['On Hand: Stock'] || 0,
          consign: row['On Hand: Consignment'] || 0,
          hold: row['On Hand: Hold'] || 0
        },
        inbound: {
          total: row['Inbound: Total'] || 0,
          stock: row['Inbound: Stock'] || 0,
          consign: row['Inbound: Consignment'] || 0,
          hold: row['Inbound: Hold'] || 0
        },
        scheduled_outbound: {
          total: row['Scheduled Outbound: Total'] || 0,
          stock: row['Scheduled Outbound: Stock'] || 0,
          consign: row['Scheduled Outbound: Consign'] || 0,
          hold: row['Scheduled Outbound: Hold'] || 0
        },
        future_inventory: {
          total: row['Future Inventory: Total'] || 0,
          stock: row['Future Inventory: Stock'] || 0,
          consign: row['Future Inventory: Consign'] || 0,
          hold: row['Future Inventory: Hold'] || 0
        }
      }));

      // Calculate totals
      byWarehouse.forEach(wh => {
        totalOnHand.total += wh.on_hand.total;
        totalOnHand.stock += wh.on_hand.stock;
        totalOnHand.consign += wh.on_hand.consign;
        totalOnHand.hold += wh.on_hand.hold;
      });

      // Get transactions for this item
      const { data: transactions, error } = await supabase
        .from('transaction_header')
        .select('*, details:transaction_detail(*)')
        .eq('details.item_name', itemName)
        .order('transaction_date', { ascending: false })
        .limit(50);

      if (error) throw error;

      return {
        item_name: itemName,
        total_on_hand: totalOnHand,
        by_warehouse: byWarehouse,
        transactions: transactions || [],
        transaction_count: transactions?.length || 0
      };
    } catch (err) {
      console.error('Error fetching item report:', err);
      toast.error('Failed to fetch item report');
      return {
        item_name: itemName,
        total_on_hand: { total: 0, stock: 0, consign: 0, hold: 0 },
        by_warehouse: [],
        transactions: [],
        transaction_count: 0
      };
    }
  }

  // 3) PRODUCT REPORT
  async function getProductReport(productName: string): Promise<ProductReport> {
    try {
      // Get all items for this product
      const { data: itemsData, error: itemsError } = await supabase
        .from('item')
        .select('item_name')
        .eq('product_name', productName);

      if (itemsError) throw itemsError;
      const itemNames = itemsData?.map(i => i.item_name) || [];

      // Get inventory for all items
      const summary = await fetchInventorySummary({ items: itemNames });

      // Group by item
      const itemSummaries = new Map();
      summary.forEach(row => {
        const itemName = row['Item Name'];
        if (!itemSummaries.has(itemName)) {
          itemSummaries.set(itemName, {
            item_name: itemName,
            total_on_hand: {
              total: 0,
              stock: 0,
              consign: 0,
              hold: 0
            },
            by_warehouse: []
          });
        }

        const item = itemSummaries.get(itemName);
        item.total_on_hand.total += row['On Hand: Total'] || 0;
        item.total_on_hand.stock += row['On Hand: Stock'] || 0;
        item.total_on_hand.consign += row['On Hand: Consignment'] || 0;
        item.total_on_hand.hold += row['On Hand: Hold'] || 0;

        item.by_warehouse.push({
          warehouse: row.Warehouse,
          on_hand: {
            total: row['On Hand: Total'] || 0,
            stock: row['On Hand: Stock'] || 0,
            consign: row['On Hand: Consignment'] || 0,
            hold: row['On Hand: Hold'] || 0
          }
        });
      });

      // Get transactions for these items
      const { data: transactions, error } = await supabase
        .from('transaction_header')
        .select('*, details:transaction_detail(*)')
        .in('details.item_name', itemNames)
        .order('transaction_date', { ascending: false })
        .limit(50);

      if (error) throw error;

      return {
        product_name: productName,
        items: Array.from(itemSummaries.values()),
        transactions: transactions || [],
        transaction_count: transactions?.length || 0
      };
    } catch (err) {
      console.error('Error fetching product report:', err);
      toast.error('Failed to fetch product report');
      return {
        product_name: productName,
        items: [],
        transactions: [],
        transaction_count: 0
      };
    }
  }

  // 4) WAREHOUSE REPORT
  async function getWarehouseReport(warehouseName: string): Promise<WarehouseReport> {
    try {
      const summary = await fetchInventorySummary({ warehouse: warehouseName });

      const items = summary.map(row => ({
        item_name: row['Item Name'],
        on_hand: {
          total: row['On Hand: Total'] || 0,
          stock: row['On Hand: Stock'] || 0,
          consign: row['On Hand: Consignment'] || 0,
          hold: row['On Hand: Hold'] || 0
        },
        inbound: {
          total: row['Inbound: Total'] || 0,
          stock: row['Inbound: Stock'] || 0,
          consign: row['Inbound: Consignment'] || 0,
          hold: row['Inbound: Hold'] || 0
        },
        scheduled_outbound: {
          total: row['Scheduled Outbound: Total'] || 0,
          stock: row['Scheduled Outbound: Stock'] || 0,
          consign: row['Scheduled Outbound: Consign'] || 0,
          hold: row['Scheduled Outbound: Hold'] || 0
        }
      }));

      return {
        warehouse_name: warehouseName,
        items
      };
    } catch (err) {
      console.error('Error fetching warehouse report:', err);
      toast.error('Failed to fetch warehouse report');
      return { warehouse_name: warehouseName, items: [] };
    }
  }

  // 5) NEGATIVE INVENTORY REPORT
  async function getNegativeInventoryReport(): Promise<NegativeInventoryReport> {
    try {
      const summary = await fetchInventorySummary({ negative: true });
      const negativeItems = summary.map(row => ({
        item_name: row['Item Name'],
        warehouse: row.Warehouse,
        on_hand_total: row['On Hand: Total'] || 0
      }));
      return { negative_items: negativeItems };
    } catch (err) {
      console.error('Error fetching negative inventory report:', err);
      toast.error('Failed to fetch negative inventory report');
      return { negative_items: [] };
    }
  }

  return {
    loading,
    getCustomerReport,
    getItemReport,
    getProductReport,
    getWarehouseReport,
    getNegativeInventoryReport
  };
}