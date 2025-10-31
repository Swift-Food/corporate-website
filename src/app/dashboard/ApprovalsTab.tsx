// components/dashboard/ApprovalsTab.tsx

import { CorporateUser } from '@/types/user';
import { useState } from 'react';

interface ApprovalsTabProps {
  pendingApprovals: CorporateUser[];
  isLoading: boolean;
  error: string;
  onRefresh: () => void;
  onApprove: (employeeId: string) => Promise<void>;
  onReject: (employeeId: string) => Promise<void>;
  autoApproveEmployees: boolean;
  onToggleAutoApprove: (enabled: boolean) => Promise<void>;
}

export function ApprovalsTab({ 
  pendingApprovals, 
  isLoading, 
  error, 
  onRefresh,
  onApprove,
  onReject,
  autoApproveEmployees,
  onToggleAutoApprove,
}: ApprovalsTabProps) {
  const [isTogglingAutoApprove, setIsTogglingAutoApprove] = useState(false);

  const handleToggleAutoApprove = async () => {
    setIsTogglingAutoApprove(true);
    try {
      await onToggleAutoApprove(!autoApproveEmployees);
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to update auto-approve setting');
    } finally {
      setIsTogglingAutoApprove(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Auto-Approve Setting */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200">
        <div className="p-6">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <div className="flex items-center space-x-3 mb-2">
                <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
                  <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-slate-900">Auto-Approve Employees</h3>
                  <p className="text-sm text-slate-500 mt-1">
                    Automatically approve new employee registrations from verified domains
                  </p>
                </div>
              </div>
            </div>

            {/* Toggle Switch */}
            <button
              onClick={handleToggleAutoApprove}
              disabled={isTogglingAutoApprove}
              className={`relative inline-flex h-8 w-14 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed ${
                autoApproveEmployees ? 'bg-blue-600' : 'bg-slate-300'
              }`}
            >
              <span className="sr-only">Toggle auto-approve</span>
              <span
                className={`inline-block h-6 w-6 transform rounded-full bg-white transition-transform ${
                  autoApproveEmployees ? 'translate-x-7' : 'translate-x-1'
                }`}
              />
            </button>
          </div>

          {/* Info Box */}
          {autoApproveEmployees ? (
            <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg">
              <div className="flex items-start space-x-3">
                <svg className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <div className="flex-1">
                  <p className="text-sm font-medium text-green-900">Auto-Approve Enabled</p>
                  <p className="text-sm text-green-700 mt-1">
                    New employees from verified email domains will be automatically approved and activated.
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <div className="mt-4 p-4 bg-amber-50 border border-amber-200 rounded-lg">
              <div className="flex items-start space-x-3">
                <svg className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
                <div className="flex-1">
                  <p className="text-sm font-medium text-amber-900">Manual Approval Required</p>
                  <p className="text-sm text-amber-700 mt-1">
                    New employee registrations require manual approval by a manager.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Pending Approvals List */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200">
        <div className="p-6 border-b border-slate-200">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-xl font-semibold text-slate-900">Pending Approvals</h2>
              <p className="text-sm text-slate-500 mt-1">
                {pendingApprovals.length} employee{pendingApprovals.length !== 1 ? 's' : ''} awaiting approval
              </p>
            </div>
            <button 
              onClick={onRefresh}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium text-sm"
            >
              Refresh
            </button>
          </div>
        </div>

        {error && (
          <div className="m-6 p-4 bg-red-50 border border-red-200 text-red-800 rounded-lg flex items-start space-x-3">
            <svg className="w-5 h-5 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
            <span>{error}</span>
          </div>
        )}

        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-16">
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-200 border-t-blue-600"></div>
            <p className="text-slate-500 mt-4">Loading pending approvals...</p>
          </div>
        ) : pendingApprovals.length === 0 ? (
          <div className="text-center py-16">
            <svg className="w-16 h-16 text-slate-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p className="text-slate-600 font-medium">No pending approvals</p>
            <p className="text-slate-500 text-sm mt-1">All employee registrations have been processed</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-200">
            {pendingApprovals.map((employee) => (
              <div key={employee.id} className="p-6 hover:bg-slate-50 transition-colors">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center text-white font-semibold">
                      {employee.firstName?.[0]}{employee.lastName?.[0]}
                    </div>
                    <div>
                      <div className="font-medium text-slate-900">
                        {employee.firstName} {employee.lastName}
                      </div>
                      <div className="text-sm text-slate-500">{employee.email}</div>
                      {employee.department && (
                        <div className="text-xs text-slate-500 mt-1">
                          Department: {employee.department}
                        </div>
                      )}
                      <div className="flex items-center space-x-2 mt-2">
                        <span className="px-2 py-1 bg-amber-100 text-amber-700 rounded text-xs font-medium">
                          Pending Approval
                        </span>
                        {employee.createdAt && (
                          <span className="text-xs text-slate-500">
                            Registered {new Date(employee.createdAt).toLocaleDateString()}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex space-x-3">
                    <button
                      onClick={() => onReject(employee.id)}
                      className="px-4 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors font-medium text-sm"
                    >
                      Reject
                    </button>
                    <button
                      onClick={() => onApprove(employee.id)}
                      className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium text-sm"
                    >
                      Approve
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}