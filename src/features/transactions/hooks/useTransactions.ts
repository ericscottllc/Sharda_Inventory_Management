import { useState, useEffect } from 'react';
import { supabase } from '../../../lib/supabase';
import toast from 'react-hot-toast';
import {
  TransactionHeader,
  TransactionDetail,
  TransactionFormData,
  TransactionStatus,
  TransactionType
} from '../types';
import { addBusinessDays } from '../utils/dateUtils';

export function useTransactions() {
  const [transactions, setTransactions] = useState<TransactionHeader[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTransactions();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function fetchTransactions() {
    try {
      setLoading(true);
      console.log('Fetching transactions...');

      const { data, error } = await supabase
        .from('transaction_header')
        .select(`
          *,
          details:transaction_detail (
            detail_id,
            transaction_id,
            item_name,
            quantity,
            inventory_status,
            status,
            lot_number,
            comments
          )
        `)
        .order('transaction_date', { ascending: false });

      if (error) {
        console.error('Error fetching transactions:', error);
        throw error;
      }

      setTransactions(data || []);
    } catch (error: any) {
      console.error('Error fetching transactions:', error);
      toast.error('Failed to fetch transactions');
    } finally {
      setLoading(false);
    }
  }

  /**
   * Update a single transaction detail record
   */
  async function updateTransactionDetail(transactionId: string, detail: TransactionDetail) {
    try {
      console.log('Updating transaction detail:', { transactionId, detail });

      // Validate status by transaction type
      // We'll re-fetch the transaction to see if it's inbound, outbound, etc.
      const transactionType = await getTransactionType(transactionId);

      if (!isStatusValidForType(detail.status, transactionType)) {
        toast.error(`Status "${detail.status}" not allowed for ${transactionType} transaction.`);
        return false;
      }

      const { error } = await supabase
        .from('transaction_detail')
        .update({
          quantity: detail.quantity,
          inventory_status: detail.inventory_status,
          status: detail.status,
          lot_number: detail.lot_number,
          comments: detail.comments
        })
        .eq('detail_id', detail.detail_id);

      if (error) {
        console.error('Error updating transaction detail:', error);
        if (error.code === '42501') {
          toast.error('You do not have permission to update transaction details');
          return false;
        }
        throw error;
      }

      toast.success('Transaction detail updated');
      await fetchTransactions();
      return true;
    } catch (error: any) {
      console.error('Error updating transaction detail:', error);
      if (error.code === '42501') {
        toast.error('You do not have permission to perform this action');
      } else {
        toast.error('Failed to update transaction detail');
      }
      return false;
    }
  }

// /home/project/src/features/transactions/hooks/useTransactions.ts

/**
 * Update transaction header fields (e.g. warehouse, carrier, date, etc.)
 */
async function updateTransactionHeader(transactionId: string, fields: Partial<TransactionHeader>) {
  try {
    console.log('Updating transaction header:', { transactionId, fields });

    const { error } = await supabase
      .from('transaction_header')
      .update({
        // Include the date here so it actually updates in DB
        transaction_date: fields.transaction_date,
        warehouse: fields.warehouse,
        shipment_carrier: fields.shipment_carrier,
        shipping_document: fields.shipping_document,
        customer_po: fields.customer_po,
        customer_name: fields.customer_name,
        comments: fields.comments
      })
      .eq('transaction_id', transactionId);

    if (error) {
      console.error('Error updating transaction header:', error);
      if (error.code === '42501') {
        toast.error('You do not have permission to update transactions');
        return false;
      }
      throw error;
    }

    toast.success('Transaction header updated');
    await fetchTransactions();
    return true;
  } catch (error: any) {
    console.error('Error updating transaction header:', error);
    if (error.code === '42501') {
      toast.error('You do not have permission to perform this action');
    } else {
      toast.error('Failed to update transaction header');
    }
    return false;
  }
}

  

  /**
   * Allows user to mark all "Pending" details in a transaction to the "next" status
   */
  async function advanceTransactionToNextStep(transaction: TransactionHeader) {
    try {
      console.log('Advancing transaction to next step:', transaction);

      const nextStatus = getNextStatusForType(transaction.transaction_type);
      if (!nextStatus) {
        toast.error(`No next step configured for ${transaction.transaction_type}`);
        return false;
      }

      // Update all detail lines that are "Pending" to the next status
      const { error } = await supabase
        .from('transaction_detail')
        .update({ status: nextStatus })
        .eq('transaction_id', transaction.transaction_id)
        .eq('status', 'Pending');

      if (error) {
        console.error('Error advancing transaction:', error);
        throw error;
      }

      toast.success(`Advanced ${transaction.reference_number} to ${nextStatus}`);
      await fetchTransactions();
      return true;
    } catch (error: any) {
      console.error('Error advancing transaction:', error);
      toast.error('Failed to advance transaction');
      return false;
    }
  }

  /**
   * Create a brand-new transaction
   */
  async function createTransaction(data: TransactionFormData) {
    try {
      console.log('Creating new transaction:', data);

      // Validate the chosen statuses
      if (!isStatusValidForType(data.status, data.type)) {
        toast.error(`Status "${data.status}" is not allowed for ${data.type} transaction`);
        return null;
      }

      let prefix = 'ADJ-';
      if (data.type === 'Inbound') prefix = 'IB-';
      else if (data.type === 'Outbound') prefix = 'OB-';

      const { data: lastRef } = await supabase
        .from('transaction_header')
        .select('reference_number')
        .ilike('reference_number', `${prefix}%`)
        .order('reference_number', { ascending: false })
        .limit(1);

      let sequence = '00001';
      if (lastRef && lastRef.length > 0) {
        const lastNum = parseInt(lastRef[0].reference_number.split('-')[1]);
        sequence = String(lastNum + 1).padStart(5, '0');
      }

      const referenceNumber = `${prefix}${sequence}`;
      const transaction_id = crypto.randomUUID();

      // Insert transaction_header
      const { data: headerData, error: headerError } = await supabase
        .from('transaction_header')
        .insert([{
          transaction_id,
          transaction_type: data.type,
          transaction_date: data.date,
          warehouse: data.warehouse || null,
          reference_type: data.referenceType,
          reference_number: referenceNumber,
          shipment_carrier: data.shipmentCarrier,
          shipping_document: data.shippingDocument,
          customer_po: data.customerPO,
          customer_name: data.customerName,
          comments: data.comments,
          related_transaction_id: data.relatedTransactionId || null
        }])
        .select()
        .single();

      if (headerError) {
        console.error('Error creating transaction header:', headerError);
        if (headerError.code === '42501') {
          toast.error('You do not have permission to create transactions');
          return null;
        }
        throw headerError;
      }

      // Insert transaction_detail
      const details = data.items.map(item => {
        // If user tries to set detail's status for inbound/outbound incorrectly, you can validate each item.
        // For simplicity, we unify them under the header's status, but you could do per-line checks.
        return {
          detail_id: crypto.randomUUID(),
          transaction_id,
          item_name: item.item_name,
          quantity: typeof item.quantity === 'number' ? item.quantity : 0,
          inventory_status: data.inventoryStatus,
          status: data.status, // or item.status if you allow per-line statuses
          lot_number: item.lot_number || null,
          comments: item.comments || null
        };
      });

      const { error: detailsError } = await supabase
        .from('transaction_detail')
        .insert(details);

      if (detailsError) {
        console.error('Error creating transaction details:', detailsError);
        if (detailsError.code === '42501') {
          toast.error('You do not have permission to create transaction details');
          return null;
        }
        throw detailsError;
      }

      // If Transfer, create inbound mirror transaction
      if (data.referenceType === 'Transfer Order' && data.transferToWarehouse) {
        // e.g. IB-00001
        const inboundReference = `IB-${sequence}`;
        const inboundId = crypto.randomUUID();
        const transferDate = data.transferDate ||
          addBusinessDays(new Date(data.date), 2).toISOString().split('T')[0];

        // Insert inbound header
        const { error: inboundHeaderError } = await supabase
          .from('transaction_header')
          .insert([{
            transaction_id: inboundId,
            transaction_type: 'Inbound',
            transaction_date: transferDate,
            warehouse: data.transferToWarehouse,
            reference_type: 'Transfer Order',
            reference_number: inboundReference,
            shipment_carrier: data.shipmentCarrier,
            shipping_document: data.shippingDocument,
            comments: data.comments,
            related_transaction_id: transaction_id
          }]);

        if (inboundHeaderError) {
          console.error('Error creating inbound for transfer:', inboundHeaderError);
          throw inboundHeaderError;
        }

        // Insert inbound details
        const inboundDetails = data.items.map(item => ({
          detail_id: crypto.randomUUID(),
          transaction_id: inboundId,
          item_name: item.item_name,
          quantity: typeof item.quantity === 'number' ? item.quantity : 0,
          inventory_status: data.transferToInventoryStatus || data.inventoryStatus,
          status: 'Pending', // all transfer inbound lines start as Pending
          lot_number: item.lot_number || null,
          comments: item.comments || null
        }));

        const { error: inboundDetailsError } = await supabase
          .from('transaction_detail')
          .insert(inboundDetails);

        if (inboundDetailsError) {
          console.error('Error creating inbound details for transfer:', inboundDetailsError);
          throw inboundDetailsError;
        }
      }

      toast.success('Transaction created successfully');
      await fetchTransactions();
      return headerData;
    } catch (error: any) {
      console.error('Error creating transaction:', error);
      if (error.code === '42501') {
        toast.error('You do not have permission to perform this action');
      } else {
        toast.error(error.message || 'Failed to create transaction');
      }
      return null;
    }
  }

  // ----- Helpers -----

  /**
   * Returns the transaction_type for a given transaction_id
   */
  async function getTransactionType(transactionId: string): Promise<TransactionType> {
    const { data, error } = await supabase
      .from('transaction_header')
      .select('transaction_type')
      .eq('transaction_id', transactionId)
      .single();

    if (error || !data) {
      console.error('Failed to fetch transaction type', error);
      return 'Adjustment'; // fallback if error
    }
    return data.transaction_type as TransactionType;
  }

  /**
   * Checks if a given status is valid for the given transaction type
   */
  function isStatusValidForType(status: TransactionStatus, transactionType: TransactionType) {
    // inbound → 'Pending' or 'Received'
    // outbound → 'Pending' or 'Shipped'
    // adjustment → 'Pending' or 'Completed'
    switch (transactionType) {
      case 'Inbound':
        return status === 'Pending' || status === 'Received';
      case 'Outbound':
        return status === 'Pending' || status === 'Shipped';
      case 'Adjustment':
        return status === 'Pending' || status === 'Completed';
      default:
        return true;
    }
  }

  /**
   * For Mark Next Step
   * inbound: next = 'Received'
   * outbound: next = 'Shipped'
   * adjustment: next = 'Completed'
   */
  function getNextStatusForType(transactionType: TransactionType): TransactionStatus | null {
    if (transactionType === 'Inbound') return 'Received';
    if (transactionType === 'Outbound') return 'Shipped';
    if (transactionType === 'Adjustment') return 'Completed';
    return null;
  }

  return {
    transactions,
    loading,
    fetchTransactions,
    createTransaction,
    updateTransactionDetail,
    updateTransactionHeader,
    advanceTransactionToNextStep
  };
}
