import React from 'react';
import { Edit2, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';

type TableActionsProps = {
  onEdit: () => void;
  onDelete: () => void;
};

export function TableActions({ onEdit, onDelete }: TableActionsProps) {
  const handleDelete = () => {
    if (confirm('Are you sure you want to delete this record? This action cannot be undone.')) {
      onDelete();
    }
  };

  return (
    <div className="flex space-x-2">
      <button
        onClick={onEdit}
        className="text-blue-600 hover:text-blue-800 p-1"
        title="Edit"
      >
        <Edit2 className="w-4 h-4" />
      </button>
      <button
        onClick={handleDelete}
        className="text-red-600 hover:text-red-800 p-1"
        title="Delete"
      >
        <Trash2 className="w-4 h-4" />
      </button>
    </div>
  );
}