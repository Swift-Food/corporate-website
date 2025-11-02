// page.tsx (simplified)
'use client';

import { useState, useEffect } from 'react';
import { ProtectedRoute } from '../../../interceptors/auth/protectedRoute';
import { useAuth } from '../../../interceptors/auth/authContext';
import { employeesApi } from '@/api/employees';
import { CorporateUser } from '@/types/user';
import { jobTitlesApi } from '@/api/jobTitle';
import { JobTitleModal } from '@/modals/jobTitleModal';
import { AssignJobTitleModal } from '@/modals/assignJobTitleModal';
import apiClient from '@/api/client';

// Import new components
import { Overview } from './Overview';
import { EmployeesTab } from './EmployeesTab';
import { ApprovalsTab } from './ApprovalsTab';
import { JobTitlesTab } from './JobTitlesTab';
import { OrderSettings } from './OrderSettings';
import { TodaysOrder } from './TodaysOrder';
import { RejectModal } from '@/modals/RejectModal';
import { corporateOrdersApi } from '@/api/corporateOrders';
import { ApprovedOrdersTab } from './ApprovedOrdersTab';
import { WalletTab } from './WalletTab';

export default function DashboardPage() {
  return (
    <ProtectedRoute requireManager>
      <DashboardContent />
    </ProtectedRoute>
  );
}

