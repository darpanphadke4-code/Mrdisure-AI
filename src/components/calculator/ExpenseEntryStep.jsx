// src/components/calculator/ExpenseEntryStep.jsx
import React, { useState } from 'react';
import { Button } from '../common/Button';
import { EXPENSE_CATEGORIES } from '../../utils/calculationEngine';
import { presetScenarios } from '../../data/mockExpenses';
import { formatCurrency } from '../../utils/formatters';
import {
  Plus,
  Trash2,
  Edit2,
  Sparkles,
  Layers,
  Check,
  AlertCircle,
} from 'lucide-react';
import toast from 'react-hot-toast';

export const ExpenseEntryStep = ({
  expenses,
  setExpenses,
  onLoadScenario,
}) => {
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState(null);

  // New item form state
  const [newItem, setNewItem] = useState({
    category: 'room',
    description: '',
    amount: '',
    quantity: 1,
    notes: '',
  });

  const totalCalculated = expenses.reduce(
    (sum, item) => sum + (Number(item.amount) || 0) * (Number(item.quantity) || 1),
    0
  );

  const handleSaveItem = () => {
    if (!newItem.description.trim()) {
      toast.error('Please enter an expense description');
      return;
    }
    if (!newItem.amount || Number(newItem.amount) <= 0) {
      toast.error('Please enter a valid amount');
      return;
    }

    if (editingId) {
      setExpenses(
        expenses.map((item) =>
          item.id === editingId
            ? {
                ...item,
                category: newItem.category,
                description: newItem.description,
                amount: Number(newItem.amount),
                quantity: Number(newItem.quantity) || 1,
                notes: newItem.notes,
              }
            : item
        )
      );
      setEditingId(null);
      toast.success('Expense item updated');
    } else {
      const itemToAdd = {
        id: `exp-${Date.now()}`,
        category: newItem.category,
        description: newItem.description,
        amount: Number(newItem.amount),
        quantity: Number(newItem.quantity) || 1,
        notes: newItem.notes,
      };
      setExpenses([...expenses, itemToAdd]);
      toast.success('Expense item added');
    }

    // Reset form
    setNewItem({
      category: 'room',
      description: '',
      amount: '',
      quantity: 1,
      notes: '',
    });
    setIsAdding(false);
  };

  const handleStartEdit = (item) => {
    setEditingId(item.id);
    setNewItem({
      category: item.category,
      description: item.description,
      amount: item.amount,
      quantity: item.quantity || 1,
      notes: item.notes || '',
    });
    setIsAdding(true);
  };

  const handleRemoveItem = (id) => {
    setExpenses(expenses.filter((i) => i.id !== id));
    toast.success('Item removed');
  };

  return (
    <div className="space-y-6">
      {/* Quick Scenario Templates */}
      <div className="bg-forest-50/70 p-4 rounded-2xl border border-forest-100">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-forest-700" />
            <h5 className="text-xs font-bold uppercase tracking-wider text-forest-900 font-heading">
              Quick Load Hospital Bill Scenario (Demo Templates)
            </h5>
          </div>
          <span className="text-[11px] text-charcoal-400">One-click auto-fill</span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
          {presetScenarios.map((scen) => (
            <button
              key={scen.id}
              type="button"
              onClick={() => onLoadScenario(scen)}
              className="p-3 bg-white rounded-xl border border-borderGray hover:border-forest-400 hover:bg-forest-50/40 text-left transition-all text-xs group shadow-subtle"
            >
              <span className="font-bold text-forest-900 block font-heading group-hover:text-forest-700">
                {scen.name}
              </span>
              <span className="text-[11px] text-charcoal-500 mt-1 block">
                {scen.hospitalName} · {scen.items.length} items
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Bill Items List Table */}
      <div className="bg-white rounded-2xl border border-borderGray overflow-hidden shadow-subtle">
        <div className="p-4 border-b border-borderGray flex items-center justify-between">
          <div>
            <h4 className="text-sm font-bold text-forest-900 font-heading">
              Itemized Hospital Expenses
            </h4>
            <p className="text-xs text-charcoal-400">
              {expenses.length} billing line items added
            </p>
          </div>
          <div className="text-right">
            <span className="text-[10px] text-charcoal-400 uppercase tracking-wider block">
              Gross Bill Total
            </span>
            <span className="text-lg font-bold text-forest-900 font-mono">
              {formatCurrency(totalCalculated)}
            </span>
          </div>
        </div>

        {/* Table or Empty */}
        {expenses.length === 0 ? (
          <div className="p-8 text-center text-xs text-charcoal-400">
            No expenses added yet. Click &ldquo;Add Custom Expense&rdquo; or select a template above.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="bg-warmWhite/80 text-charcoal-500 uppercase text-[10px] border-b border-borderGray">
                <tr>
                  <th className="px-4 py-3">Category</th>
                  <th className="px-4 py-3">Description & Notes</th>
                  <th className="px-4 py-3 text-right">Unit Rate</th>
                  <th className="px-4 py-3 text-center">Qty / Days</th>
                  <th className="px-4 py-3 text-right">Total</th>
                  <th className="px-4 py-3 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-borderGray/60">
                {expenses.map((item) => {
                  const itemTotal = (Number(item.amount) || 0) * (Number(item.quantity) || 1);
                  const catObj = EXPENSE_CATEGORIES.find((c) => c.id === item.category);

                  return (
                    <tr key={item.id} className="hover:bg-warmWhite/50 transition-colors">
                      <td className="px-4 py-3 font-semibold text-forest-900 whitespace-nowrap">
                        <span className="px-2 py-0.5 rounded bg-forest-50 text-forest-800 border border-forest-100 text-[11px]">
                          {catObj?.name || item.category}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span className="font-bold text-charcoal-800 block">{item.description}</span>
                        {item.notes && <span className="text-[11px] text-charcoal-400">{item.notes}</span>}
                      </td>
                      <td className="px-4 py-3 text-right font-mono font-medium text-charcoal-700">
                        {formatCurrency(item.amount)}
                      </td>
                      <td className="px-4 py-3 text-center font-mono">
                        {item.quantity || 1}
                      </td>
                      <td className="px-4 py-3 text-right font-mono font-bold text-forest-900">
                        {formatCurrency(itemTotal)}
                      </td>
                      <td className="px-4 py-3 text-center whitespace-nowrap">
                        <div className="flex items-center justify-center gap-1">
                          <button
                            type="button"
                            onClick={() => handleStartEdit(item)}
                            className="p-1.5 text-charcoal-400 hover:text-forest-700 hover:bg-forest-50 rounded"
                            title="Edit item"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleRemoveItem(item.id)}
                            className="p-1.5 text-charcoal-400 hover:text-rose-600 hover:bg-rose-50 rounded"
                            title="Remove item"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add / Edit Form Modal or Inline */}
      {isAdding ? (
        <div className="bg-white p-5 rounded-2xl border-2 border-forest-500/40 shadow-card space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-borderGray">
            <h5 className="text-xs font-bold uppercase tracking-wider text-forest-900 font-heading">
              {editingId ? 'Edit Medical Expense Item' : 'Add New Hospital Bill Item'}
            </h5>
            <button
              onClick={() => {
                setIsAdding(false);
                setEditingId(null);
              }}
              className="text-xs text-charcoal-400 hover:text-charcoal-700"
            >
              Cancel
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
            <div>
              <label className="block text-charcoal-500 text-[11px] mb-1 font-medium">Category</label>
              <select
                value={newItem.category}
                onChange={(e) => setNewItem({ ...newItem, category: e.target.value })}
                className="w-full px-3 py-2 bg-warmWhite border border-borderGray rounded-xl text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-forest-500"
              >
                {EXPENSE_CATEGORIES.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="sm:col-span-2">
              <label className="block text-charcoal-500 text-[11px] mb-1 font-medium">Description</label>
              <input
                type="text"
                placeholder="e.g. Laparoscopic Trocar & OT Fee"
                value={newItem.description}
                onChange={(e) => setNewItem({ ...newItem, description: e.target.value })}
                className="w-full px-3 py-2 bg-warmWhite border border-borderGray rounded-xl text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-forest-500"
              />
            </div>

            <div>
              <label className="block text-charcoal-500 text-[11px] mb-1 font-medium">Amount / Unit Rate (₹)</label>
              <input
                type="number"
                placeholder="25000"
                value={newItem.amount}
                onChange={(e) => setNewItem({ ...newItem, amount: e.target.value })}
                className="w-full px-3 py-2 bg-warmWhite border border-borderGray rounded-xl text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-forest-500"
              />
            </div>

            <div>
              <label className="block text-charcoal-500 text-[11px] mb-1 font-medium">Quantity / Days</label>
              <input
                type="number"
                min="1"
                value={newItem.quantity}
                onChange={(e) => setNewItem({ ...newItem, quantity: e.target.value })}
                className="w-full px-3 py-2 bg-warmWhite border border-borderGray rounded-xl text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-forest-500"
              />
            </div>

            <div>
              <label className="block text-charcoal-500 text-[11px] mb-1 font-medium">Notes / Tier details</label>
              <input
                type="text"
                placeholder="e.g. Single Deluxe A/C"
                value={newItem.notes}
                onChange={(e) => setNewItem({ ...newItem, notes: e.target.value })}
                className="w-full px-3 py-2 bg-warmWhite border border-borderGray rounded-xl text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-forest-500"
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setIsAdding(false);
                setEditingId(null);
              }}
            >
              Cancel
            </Button>
            <Button variant="primary" size="sm" onClick={handleSaveItem}>
              {editingId ? 'Update Item' : 'Add Item'}
            </Button>
          </div>
        </div>
      ) : (
        <div className="flex justify-start">
          <Button
            variant="outline"
            size="sm"
            leftIcon={Plus}
            onClick={() => setIsAdding(true)}
          >
            Add Custom Expense Item
          </Button>
        </div>
      )}
    </div>
  );
};
