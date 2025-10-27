'use client';

import { useState, useEffect } from 'react';
import { CreateJobTitleDto, jobTitlesApi } from '@/api/jobTitle';

interface JobTitleModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  organizationId: string;
  jobTitle?: any;
}

export function JobTitleModal({ isOpen, onClose, onSuccess, organizationId, jobTitle }: JobTitleModalProps) {
  const [formData, setFormData] = useState<CreateJobTitleDto>({
    name: '',
    description: '',
    maxOrderValue: undefined,
    dailyBudgetLimit: undefined,
    monthlyBudgetLimit: undefined,
    canOrder: true,
    requiresApproval: false,
    approvalThreshold: undefined,
  });
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (jobTitle) {
      setFormData({
        name: jobTitle.name,
        description: jobTitle.description || '',
        maxOrderValue: jobTitle.maxOrderValue,
        dailyBudgetLimit: jobTitle.dailyBudgetLimit,
        monthlyBudgetLimit: jobTitle.monthlyBudgetLimit,
        canOrder: jobTitle.canOrder,
        requiresApproval: jobTitle.requiresApproval,
        approvalThreshold: jobTitle.approvalThreshold,
      });
    }
  }, [jobTitle]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      if (jobTitle) {
        await jobTitlesApi.update(organizationId, jobTitle.id, formData);
      } else {
        await jobTitlesApi.create(organizationId, formData);
      }
      onSuccess();
      onClose();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to save job title');
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-slate-200">
          <h2 className="text-xl font-semibold text-slate-900">
            {jobTitle ? 'Edit Job Title' : 'Create Job Title'}
          </h2>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Title Name *</label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              placeholder="e.g. Senior Developer"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Description</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              rows={3}
              placeholder="Job title description..."
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Max Order Value ($)</label>
              <input
                type="number"
                min="0"
                step="0.01"
                value={formData.maxOrderValue || ''}
                onChange={(e) => setFormData({ ...formData, maxOrderValue: e.target.value ? Number(e.target.value) : undefined })}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Daily Budget Limit ($)</label>
              <input
                type="number"
                min="0"
                step="0.01"
                value={formData.dailyBudgetLimit || ''}
                onChange={(e) => setFormData({ ...formData, dailyBudgetLimit: e.target.value ? Number(e.target.value) : undefined })}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Monthly Budget Limit ($)</label>
              <input
                type="number"
                min="0"
                step="0.01"
                value={formData.monthlyBudgetLimit || ''}
                onChange={(e) => setFormData({ ...formData, monthlyBudgetLimit: e.target.value ? Number(e.target.value) : undefined })}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Approval Threshold ($)</label>
              <input
                type="number"
                min="0"
                step="0.01"
                value={formData.approvalThreshold || ''}
                onChange={(e) => setFormData({ ...formData, approvalThreshold: e.target.value ? Number(e.target.value) : undefined })}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={formData.canOrder}
                onChange={(e) => setFormData({ ...formData, canOrder: e.target.checked })}
                className="w-4 h-4 text-blue-600 rounded"
              />
              <span className="text-sm text-slate-700">Can place orders</span>
            </label>

            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={formData.requiresApproval}
                onChange={(e) => setFormData({ ...formData, requiresApproval: e.target.checked })}
                className="w-4 h-4 text-blue-600 rounded"
              />
              <span className="text-sm text-slate-700">Requires approval for orders</span>
            </label>
          </div>

          <div className="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-slate-700 bg-slate-100 rounded-lg hover:bg-slate-200"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
            >
              {isLoading ? 'Saving...' : jobTitle ? 'Update' : 'Create'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}