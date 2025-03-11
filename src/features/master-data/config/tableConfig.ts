import { TableStructure } from '../types';

export const tables = [
  'product',
  'item',
  'pack_size',
  'case_type',
  'product_type',
  'registrant',
  'units_of_units',
  'warehouse'
] as const;

export const tableStructure: TableStructure = {
  product: {
    columns: ['product_name', 'registrant', 'product_type'],
    foreignKeys: {
      registrant: { table: 'registrant', column: 'registrant' },
      product_type: { table: 'product_type', column: 'product_type' }
    }
  },
  item: {
    columns: ['item_name', 'product_name', 'pack_size'],
    foreignKeys: {
      product_name: { table: 'product', column: 'product_name' },
      pack_size: { table: 'pack_size', column: 'pack_size' }
    }
  },
  pack_size: {
    columns: [
      'pack_size', 'id', 'units_per_each', 'volume_per_unit',
      'units_of_units', 'package_type', 'uom_per_each',
      'eaches_per_pallet', 'pallets_per_tl', 'eaches_per_tl'
    ],
    foreignKeys: {
      units_of_units: { table: 'units_of_units', column: 'units_of_units' },
      package_type: { table: 'case_type', column: 'package_type' }
    }
  },
  warehouse: {
    columns: [
      'Location ID', 'Establishment Name', 'Common Name', 'EPA',
      'Abbreviation', 'Street', 'City', 'State', 'Zip',
      'Address', 'Phone', 'Contact Name', 'Location Hours'
    ],
    foreignKeys: {}
  },
  case_type: {
    columns: ['package_type'],
    foreignKeys: {}
  },
  product_type: {
    columns: ['product_type'],
    foreignKeys: {}
  },
  registrant: {
    columns: ['registrant'],
    foreignKeys: {}
  },
  units_of_units: {
    columns: ['units_of_units'],
    foreignKeys: {}
  }
};

export const primaryKeys: Record<string, string> = {
  product: 'product_name',
  item: 'item_name',
  pack_size: 'pack_size',
  warehouse: 'Common Name',
  case_type: 'package_type',
  product_type: 'product_type',
  registrant: 'registrant',
  units_of_units: 'units_of_units'
};