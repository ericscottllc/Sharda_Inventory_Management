export type TransactionType = 'Inbound' | 'Outbound' | 'Adjustment';
export type InventoryStatus = 'Stock' | 'Consignment' | 'Hold';
export type TransactionStatus = 'Pending' | 'Shipped' | 'Received' | 'Completed';
export type ReferenceType = 'Sales Order' | 'Purchase Order' | 'Transfer Order' | 'Other';

export interface TransactionHeader {
  transaction_id: string;
  transaction_type: TransactionType;
  transaction_date: string;
  warehouse: string | null;
  warehouse_details?: {
    "Common Name": string;
    "Establishment Name": string;
  } | null;
  reference_type: ReferenceType;
  reference_number: string;
  shipment_carrier?: string;
  shipping_document?: string;
  customer_po?: string;
  customer_name?: string;
  comments?: string;
  related_transaction_id?: string;
  created_at?: string;
  details?: TransactionDetail[];
}

export interface TransactionDetail {
  detail_id: string;
  transaction_id: string;
  item_name: string;
  quantity: number;
  inventory_status: InventoryStatus;
  status: TransactionStatus;
  lot_number?: string;
  comments?: string;
}

export interface TransactionFormData {
  type: TransactionType;
  date: string;
  referenceType: ReferenceType;
  warehouse: string;
  inventoryStatus: InventoryStatus;
  status: TransactionStatus;
  shipmentCarrier?: string;
  shippingDocument?: string;
  customerPO?: string;
  customerName?: string;
  comments?: string;
  relatedTransactionId?: string;
  // For transfer orders
  transferToWarehouse?: string;
  transferToInventoryStatus?: InventoryStatus;
  transferDate?: string;
  items: {
    item_name: string;
    quantity: number | '';
    lot_number?: string;
    comments?: string;
    status?: TransactionStatus;
  }[];
}
