// components/dashboard/EmployeesTab.tsx

import { CorporateUser } from '@/types/user';
import { useState } from 'react';
import { ChangeRoleModal } from '@/modals/changeRoleModal';

interface EmployeesTabProps {
  employees: CorporateUser[];
  employeesByJobTitle: Record<string, CorporateUser[]>;
  jobTitles: any[];
  isLoading: boolean;
  error: string;
  onRefresh: () => void;
  onChangeRole: (employeeId: string, newRole: string) => Promise<void>;
}

export function EmployeesTab({ 
  employees, 
  employeesByJobTitle, 
  jobTitles, 
  isLoading, 
  error, 
  onRefresh,
  onChangeRole 
}: EmployeesTabProps) {
  const [showRoleModal, setShowRoleModal] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState<CorporateUser | null>(null);
  const [isChangingRole, setIsChangingRole] = useState(false);

  const getRoleColor = (role: string) => {
    const colors = {
      ADMIN: 'bg-purple-100 text-purple-700',
      MANAGER: 'bg-blue-100 text-blue-700',
      EMPLOYEE: 'bg-slate-100 text-slate-700',
    };
    return colors[role as keyof typeof colors] || 'bg-slate-100 text-slate-700';
  };

  const getStatusColor = (status: string) => {
    const colors = {
      ACTIVE: 'bg-emerald-100 text-emerald-700',
      PENDING: 'bg-amber-100 text-amber-700',
      SUSPENDED: 'bg-red-100 text-red-700',
      DEACTIVATED: 'bg-gray-100 text-gray-700',
    };
    return colors[status as keyof typeof colors] || 'bg-gray-100 text-gray-700';
  };

  const handleOpenRoleModal = (employee: CorporateUser) => {
    setSelectedEmployee(employee);
    setShowRoleModal(true);
  };

  const handleCloseRoleModal = () => {
    setShowRoleModal(false);
    setSelectedEmployee(null);
  };

  const handleConfirmRoleChange = async (newRole: string) => {
    if (!selectedEmployee) return;

    setIsChangingRole(true);
    try {
      await onChangeRole(selectedEmployee.id, newRole);
      handleCloseRoleModal();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to change role');
    } finally {
      setIsChangingRole(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-xl shadow-sm border border-slate-200">
        <div className="p-6 border-b border-slate-200">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-xl font-semibold text-slate-900">Team Members</h2>
              <p className="text-sm text-slate-500 mt-1">{employees.length} total employees</p>
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
            <p className="text-slate-500 mt-4">Loading employees...</p>
          </div>
        ) : employees.length === 0 ? (
          <div className="text-center py-16">
            <svg className="w-16 h-16 text-slate-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
            <p className="text-slate-600 font-medium">No employees found</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-200">
            {Object.entries(employeesByJobTitle).map(([titleId, emps]) => {
              const jobTitle = titleId === 'unassigned' 
                ? null 
                : jobTitles.find(t => t.id === titleId);
              
              return (
                <div key={titleId} className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                        titleId === 'unassigned' ? 'bg-slate-100' : 'bg-blue-100'
                      }`}>
                        <svg className={`w-5 h-5 ${
                          titleId === 'unassigned' ? 'text-slate-600' : 'text-blue-600'
                        }`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                        </svg>
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-slate-900">
                          {titleId === 'unassigned' ? 'Unassigned' : titleId || 'Unknown Title'}
                        </h3>
                        <p className="text-sm text-slate-500">
                          {emps.length} {emps.length === 1 ? 'employee' : 'employees'}
                        </p>
                      </div>
                    </div>
                    
                    {jobTitle && (
                      <div className="flex flex-wrap gap-2 text-xs">
                        {jobTitle.dailyBudgetLimit && (
                          <span className="px-2 py-1 bg-blue-50 text-blue-700 rounded">
                            Daily: £{jobTitle.dailyBudgetLimit}
                          </span>
                        )}
                        {jobTitle.monthlyBudgetLimit && (
                          <span className="px-2 py-1 bg-green-50 text-green-700 rounded">
                            Monthly: £{jobTitle.monthlyBudgetLimit}
                          </span>
                        )}
                      </div>
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {emps.map((emp) => (
                      <div key={emp.id} className="border border-slate-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                        <div className="flex items-start space-x-3">
                          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white font-semibold flex-shrink-0">
                            {emp.firstName?.[0]}{emp.lastName?.[0]}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="font-medium text-slate-900 truncate">
                              {emp.firstName} {emp.lastName}
                            </div>
                            <div className="text-xs text-slate-500 truncate">{emp.email}</div>
                            {emp.department && (
                              <div className="text-xs text-slate-500 mt-1">{emp.department}</div>
                            )}
                            <div className="flex items-center space-x-2 mt-2">
                              <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${getRoleColor(emp.corporateRole)}`}>
                                {emp.corporateRole}
                              </span>
                              <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${getStatusColor(emp.status)}`}>
                                {emp.status}
                              </span>
                            </div>
                            <div className="mt-2 pt-2 border-t border-slate-100 text-xs space-y-1">
                              <div className="flex justify-between">
                                <span className="text-slate-500">Daily:</span>
                                <span className="font-medium text-slate-900">£{emp.dailyBudgetRemaining?.toFixed(2) || '0.00'}</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-slate-500">Monthly:</span>
                                <span className="font-medium text-slate-900">£{emp.monthlyBudgetRemaining?.toFixed(2) || '0.00'}</span>
                              </div>
                            </div>
                            
                            {/* Change Role Button */}
                            <button
                              onClick={() => handleOpenRoleModal(emp)}
                              className="mt-3 w-full px-3 py-1.5 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors text-xs font-medium flex items-center justify-center space-x-1"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                              </svg>
                              <span>Change Role</span>
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Role Change Modal */}
      <ChangeRoleModal
        isOpen={showRoleModal}
        onClose={handleCloseRoleModal}
        onConfirm={handleConfirmRoleChange}
        employee={selectedEmployee}
        isLoading={isChangingRole}
      />
    </div>
  );
}