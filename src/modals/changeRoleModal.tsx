// modals/changeRoleModal.tsx

'use client';

import { useState, useEffect } from 'react';
import { CorporateUser, CorporateUserRole } from '@/types/user';

interface ChangeRoleModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (newRole: CorporateUserRole) => void;
  employee: CorporateUser | null; // ✅ Accept CorporateUser directly
  isLoading: boolean;
}

export function ChangeRoleModal({
  isOpen,
  onClose,
  onConfirm,
  employee,
  isLoading,
}: ChangeRoleModalProps) {
  const [selectedRole, setSelectedRole] = useState<CorporateUserRole>(
    employee?.corporateRole || CorporateUserRole.EMPLOYEE
  );

  // Update selected role when employee changes
  useEffect(() => {
    if (employee?.corporateRole) {
      setSelectedRole(employee.corporateRole);
    }
  }, [employee]);

  if (!isOpen || !employee) return null;

  const roles = [
    {
      value: CorporateUserRole.EMPLOYEE,
      label: 'Employee',
      description: 'Can place orders within their budget limits',
      color: 'bg-slate-100 text-slate-700',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
        </svg>
      ),
    },
    {
      value: CorporateUserRole.MANAGER,
      label: 'Manager',
      description: 'Can approve orders, manage employees, and view reports',
      color: 'bg-blue-100 text-blue-700',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
        </svg>
      ),
    },
    {
      value: CorporateUserRole.ADMIN,
      label: 'Admin',
      description: 'Full access to organization settings and all features',
      color: 'bg-purple-100 text-purple-700',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
        </svg>
      ),
    },
  ];

  const getRoleBadge = (role: CorporateUserRole) => {
    const roleInfo = roles.find((r) => r.value === role);
    return roleInfo?.color || 'bg-slate-100 text-slate-700';
  };

  const isRoleChange = selectedRole !== employee.corporateRole;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full">
        <div className="p-6 border-b border-slate-200">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-xl font-semibold text-slate-900">Change Employee Role</h3>
            <button
              onClick={onClose}
              className="text-slate-400 hover:text-slate-600"
              disabled={isLoading}
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          
          <div className="bg-slate-50 rounded-lg p-3 flex items-center space-x-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white font-semibold">
              {employee.firstName?.[0] || 'U'}{employee.lastName?.[0] || 'U'}
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-medium text-slate-900 truncate">
                {employee.firstName || ''} {employee.lastName || ''}
              </p>
              <p className="text-sm text-slate-500 truncate">{employee.email || ''}</p>
            </div>
            <div className="flex-shrink-0">
              <span className={`px-3 py-1 rounded-full text-xs font-medium ${getRoleBadge(employee.corporateRole)}`}>
                Current: {employee.corporateRole}
              </span>
            </div>
          </div>
        </div>

        <div className="p-6 space-y-3">
          <p className="text-sm text-slate-600 mb-4">
            Select the new role for this employee:
          </p>

          {roles.map((role) => (
            <label
              key={role.value}
              className={`flex items-start space-x-4 p-4 border-2 rounded-lg cursor-pointer transition-all ${
                selectedRole === role.value
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50'
              } ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              <input
                type="radio"
                name="role"
                value={role.value}
                checked={selectedRole === role.value}
                onChange={(e) => setSelectedRole(e.target.value as CorporateUserRole)}
                disabled={isLoading}
                className="mt-1 w-5 h-5 text-blue-600"
              />
              <div className="flex-1">
                <div className="flex items-center space-x-3 mb-1">
                  <div className={`w-8 h-8 rounded-lg ${role.color} flex items-center justify-center`}>
                    {role.icon}
                  </div>
                  <div>
                    <p className="font-semibold text-slate-900">{role.label}</p>
                  </div>
                  {employee.corporateRole === role.value && (
                    <span className="text-xs bg-slate-200 text-slate-600 px-2 py-1 rounded">
                      Current
                    </span>
                  )}
                </div>
                <p className="text-sm text-slate-600 ml-11">{role.description}</p>
              </div>
            </label>
          ))}
        </div>

        {/* Warning for Admin Role */}
        {selectedRole === CorporateUserRole.ADMIN && employee.corporateRole !== CorporateUserRole.ADMIN && (
          <div className="mx-6 mb-6 p-4 bg-amber-50 border border-amber-200 rounded-lg">
            <div className="flex items-start space-x-3">
              <svg className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              <div className="flex-1">
                <p className="text-sm font-medium text-amber-900">Warning: Admin Access</p>
                <p className="text-sm text-amber-700 mt-1">
                  Admins have full access to all organization settings and can modify other users' permissions.
                </p>
              </div>
            </div>
          </div>
        )}

        <div className="p-6 border-t border-slate-200 flex justify-between items-center">
          {isRoleChange && (
            <div className="flex items-center space-x-2 text-sm">
              <span className="text-slate-600">Change:</span>
              <span className={`px-2 py-1 rounded text-xs font-medium ${getRoleBadge(employee.corporateRole)}`}>
                {employee.corporateRole}
              </span>
              <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
              <span className={`px-2 py-1 rounded text-xs font-medium ${getRoleBadge(selectedRole)}`}>
                {selectedRole}
              </span>
            </div>
          )}
          
          <div className="flex space-x-3 ml-auto">
            <button
              onClick={onClose}
              disabled={isLoading}
              className="px-4 py-2 bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Cancel
            </button>
            <button
              onClick={() => onConfirm(selectedRole)}
              disabled={!isRoleChange || isLoading}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <div className="flex items-center space-x-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                  <span>Updating...</span>
                </div>
              ) : (
                'Confirm Change'
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}