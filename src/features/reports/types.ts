/**
 * Reflects the new columns in your updated transactions_inventory_summary view.
 */
export interface InventorySummary {
  Item: string;
  Warehouse: string;

  on_hand_total: number;
  on_hand_stock: number;
  on_hand_consign: number;
  on_hand_hold: number;

  inbound_total: number;
  inbound_stock: number;
  inbound_consign: number;
  inbound_hold: number;

  scheduled_outbound_total: number;
  scheduled_outbound_stock: number;
  scheduled_outbound_consign: number;
  scheduled_outbound_hold: number;

  future_inventory_total: number;
  future_inventory_stock: number;
  future_inventory_consign: number;
  future_inventory_hold: number;
}

export interface TransactionDetail {
  detail_id: string;
  item_name: string;
  quantity: number;
  inventory_status: string;
  lot_number?: string;
  comments?: string;
  status: string;
}

export interface TransactionHeader {
  transaction_id: string;
  transaction_type: string;
  transaction_date: string;
  warehouse: string;
  reference_number?: string;
  customer_name?: string;
  shipping_document?: string;
  customer_po?: string;
  details: TransactionDetail[];
}

// For Customer Report
export interface CustomerReport {
  all_transactions: TransactionHeader[];
}

// For Item Report
export interface ItemReport {
  item_name: string;
  total_on_hand: {
    total: number;
    stock: number;
    consign: number;
    hold: number;
  };
  by_warehouse: {
    warehouse: string;
    on_hand: {
      total: number;
      stock: number;
      consign: number;
      hold: number;
    };
    inbound: { total: number; stock: number; consign: number; hold: number };
    scheduled_outbound: {
      total: number;
      stock: number;
      consign: number;
      hold: number;
    };
    future_inventory: {
      total: number;
      stock: number;
      consign: number;
      hold: number;
    };
  }[];
  transactions: TransactionHeader[];
  transaction_count: number;
}

// For Product Report
export interface ProductReport {
  product_name: string;
  items: {
    item_name: string;
    total_on_hand: {
      total: number;
      stock: number;
      consign: number;
      hold: number;
    };
    by_warehouse: {
      warehouse: string;
      on_hand: {
        total: number;
        stock: number;
        consign: number;
        hold: number;
      };
    }[];
  }[];
  transactions: TransactionHeader[];
  transaction_count: number;
}

// For Warehouse Report
export interface WarehouseReport {
  warehouse_name: string;
  items: {
    item_name: string;
    on_hand: {
      total: number;
      stock: number;
      consign: number;
      hold: number;
    };
    inbound: {
      total: number;
      stock: number;
      consign: number;
      hold: number;
    };
    scheduled_outbound: {
      total: number;
      stock: number;
      consign: number;
      hold: number;
    };
  }[];
}

// For Negative Inventory
export interface NegativeInventoryReport {
  negative_items: {
    item_name: string;
    warehouse: string;
    on_hand_total: number;
  }[];
}
