// components/dashboard/EmployeesTab.tsx

import { CorporateUser, CorporateUserStatus } from '@/types/user';
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
  onDeactivate: (employeeId: string) => Promise<void>;
  onReactivate: (employeeId: string) => Promise<void>;
  pendingApprovals: CorporateUser[];
  onApprove: (employeeId: string) => Promise<void>;
  onReject: (employeeId: string) => Promise<void>;
  autoApproveEmployees: boolean;
  onToggleAutoApprove: (enabled: boolean) => Promise<void>;
  onRefreshApprovals: () => void;
  onCreateJobTitle: () => void;
  onEditJobTitle: (jobTitle: any) => void;
  onAssignJobTitle: (jobTitle: any) => void;
}

export function EmployeesTab({ 
  employees, 
  employeesByJobTitle, 
  jobTitles, 
  isLoading, 
  error, 
  onRefresh,
  onChangeRole,
  onDeactivate,
  onReactivate,
  pendingApprovals,
  onApprove,
  onReject,
  autoApproveEmployees,
  onToggleAutoApprove,
  onRefreshApprovals,
  onCreateJobTitle,
  onEditJobTitle,
  onAssignJobTitle,
}: EmployeesTabProps) {
  const [showRoleModal, setShowRoleModal] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState<CorporateUser | null>(null);
  const [isChangingRole, setIsChangingRole] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isDeactivating, setIsDeactivating] = useState<string | null>(null);
  const [isApprovalsExpanded, setIsApprovalsExpanded] = useState(false);
  const [isTogglingAutoApprove, setIsTogglingAutoApprove] = useState(false);
  const [expandedJobTitles, setExpandedJobTitles] = useState<Record<string, boolean>>({});

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
      INACTIVE: 'bg-gray-100 text-gray-700',
    };
    return colors[status as keyof typeof colors] || 'bg-gray-100 text-gray-700';
  };

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

  const filteredEmployees = employees.filter(emp => 
    emp.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
    `${emp.firstName} ${emp.lastName}`.toLowerCase().includes(searchQuery.toLowerCase())
  );
  
  const filteredEmployeesByJobTitle = filteredEmployees.reduce((acc, emp) => {
    const key = emp.jobTitleName || 'unassigned';
    if (!acc[key]) acc[key] = [];
    acc[key].push(emp);
    return acc;
  }, {} as Record<string, CorporateUser[]>);

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

  const handleDeactivate = async (employeeId: string) => {
    if (!confirm('Are you sure you want to deactivate this employee?')) return;
    
    setIsDeactivating(employeeId);
    try {
      await onDeactivate(employeeId);
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to deactivate employee');
    } finally {
      setIsDeactivating(null);
    }
  };
  
  const handleReactivate = async (employeeId: string) => {
    setIsDeactivating(employeeId);
    try {
      await onReactivate(employeeId);
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to reactivate employee');
    } finally {
      setIsDeactivating(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Pending Approvals Section - Always Visible */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200">
        <div className="p-6 border-b border-slate-200">
          <div className="flex items-center justify-between">
            <button
              onClick={() => setIsApprovalsExpanded(!isApprovalsExpanded)}
              className="flex items-center space-x-3 hover:opacity-80 transition-opacity"
            >
              <div className="w-10 h-10 rounded-lg bg-amber-100 flex items-center justify-center">
                <svg className="w-5 h-5 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <div className="text-left">
                <h2 className="text-xl font-semibold text-slate-900">Pending Approvals</h2>
                <p className="text-sm text-slate-500">
                  {pendingApprovals.length} employee{pendingApprovals.length !== 1 ? 's' : ''} awaiting approval
                </p>
              </div>
              <svg 
                className={`w-5 h-5 text-slate-400 transition-transform ${isApprovalsExpanded ? 'rotate-180' : ''}`}
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
  
            {/* Auto-Approve Toggle - Always Visible */}
            <div className="flex items-center space-x-3">
              <div className="text-right">
                <p className="text-sm font-medium text-slate-900">Auto-Approve</p>
                <p className="text-xs text-slate-500">New employees</p>
              </div>
              <button
                onClick={handleToggleAutoApprove}
                disabled={isTogglingAutoApprove}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed ${
                  autoApproveEmployees ? 'bg-blue-600' : 'bg-slate-300'
                }`}
              >
                <span className="sr-only">Toggle auto-approve</span>
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    autoApproveEmployees ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>
          </div>
        </div>
  
        {isApprovalsExpanded && (
          <div className="border-t border-slate-200">
            {pendingApprovals.length === 0 ? (
              <div className="text-center py-12">
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
        )}
      </div>
  
      {/* Team Members Section */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200">
        <div className="p-6 border-b border-slate-200">
          <div className="flex flex-col space-y-4">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-xl font-semibold text-slate-900">Team Members</h2>
                <p className="text-sm text-slate-500 mt-1">
                  {filteredEmployees.length} of {employees.length} employees
                </p>
              </div>
              <div className="flex space-x-3">
                <button 
                  onClick={onCreateJobTitle}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium text-sm flex items-center space-x-2"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  <span>New Job Title</span>
                </button>
                <button 
                  onClick={onRefresh}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium text-sm"
                >
                  Refresh
                </button>
              </div>
            </div>
            
            {/* Search Bar */}
            <div className="relative">
              <input
                type="text"
                placeholder="Search by name or email..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full px-4 py-2 pl-10 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <svg 
                className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400"
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              )}
            </div>
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
        ) : filteredEmployees.length === 0 ? (
          <div className="text-center py-16">
            <svg className="w-16 h-16 text-slate-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <p className="text-slate-600 font-medium">No employees match your search</p>
            <button 
              onClick={() => setSearchQuery('')}
              className="mt-4 text-blue-600 hover:text-blue-700 text-sm font-medium"
            >
              Clear search
            </button>
          </div>
        ) : (
          <div className="divide-y divide-slate-200">
            {Object.entries(filteredEmployeesByJobTitle).map(([titleId, emps]) => {
              const jobTitle = titleId === 'unassigned' 
                ? null 
                : jobTitles.find(t => t.name === titleId);
  
              return (
                <div key={titleId} className="border-b border-slate-200 last:border-b-0">
                  <button
                    onClick={() => {
                      setExpandedJobTitles(prev => ({
                        ...prev,
                        [titleId]: !prev[titleId]
                      }));
                    }}
                    className="w-full p-4 sm:p-6 flex items-center justify-between hover:bg-slate-50 transition-all duration-200 group"
                  >
                    <div className="flex items-center space-x-3 sm:space-x-4 flex-1 min-w-0">
                      {/* Icon with animation */}
                      <div className={`w-12 h-12 sm:w-14 sm:h-14 rounded-xl flex items-center justify-center transition-all group-hover:scale-105 ${
                        titleId === 'unassigned' ? 'bg-slate-100 group-hover:bg-slate-200' : 'bg-gradient-to-br from-blue-100 to-blue-50 group-hover:from-blue-200 group-hover:to-blue-100'
                      }`}>
                        <svg className={`w-6 h-6 sm:w-7 sm:h-7 ${
                          titleId === 'unassigned' ? 'text-slate-600' : 'text-blue-600'
                        }`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                        </svg>
                      </div>
                      
                      <div className="text-left flex-1 min-w-0">
                        <h3 className="text-base sm:text-lg font-semibold text-slate-900 truncate">
                          {titleId === 'unassigned' ? 'Unassigned Employees' : jobTitle?.name || titleId}
                        </h3>
                        <div className="flex items-center space-x-2 mt-0.5">
                          <p className="text-xs sm:text-sm text-slate-500">
                            {emps.length} {emps.length === 1 ? 'employee' : 'employees'}
                          </p>
                          {/* Quick stats badge */}
                          {jobTitle && (
                            <span className="hidden sm:inline-flex items-center px-2 py-0.5 bg-slate-100 text-slate-600 rounded text-xs">
                              <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                                <path d="M8.433 7.418c.155-.103.346-.196.567-.267v1.698a2.305 2.305 0 01-.567-.267C8.07 8.34 8 8.114 8 8c0-.114.07-.34.433-.582zM11 12.849v-1.698c.22.071.412.164.567.267.364.243.433.468.433.582 0 .114-.07.34-.433.582a2.305 2.305 0 01-.567.267z" />
                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-13a1 1 0 10-2 0v.092a4.535 4.535 0 00-1.676.662C6.602 6.234 6 7.009 6 8c0 .99.602 1.765 1.324 2.246.48.32 1.054.545 1.676.662v1.941c-.391-.127-.68-.317-.843-.504a1 1 0 10-1.51 1.31c.562.649 1.413 1.076 2.353 1.253V15a1 1 0 102 0v-.092a4.535 4.535 0 001.676-.662C13.398 13.766 14 12.991 14 12c0-.99-.602-1.765-1.324-2.246A4.535 4.535 0 0011 9.092V7.151c.391.127.68.317.843.504a1 1 0 101.511-1.31c-.563-.649-1.413-1.076-2.354-1.253V5z" clipRule="evenodd" />
                              </svg>
                              Budget limits set
                            </span>
                          )}
                        </div>
                      </div>
  
                      {/* Edit and Assign buttons - Desktop */}
                      {titleId !== 'unassigned' && jobTitle && (
                        <div className="hidden sm:flex space-x-2" onClick={(e) => e.stopPropagation()}>
                          <button
                            onClick={() => onEditJobTitle(jobTitle)}
                            className="px-3 py-1.5 bg-white border border-blue-200 text-blue-600 rounded-lg hover:bg-blue-50 hover:border-blue-300 transition-all text-sm font-medium flex items-center space-x-1.5 shadow-sm"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                            <span>Edit</span>
                          </button>
                          <button
                            onClick={() => onAssignJobTitle(jobTitle)}
                            className="px-3 py-1.5 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-all text-sm font-medium flex items-center space-x-1.5 shadow-sm"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                            </svg>
                            <span>Assign</span>
                          </button>
                        </div>
                      )}
                      
                    
                    </div>
                    
                    {/* Budget limits - Desktop only */}
                    <div className="hidden lg:flex items-center space-x-2 ml-4">
                      {jobTitle && (
                        <>
                          {jobTitle.dailyBudgetLimit && (
                            <div className="flex flex-col items-end">
                              <span className="text-xs text-slate-500">Daily Budget</span>
                              <span className="text-sm font-semibold text-blue-700">£{jobTitle.dailyBudgetLimit}</span>
                            </div>
                          )}
                          {jobTitle.monthlyBudgetLimit && (
                            <div className="flex flex-col items-end ml-4">
                              <span className="text-xs text-slate-500">Monthly Budget</span>
                              <span className="text-sm font-semibold text-green-700">£{jobTitle.monthlyBudgetLimit}</span>
                            </div>
                          )}
                        </>
                      )}
                    </div>

                    <svg 
                        className={`w-5 h-5 ml-10 text-slate-400 transition-transform duration-200 ${expandedJobTitles[titleId] !== false ? 'rotate-180' : ''}`}
                        fill="none" 
                        stroke="currentColor" 
                        viewBox="0 0 24 24"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                  </button>
  
                      
                  {/* Mobile action buttons */}
                  {titleId !== 'unassigned' && jobTitle && (
                    <div className="sm:hidden border-t border-slate-100 p-3 bg-slate-50 flex space-x-2">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onEditJobTitle(jobTitle);
                        }}
                        className="flex-1 px-3 py-2 bg-white border border-blue-200 text-blue-600 rounded-lg hover:bg-blue-50 transition-all text-sm font-medium flex items-center justify-center space-x-1.5"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                        <span>Edit Settings</span>
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onAssignJobTitle(jobTitle);
                        }}
                        className="flex-1 px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-all text-sm font-medium flex items-center justify-center space-x-1.5"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                        </svg>
                        <span>Assign Employees</span>
                      </button>
                    </div>
                  )}
                  
  
                  {/* Employee Cards */}
                  {expandedJobTitles[titleId] !== false && (
                    <div className="px-4 sm:px-6 pb-4 sm:pb-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {emps.map((emp) => (
                          <div key={emp.id} className="border border-slate-200 rounded-lg p-4 hover:shadow-md transition-shadow bg-white">
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
                                <div className="flex items-center space-x-2 mt-2 flex-wrap gap-1">
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
                                
                                <button
                                  onClick={() => handleOpenRoleModal(emp)}
                                  className="mt-3 w-full px-3 py-1.5 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors text-xs font-medium flex items-center justify-center space-x-1"
                                >
                                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                                  </svg>
                                  <span>Change Role</span>
                                </button>
  
                                {emp.status === CorporateUserStatus.INACTIVE ? (
                                  <button
                                    onClick={() => handleReactivate(emp.id)}
                                    disabled={isDeactivating === emp.id}
                                    className="mt-2 w-full px-3 py-1.5 bg-green-50 text-green-600 rounded-lg hover:bg-green-100 transition-colors text-xs font-medium flex items-center justify-center space-x-1 disabled:opacity-50 disabled:cursor-not-allowed"
                                  >
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                    <span>{isDeactivating === emp.id ? 'Reactivating...' : 'Reactivate'}</span>
                                  </button>
                                ) : (
                                  <button
                                    onClick={() => handleDeactivate(emp.id)}
                                    disabled={isDeactivating === emp.id}
                                    className="mt-2 w-full px-3 py-1.5 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors text-xs font-medium flex items-center justify-center space-x-1 disabled:opacity-50 disabled:cursor-not-allowed"
                                  >
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
                                    </svg>
                                    <span>{isDeactivating === emp.id ? 'Deactivating...' : 'Deactivate'}</span>
                                  </button>
                                )}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
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