function DashboardContent() {
  const { corporateUser, user, logout, organizationId } = useAuth();
  const [activeTab, setActiveTab] = useState<'overview' | 'employees' | 'approvals' | 'job-titles' | 'orders' | 'approved-orders' | 'wallet'>('overview');
  const [employees, setEmployees] = useState<CorporateUser[]>([]);
  const [pendingApprovals, setPendingApprovals] = useState<CorporateUser[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [jobTitles, setJobTitles] = useState<any[]>([]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [selectedJobTitleForAssign, setSelectedJobTitleForAssign] = useState<any>(null);
  const [selectedJobTitle, setSelectedJobTitle] = useState<any>(null);
  const [employeesByJobTitle, setEmployeesByJobTitle] = useState<Record<string, CorporateUser[]>>({});
  const [error, setError] = useState('');
  const [orderCutoffTime, setOrderCutoffTime] = useState('11:00:00');
  const [deliveryTimeWindow, setDeliveryTimeWindow] = useState('');
  const [todaysOrder, setTodaysOrder] = useState<any>(null);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [selectedRejectSubOrder, setSelectedRejectSubOrder] = useState<any>(null);
  const [approvedOrders, setApprovedOrders] = useState<any[]>([]);
  const [autoApproveEmployees, setAutoApproveEmployees] = useState(false);

  useEffect(() => {
    if (activeTab === 'employees' && organizationId && corporateUser?.id) {
      loadEmployees();
    } else if (activeTab === 'approvals' && organizationId) {
      loadPendingApprovals();
      loadOrganizationSettings();
    } else if (activeTab === 'job-titles' && organizationId) {
      loadJobTitles();
    } else if (activeTab === 'orders' && organizationId && corporateUser?.id) {
      loadOrganizationSettings();
      loadTodaysOrder();
    }else if (activeTab === 'approved-orders' && organizationId && corporateUser?.id) {
      loadApprovedOrders();
    }
  }, [activeTab, organizationId, corporateUser?.id]);

  const loadEmployees = async () => {
    if (!organizationId || !corporateUser?.id) return;
    
    setIsLoading(true);
    setError('');
    try {
      const data = await employeesApi.getAllEmployees(organizationId, corporateUser.id);
      setEmployees(data);
      
      const grouped = data.reduce((acc, emp) => {
        const titleId = emp.jobTitleName || 'unassigned';
        if (!acc[titleId]) {
          acc[titleId] = [];
        }
        acc[titleId].push(emp);
        return acc;
      }, {} as Record<string, CorporateUser[]>);
      
      setEmployeesByJobTitle(grouped);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load employees');
    } finally {
      setIsLoading(false);
    }
  };

  const loadPendingApprovals = async () => {
    if (!organizationId) return;
    
    setIsLoading(true);
    setError('');
    try {
      const data = await employeesApi.getPendingApprovals(organizationId);
      setPendingApprovals(data);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load pending approvals');
    } finally {
      setIsLoading(false);
    }
  };

  const loadJobTitles = async () => {
    if (!organizationId) return;
    setIsLoading(true);
    setError('');
    try {
      const data = await jobTitlesApi.getAll(organizationId);
      setJobTitles(data);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load job titles');
    } finally {
      setIsLoading(false);
    }
  };

  const loadOrganizationSettings = async () => {
    if (!organizationId) return;
    setIsLoading(true);
    setError('');
    try {
      const response = await apiClient.get(`/organizations/${organizationId}`);
      const cutoffTime = response.data.orderCutoffTime || '11:00:00';
      setOrderCutoffTime(cutoffTime);
      if (response.data.defaultDeliveryTimeWindow) {
        setDeliveryTimeWindow(response.data.defaultDeliveryTimeWindow);
      }
      setAutoApproveEmployees(response.data.autoApproveEmployees || false);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load organization settings');
    } finally {
      setIsLoading(false);
    }
  };

  const loadTodaysOrder = async () => {
    if (!corporateUser?.id) return;
    
    setIsLoading(true);
    setError('');
    try {
      const response = await apiClient.get(`/corporate-orders/pending/${corporateUser.id}`);
      if (response.data) {
        const order = response.data;
        const activeSubOrders = order.subOrders?.filter((sub: any) => 
          sub.status !== 'CANCELLED'
        ) || [];
        
        const restaurantMap = new Map();
        activeSubOrders.forEach((sub: any) => {
          sub.restaurantOrders?.forEach((ro: any) => {
            if (!restaurantMap.has(ro.restaurantId)) {
              restaurantMap.set(ro.restaurantId, {
                restaurantId: ro.restaurantId,
                name: ro.restaurantName || 'Unknown',
                employeeCount: 0,
                totalAmount: 0,
                totalItems: 0,
              });
            }
            const rest = restaurantMap.get(ro.restaurantId);
            
            const orderSubtotal = ro.menuItems?.reduce(
              (sum: number, item: any) => sum + (Number(item.totalPrice) || 0),
              0
            ) || 0;
            
            const itemCount = ro.menuItems?.reduce(
              (sum: number, item: any) => sum + (item.quantity || 0),
              0
            ) || 0;
            
            rest.employeeCount += 1;
            rest.totalAmount += orderSubtotal;
            rest.totalItems += itemCount;
          });
        });
        
        setTodaysOrder({
          hasOrder: true,
          orderId: order.id,
          orderDate: order.orderDate,
          status: order.status,
          cutoffTime: order.cutoffTime,
          requestedDeliveryTime: order.requestedDeliveryTime,
          totalEmployees: activeSubOrders.length,
          subtotal: Number(order.subtotal),
          taxAmount: Number(order.taxAmount),
          deliveryFee: Number(order.deliveryFee),
          totalAmount: Number(order.totalAmount),
          requiresApproval: order.requiresApproval,
          approvedBy: order.approvedBy,
          approvedAt: order.approvedAt,
          restaurants: Array.from(restaurantMap.values()),
          employeeOrders: activeSubOrders.map((sub: any) => ({
            employeeId: sub.corporateUserId,
            subOrderId: sub.id,
            employeeName: `${sub.corporateUser?.firstName || ''} ${sub.corporateUser?.lastName || ''}`.trim(),
            jobTitle: sub.corporateUser?.jobTitle?.name,
            totalAmount: Number(sub.totalAmount),
            restaurantCount: sub.restaurantOrders?.length || 0,
            status: sub.status,
            restaurantOrders: sub.restaurantOrders?.map((ro: any) => ({
              restaurantId: ro.restaurantId,
              restaurantName: ro.restaurantName || 'Unknown Restaurant',
              totalAmount: Number(ro.totalAmount || 0),
              items: ro.items || [],
            })),
          })),
        });
      } else {
        setTodaysOrder({ hasOrder: false });
      }
    } catch (err: any) {
      if (err.response?.status === 404) {
        setTodaysOrder({ hasOrder: false });
      } else {
        setError(err.response?.data?.message || 'Failed to load today\'s order');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const loadApprovedOrders = async () => {
    if (!corporateUser?.id) return;
    
    setIsLoading(true);
    setError('');
    try {
      const data = await corporateOrdersApi.getApprovedOrders(corporateUser.id);
      setApprovedOrders(data);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load approved orders');
    } finally {
      setIsLoading(false);
    }
  };
  const handleToggleAutoApprove = async (enabled: boolean) => {
    if (!organizationId) return;
    
    try {
      await apiClient.put(`/organizations/${organizationId}`, {
        autoApproveEmployees: enabled,
      });
      
      setAutoApproveEmployees(enabled);
    } catch (err: any) {
      throw err; // Let the component handle the error
    }
  };

  const handleChangeRole = async (employeeId: string, newRole: string) => {
    if (!corporateUser?.id || !organizationId) return;
    
    try {
      await apiClient.patch(
        `/corporate-users/${employeeId}/change-role`,
        { role: newRole },
        { params: { managerId: corporateUser.id } }
      );
      
      // Reload employees to reflect the change
      await loadEmployees();
      
      alert('Role changed successfully!');
    } catch (err: any) {
      throw err; // Let the modal handle the error
    }
  };

  const handleDeleteJobTitle = async (id: string) => {
    if (!organizationId) return;
    if (!confirm('Delete this job title?')) return;
    try {
      await jobTitlesApi.delete(organizationId, id);
      loadJobTitles();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to delete');
    }
  };

  const handleApproveOrder = async (
    paymentMethod: 'wallet' | 'stripe_direct',
    paymentMethodId?: string
  ) => {
    if (!corporateUser?.id || !todaysOrder?.orderId) return;
    
    const notes = prompt('Approve this order?\nOptional notes:');
    if (notes === null) return;
    
    try {
      await apiClient.post(`corporate-orders/${todaysOrder.orderId}/approve`, {
        managerId: corporateUser.id,
        paymentMethod,
        paymentMethodId,
        notes: notes || undefined,
      });
      loadTodaysOrder();
      alert('Order approved successfully!');
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to approve order');
    }
  };

  const handleRejectSubOrder = async (subOrderId?: string, employeeName?: string) => {
    if (!corporateUser?.id) return;
    
    if (subOrderId && employeeName) {
      setSelectedRejectSubOrder({ subOrderId, employeeName });
    } else {
      setSelectedRejectSubOrder(null);
    }
    setShowRejectModal(true);
  };

  const handleBulkRejectSubOrders = async (subOrderIds: string[], employeeNames: string[]) => {
    if (!corporateUser?.id) return;
    
    setSelectedRejectSubOrder({ subOrderIds, employeeNames });
    setShowRejectModal(true);
  };

  const confirmReject = async (reason: string, notes: string) => {
    try {
      if (selectedRejectSubOrder?.subOrderId && !selectedRejectSubOrder?.subOrderIds) {
        await apiClient.post(`/corporate-orders/sub-orders/${selectedRejectSubOrder.subOrderId}/reject`, {
          managerId: corporateUser?.id,
          reason,
          notes: notes || undefined,
        });
      } else if (selectedRejectSubOrder?.subOrderIds) {
        await apiClient.post(`/corporate-orders/sub-orders/bulk-reject`, {
          subOrderIds: selectedRejectSubOrder.subOrderIds,
          managerId: corporateUser?.id,
          reason,
          notes: notes || undefined,
        });
      } else {
        await apiClient.post(`/corporate-orders/${todaysOrder.orderId}/reject`, {
          managerId: corporateUser?.id,
          reason,
          notes: notes || undefined,
        });
      }
      
      loadTodaysOrder();
      alert('Order rejected successfully!');
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to reject order');
    }
  };

  const handleApprove = async (employeeId: string) => {
    if (!corporateUser?.id) return;
    
    try {
      await employeesApi.approveEmployee(employeeId, corporateUser.id);
      loadPendingApprovals();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to approve employee');
    }
  };

  const handleReject = async (employeeId: string) => {
    if (!corporateUser?.id) return;
    
    if (!confirm('Are you sure you want to reject this employee?')) return;
    
    try {
      await employeesApi.rejectEmployee(employeeId, corporateUser.id);
      loadPendingApprovals();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to reject employee');
    }
  };

  const getRoleColor = (role: string) => {
    const colors = {
      ADMIN: 'bg-purple-100 text-purple-700',
      MANAGER: 'bg-blue-100 text-blue-700',
      EMPLOYEE: 'bg-slate-100 text-slate-700',
    };
    return colors[role as keyof typeof colors] || 'bg-slate-100 text-slate-700';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      {/* Header */}
      <header className="bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white font-bold text-lg">
                {corporateUser?.firstName?.[0]}{corporateUser?.lastName?.[0]}
              </div>
              <div>
                <h1 className="text-2xl font-bold text-slate-900">Manager Dashboard</h1>
                <p className="text-sm text-slate-600">
                  {corporateUser?.firstName} {corporateUser?.lastName} • 
                  <span className={`ml-2 px-2 py-0.5 rounded text-xs ${getRoleColor(corporateUser?.corporateRole || '')}`}>
                    {corporateUser?.corporateRole}
                  </span>
                </p>
              </div>
            </div>
            <button
              onClick={logout}
              className="px-4 py-2 bg-slate-900 text-white rounded-lg hover:bg-slate-800 transition-colors font-medium"
            >
              Logout
            </button>
          </div>
          
          {/* Tabs */}
          <div className="mt-6 border-b border-slate-200">
            <nav className="flex space-x-8">
              {(['overview', 'employees', 'approvals', 'job-titles', 'orders', 'approved-orders', 'wallet'] as const).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`pb-3 px-1 border-b-2 font-medium transition-colors ${
                    activeTab === tab
                      ? 'border-blue-600 text-blue-600'
                      : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
                  }`}
                >
                  {tab.charAt(0).toUpperCase() + tab.slice(1).replace('-', ' ')}
                  {tab === 'employees' && employees.length > 0 && (
                    <span className="ml-2 px-2 py-0.5 bg-slate-200 text-slate-700 rounded-full text-xs">
                      {employees.length}
                    </span>
                  )}
                  
                  {tab === 'approvals' && pendingApprovals.length > 0 && (
                    <span className="ml-2 px-2 py-0.5 bg-amber-200 text-amber-800 rounded-full text-xs">
                      {pendingApprovals.length}
                    </span>
                  )}
                  {tab === 'approved-orders' && approvedOrders.length > 0 && (
                    <span className="ml-2 px-2 py-0.5 bg-blue-200 text-blue-800 rounded-full text-xs">
                      {approvedOrders.length}
                    </span>
                  )}
                  {tab === 'job-titles' && jobTitles.length > 0 && (
                    <span className="ml-2 px-2 py-0.5 bg-slate-200 text-slate-700 rounded-full text-xs">
                      {jobTitles.length}
                    </span>
                  )}
                  {tab === 'wallet' && organizationId && (
                   <></>
                  )}
                </button>
              ))}
            </nav>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-6 py-8">
        {activeTab === 'overview' && (
          <Overview corporateUser={corporateUser} user={user} />
        )}

        {activeTab === 'employees' && (
          <EmployeesTab
            employees={employees}
            employeesByJobTitle={employeesByJobTitle}
            jobTitles={jobTitles}
            isLoading={isLoading}
            error={error}
            onChangeRole={handleChangeRole} 
            onRefresh={loadEmployees}
          />
        )}

        {activeTab === 'approvals' && (
          <ApprovalsTab
            pendingApprovals={pendingApprovals}
            isLoading={isLoading}
            error={error}
            onRefresh={loadPendingApprovals}
            onApprove={handleApprove}
            onReject={handleReject}
            autoApproveEmployees={autoApproveEmployees}
            onToggleAutoApprove={handleToggleAutoApprove}
          />
        )}

        {activeTab === 'job-titles' && (
          <JobTitlesTab
            jobTitles={jobTitles}
            isLoading={isLoading}
            error={error}
            onRefresh={loadJobTitles}
            onCreate={() => { setSelectedJobTitle(null); setShowCreateModal(true); }}
            onEdit={(title) => { setSelectedJobTitle(title); setShowCreateModal(true); }}
            onAssign={(title) => { setSelectedJobTitleForAssign(title); setShowAssignModal(true); }}
            onDelete={handleDeleteJobTitle}
          />
        )}

        {activeTab === 'orders' && (
          <div className="bg-white rounded-xl shadow-sm border border-slate-200">
            <div className="p-6 border-b border-slate-200">
              <div className="flex justify-between items-center">
                <div>
                  <h2 className="text-xl font-semibold text-slate-900">Order Settings</h2>
                  <p className="text-sm text-slate-500 mt-1">Configure organization-wide order preferences</p>
                </div>
                <button 
                  onClick={loadOrganizationSettings}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium text-sm"
                >
                  Refresh
                </button>
              </div>
            </div>

            {isLoading ? (
              <div className="flex flex-col items-center justify-center py-16">
                <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-200 border-t-blue-600"></div>
                <p className="text-slate-500 mt-4">Loading order settings...</p>
              </div>
            ) : (
              <>
                <OrderSettings
                  orderCutoffTime={orderCutoffTime}
                  deliveryTimeWindow={deliveryTimeWindow}
                  organizationId={organizationId || ''}
                  onUpdate={loadOrganizationSettings}
                />
                
                {todaysOrder?.hasOrder ? (
                  <TodaysOrder
                    organizationId={organizationId || ''}
                    managerId={corporateUser?.id || ''}
                    order={todaysOrder}
                    onApprove={handleApproveOrder}
                    onReject={handleRejectSubOrder}
                    onBulkReject={handleBulkRejectSubOrders}
                  />
                ) : !isLoading && (
                  <div className="mt-6 text-center py-12 bg-slate-50 rounded-xl border border-slate-200 m-6">
                    <svg className="w-16 h-16 text-slate-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                    </svg>
                    <p className="text-slate-600 font-medium">No orders placed today</p>
                    <p className="text-slate-500 text-sm mt-1">Orders will appear here once employees start placing them</p>
                  </div>
                )}
              </>
            )}
          </div>

        )}

        {activeTab === 'approved-orders' && (
          <ApprovedOrdersTab
            orders={approvedOrders}
            isLoading={isLoading}
            error={error}
            onRefresh={loadApprovedOrders}
          />
        )}

        {activeTab === 'wallet' && organizationId && corporateUser?.id && (
          <WalletTab
            organizationId={organizationId}
            managerId={corporateUser?.id}
          />
        )}
      </main>

      {/* Modals */}
      {showCreateModal && (
        <JobTitleModal
          isOpen={showCreateModal}
          onClose={() => { setShowCreateModal(false); setSelectedJobTitle(null); }}
          onSuccess={loadJobTitles}
          organizationId={organizationId || ''}
          jobTitle={selectedJobTitle}
        />
      )}
      
      {showAssignModal && selectedJobTitleForAssign && (
        <AssignJobTitleModal
          isOpen={showAssignModal}
          onClose={() => { setShowAssignModal(false); setSelectedJobTitleForAssign(null); }}
          onSuccess={() => { loadJobTitles(); loadEmployees(); }}
          organizationId={organizationId || ''}
          managerId={corporateUser?.id || ''}
          jobTitle={selectedJobTitleForAssign}
        />
      )}

      <RejectModal
        isOpen={showRejectModal}
        onClose={() => {
          setShowRejectModal(false);
          setSelectedRejectSubOrder(null);
        }}
        onConfirm={confirmReject}
        selectedOrder={selectedRejectSubOrder}
      />
    </div>
  );
}