import { useState, useEffect } from 'react';
import { supabase } from '../../../lib/supabase';
import { Record, ForeignKeyData } from '../types';
import { tableStructure, primaryKeys } from '../config/tableConfig';
import toast from 'react-hot-toast';

export function useMasterData(activeTable: string) {
  const [data, setData] = useState<Record[]>([]);
  const [loading, setLoading] = useState(true);
  const [foreignKeyData, setForeignKeyData] = useState<ForeignKeyData>({});

  useEffect(() => {
    fetchData();
    fetchForeignKeyData();
  }, [activeTable]);

  async function fetchData() {
    try {
      setLoading(true);
      let query;

      // Special handling for tables with foreign key relationships
      switch (activeTable) {
        case 'item':
          query = supabase.from(activeTable).select(`
            *,
            product:product_name (
              product_name,
              registrant (registrant),
              product_type (product_type)
            ),
            pack_size (
              pack_size,
              id,
              units_per_each,
              volume_per_unit,
              units_of_units (units_of_units),
              package_type (package_type)
            )
          `);
          break;
        case 'product':
          query = supabase.from(activeTable).select(`
            *,
            registrant (registrant),
            product_type (product_type)
          `);
          break;
        case 'pack_size':
          query = supabase.from(activeTable).select(`
            *,
            units_of_units (units_of_units),
            case_type:package_type (package_type)
          `);
          break;
        default:
          query = supabase.from(activeTable).select('*');
      }

      const { data: result, error } = await query;
      
      if (error) throw error;

      // Transform data to flatten nested objects and preserve relationships
      const transformedData = result?.map(record => {
        const transformed = { ...record };
        
        Object.entries(transformed).forEach(([key, value]) => {
          if (value && typeof value === 'object') {
            // Handle nested objects from relationships
            if (Array.isArray(value)) {
              // Handle array relationships
              transformed[key] = value[0] || null;
            } else {
              // Handle single object relationships
              Object.entries(value).forEach(([nestedKey, nestedValue]) => {
                if (nestedValue && typeof nestedValue === 'object') {
                  // Handle deeply nested relationships
                  transformed[`${key}_${nestedKey}`] = nestedValue[nestedKey] || null;
                } else {
                  transformed[`${key}_${nestedKey}`] = nestedValue;
                }
              });
            }
          }
        });

        return transformed;
      });

      setData(transformedData || []);
    } catch (error) {
      console.error('Error fetching data:', error);
      toast.error('Failed to fetch data');
    } finally {
      setLoading(false);
    }
  }

  async function fetchForeignKeyData() {
    const structure = tableStructure[activeTable];
    if (!structure) return;

    const foreignKeys = structure.foreignKeys;
    const newForeignKeyData: ForeignKeyData = {};

    for (const [key, value] of Object.entries(foreignKeys)) {
      try {
        let query = supabase.from(value.table).select('*');
        
        // Special handling for pack_size to include id for sorting
        if (value.table === 'pack_size') {
          query = supabase.from(value.table).select('pack_size, id').order('id', { ascending: true });
        }
        
        const { data, error } = await query;
        
        if (error) throw error;
        newForeignKeyData[key] = data || [];
      } catch (error) {
        console.error(`Error fetching foreign key data for ${key}:`, error);
        toast.error(`Failed to fetch ${key} data`);
      }
    }

    setForeignKeyData(newForeignKeyData);
  }

  async function addRecord(record: Record) {
    try {
      // Remove any transformed/flattened fields
      const cleanRecord = { ...record };
      Object.keys(cleanRecord).forEach(key => {
        if (key.includes('_') && !tableStructure[activeTable].columns.includes(key)) {
          delete cleanRecord[key];
        }
      });

      const { error } = await supabase
        .from(activeTable)
        .insert([cleanRecord]);

      if (error) throw error;
      
      toast.success('Record added successfully');
      await fetchData();
      return true;
    } catch (error) {
      console.error('Error adding record:', error);
      toast.error('Failed to add record');
      return false;
    }
  }

  async function updateRecord(record: Record) {
    try {
      const primaryKey = primaryKeys[activeTable];
      
      // Remove any transformed/flattened fields
      const cleanRecord = { ...record };
      Object.keys(cleanRecord).forEach(key => {
        if (key.includes('_') && !tableStructure[activeTable].columns.includes(key)) {
          delete cleanRecord[key];
        }
      });

      const { error } = await supabase
        .from(activeTable)
        .update(cleanRecord)
        .eq(primaryKey, record[primaryKey]);

      if (error) throw error;
      
      toast.success('Record updated successfully');
      await fetchData();
      return true;
    } catch (error) {
      console.error('Error updating record:', error);
      toast.error('Failed to update record');
      return false;
    }
  }

  async function deleteRecord(record: Record) {
    try {
      const primaryKey = primaryKeys[activeTable];
      const { error } = await supabase
        .from(activeTable)
        .delete()
        .eq(primaryKey, record[primaryKey]);

      if (error) throw error;
      
      toast.success('Record deleted successfully');
      await fetchData();
      return true;
    } catch (error) {
      console.error('Error deleting record:', error);
      toast.error('Failed to delete record');
      return false;
    }
  }

  return {
    data,
    loading,
    foreignKeyData,
    addRecord,
    updateRecord,
    deleteRecord
  };
}