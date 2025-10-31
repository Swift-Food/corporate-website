'use client';

import { useState, useEffect } from 'react';
import { ProtectedRoute } from '../../../interceptors/auth/protectedRoute';
import { useAuth } from '../../../interceptors/auth/authContext';
import { employeesApi } from '@/api/employees';
import { CorporateUser } from '@/types/user';
import { jobTitlesApi } from '@/api/jobTitle';
import { JobTitleModal } from '@/modals/jobTitleModal';
import { AssignJobTitleModal } from '@/modals/assignJobTitleModal';
import axios from 'axios';
import apiClient from '@/api/client';

export default function DashboardPage() {
  return (
    <ProtectedRoute requireManager>
      <DashboardContent />
    </ProtectedRoute>
  );
}

function DashboardContent() {
  const { corporateUser, user, logout, organizationId } = useAuth();
  const [activeTab, setActiveTab] = useState<'overview' | 'employees' | 'approvals' | 'job-titles' | 'orders'>('overview');
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
  const [isEditingCutoff, setIsEditingCutoff] = useState(false);
  const [tempCutoffTime, setTempCutoffTime] = useState('11:00:00');
  const [isSavingCutoff, setIsSavingCutoff] = useState(false);
  const [todaysOrder, setTodaysOrder] = useState<any>(null);
  const [expandedEmployeeId, setExpandedEmployeeId] = useState<string | null>(null);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [selectedRejectSubOrder, setSelectedRejectSubOrder] = useState<any>(null);
  const [rejectReason, setRejectReason] = useState('');
  const [rejectNotes, setRejectNotes] = useState('');
  const [deliveryTimeWindow, setDeliveryTimeWindow] = useState('');
  const [tempDeliveryWindow, setTempDeliveryWindow] = useState('');
  const [isEditingDeliveryWindow, setIsEditingDeliveryWindow] = useState(false);
  const [isSavingDeliveryWindow, setIsSavingDeliveryWindow] = useState(false);

  const predefinedReasons = [
    'Budget exceeded',
    'Invalid items ordered',
    'Duplicate order',
    'Outside approved vendors',
    'Missing approval',
    'Policy violation',
    'Other (specify in notes)',
  ];

  useEffect(() => {
    if (activeTab === 'employees' && organizationId && corporateUser?.id) {
      loadEmployees();
    } else if (activeTab === 'approvals' && organizationId) {
      loadPendingApprovals();
    } else if (activeTab === 'job-titles' && organizationId) {
      loadJobTitles();
    } else if (activeTab === 'orders' && organizationId && corporateUser?.id) {
      loadOrganizationSettings();
      loadTodaysOrder();
      
    }
  }, [activeTab, organizationId, corporateUser?.id]);

  const loadEmployees = async () => {
    if (!organizationId || !corporateUser?.id) return;
    
    setIsLoading(true);
    setError('');
    try {
      const data = await employeesApi.getAllEmployees(organizationId, corporateUser.id);
      setEmployees(data);
      
      // Group by job title
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
      // Replace with your actual API endpoint
      const response = await apiClient.get(`/organizations/${organizationId}`);
      const cutoffTime = response.data.orderCutoffTime || '11:00:00';
      setOrderCutoffTime(cutoffTime);
      setTempCutoffTime(cutoffTime);
      if (response.data.defaultDeliveryTimeWindow) {
        setDeliveryTimeWindow(response.data.defaultDeliveryTimeWindow);
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load organization settings');
    } finally {
      setIsLoading(false);
    }
  };

  const loadTodaysOrder = async () => {
    console.log("started loading")
    if (!corporateUser?.id) return;
    
    setIsLoading(true);
    setError('');
    try {
      const response = await apiClient.get(`/corporate-orders/pending/${corporateUser.id}`);
      if (response.data) {
        // Transform the data to match the expected format
        const order = response.data;
        const activeSubOrders = order.subOrders?.filter((sub: any) => 
          sub.status !== 'CANCELLED'
        ) || [];
        
        // Calculate restaurant breakdown
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
            
            // Calculate subtotal for this restaurant order
            const orderSubtotal = ro.menuItems?.reduce(
              (sum: number, item: any) => sum + (Number(item.totalPrice) || 0),
              0
            ) || 0;
            
            // Calculate total items for this restaurant order
            const itemCount = ro.menuItems?.reduce(
              (sum: number, item: any) => sum + (item.quantity || 0),
              0
            ) || 0;
            
            rest.employeeCount += 1;
            rest.totalAmount += orderSubtotal; // Use calculated subtotal instead of ro.totalAmount
            rest.totalItems += itemCount;
          });
        });
        
        // Convert Map to Array for easier use
        const restaurantSummary = Array.from(restaurantMap.values());
        console.log("the restaurant summary is", JSON.stringify(restaurantSummary));

        
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

  const handleSaveCutoffTime = async () => {
    console.log("🔵 handleSaveCutoffTime STARTED");
    console.log("📊 State values:", {
      tempCutoffTime,
      organizationId,
      isSavingCutoff
    });
    if (!organizationId) return;
    
    // Validate time format
    const timeRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]:[0-5][0-9]$/;
    if (!timeRegex.test(tempCutoffTime)) {
      setError('Invalid time format. Please use HH:MM:SS format (e.g., 11:00:00)');
      return;
    }

    setIsSavingCutoff(true);
    setError('');
    try {
      // Replace with your actual API endpoint
      console.log("tempcutoff", tempCutoffTime)
      await apiClient.put(`/organizations/${organizationId}`, {
        orderCutoffTime: tempCutoffTime,
      });
      setOrderCutoffTime(tempCutoffTime);
      setIsEditingCutoff(false);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to update cutoff time');
    } finally {
      setIsSavingCutoff(false);
    }
  };

  const handleCancelEdit = () => {
    setTempCutoffTime(orderCutoffTime);
    setIsEditingCutoff(false);
    setError('');
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

  const handleApproveOrder = async () => {
    if (!corporateUser?.id || !todaysOrder?.orderId) return;
    
    const notes = prompt('Approve this order?\nOptional notes:');
    if (notes === null) return; // User cancelled
    
    try {
      await apiClient.post(`corporate-orders/${todaysOrder.orderId}/approve`, {
        managerId: corporateUser.id,
        notes: notes || undefined,
      });
      loadTodaysOrder();
      alert('Order approved successfully!');
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to approve order');
    }
  };

  // Add missing handler for rejecting individual sub-order
  const handleRejectSubOrder = async (subOrderId: string, employeeName: string) => {
    if (!corporateUser?.id) return;
    
    setSelectedRejectSubOrder({ subOrderId, employeeName });
    setShowRejectModal(true);
  };
  
  // Replace the handleRejectEntireOrder function:
  const handleRejectEntireOrder = async () => {
    if (!corporateUser?.id || !todaysOrder?.orderId) return;
    
    setSelectedRejectSubOrder(null);
    setShowRejectModal(true);
  };
  
  // Replace the handleBulkRejectSubOrders function:
  const handleBulkRejectSubOrders = async (subOrderIds: string[], employeeNames: string[]) => {
    if (!corporateUser?.id) return;
    
    setSelectedRejectSubOrder({ subOrderIds, employeeNames });
    setShowRejectModal(true);
  };
  
  // Add checkbox state for bulk selection
  const [selectedSubOrders, setSelectedSubOrders] = useState<Set<string>>(new Set());
  
  // Add select all handler
  const handleSelectAll = () => {
    if (selectedSubOrders.size === todaysOrder.employeeOrders?.length) {
      setSelectedSubOrders(new Set());
    } else {
      const allIds : Set<string> = new Set(
        todaysOrder.employeeOrders
          ?.filter((emp: any) => emp.status !== 'REJECTED')
          .map((emp: any) => emp.subOrderId) || []
      );
      setSelectedSubOrders(allIds);
    }
  };

  const handleSaveDeliveryWindow = async () => {
    if (!tempDeliveryWindow.match(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]:[0-5][0-9]$/)) {
      alert('Please enter a valid time in HH:MM:SS format');
      return;
    }
  
    setIsSavingDeliveryWindow(true);
    try {
      const response = await apiClient.put(`/organizations/${organizationId}`, {
        deliveryTimeWindow: tempDeliveryWindow,
      });
  
      if (response) {
        setDeliveryTimeWindow(tempDeliveryWindow);
        setIsEditingDeliveryWindow(false);
      } else {
        alert('Failed to update delivery window');
      }
    } catch (error) {
      console.error('Error updating delivery window:', error);
      alert('Error updating delivery window');
    } finally {
      setIsSavingDeliveryWindow(false);
    }
  };
  
  const handleCancelDeliveryWindowEdit = () => {
    setTempDeliveryWindow(deliveryTimeWindow);
    setIsEditingDeliveryWindow(false);
  };

  const confirmReject = async () => {
    if (!rejectReason) {
      alert('Please select a reason');
      return;
    }
  
    try {
      if (selectedRejectSubOrder?.subOrderId && !selectedRejectSubOrder?.subOrderIds) {
        // Single sub-order
        await apiClient.post(`/corporate-orders/sub-orders/${selectedRejectSubOrder.subOrderId}/reject`, {
          managerId: corporateUser?.id,
          reason: rejectReason,
          notes: rejectNotes || undefined,
        });
      } else if (selectedRejectSubOrder?.subOrderIds) {
        // Bulk reject
        await apiClient.post(`/corporate-orders/sub-orders/bulk-reject`, {
          subOrderIds: selectedRejectSubOrder.subOrderIds,
          managerId: corporateUser?.id,
          reason: rejectReason,
          notes: rejectNotes || undefined,
        });
      } else {
        // Entire order
        await apiClient.post(`/corporate-orders/${todaysOrder.orderId}/reject`, {
          managerId: corporateUser?.id,
          reason: rejectReason,
          notes: rejectNotes || undefined,
        });
      }
      
      setShowRejectModal(false);
      setRejectReason('');
      setRejectNotes('');
      setSelectedRejectSubOrder(null);
      loadTodaysOrder();
      alert('Order rejected successfully!');
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to reject order');
    }
  };
  
  // Add toggle handler
  const handleToggleSubOrder = (subOrderId: string) => {
    const newSelected = new Set(selectedSubOrders);
    if (newSelected.has(subOrderId)) {
      newSelected.delete(subOrderId);
    } else {
      newSelected.add(subOrderId);
    }
    setSelectedSubOrders(newSelected);
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

  const getStatusColor = (status: string) => {
    const colors = {
      ACTIVE: 'bg-emerald-100 text-emerald-700',
      PENDING: 'bg-amber-100 text-amber-700',
      SUSPENDED: 'bg-red-100 text-red-700',
      DEACTIVATED: 'bg-gray-100 text-gray-700',
    };
    return colors[status as keyof typeof colors] || 'bg-gray-100 text-gray-700';
  };

  const getRoleColor = (role: string) => {
    const colors = {
      ADMIN: 'bg-purple-100 text-purple-700',
      MANAGER: 'bg-blue-100 text-blue-700',
      EMPLOYEE: 'bg-slate-100 text-slate-700',
    };
    return colors[role as keyof typeof colors] || 'bg-slate-100 text-slate-700';
  };

  const formatTimeDisplay = (time: string) => {
    try {
      const [hours, minutes] = time.split(':');
      const hour = parseInt(hours);
      const ampm  = hour >= 12 ? 'PM' : 'AM';
      const displayHour = hour % 12 || 12;
      return `${displayHour}:${minutes} ${ampm}`;
    } catch {
      return time;
    }
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
              <button
                onClick={() => setActiveTab('overview')}
                className={`pb-3 px-1 border-b-2 font-medium transition-colors ${
                  activeTab === 'overview'
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
                }`}
              >
                Overview
              </button>
              <button
                onClick={() => setActiveTab('employees')}
                className={`pb-3 px-1 border-b-2 font-medium transition-colors ${
                  activeTab === 'employees'
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
                }`}
              >
                Employees
                {employees.length > 0 && (
                  <span className="ml-2 px-2 py-0.5 bg-slate-200 text-slate-700 rounded-full text-xs">
                    {employees.length}
                  </span>
                )}
              </button>
              <button
                onClick={() => setActiveTab('approvals')}
                className={`pb-3 px-1 border-b-2 font-medium transition-colors ${
                  activeTab === 'approvals'
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
                }`}
              >
                Pending Approvals
                {pendingApprovals.length > 0 && (
                  <span className="ml-2 px-2 py-0.5 bg-amber-200 text-amber-800 rounded-full text-xs">
                    {pendingApprovals.length}
                  </span>
                )}
              </button>
              <button
                onClick={() => setActiveTab('job-titles')}
                className={`pb-3 px-1 border-b-2 font-medium transition-colors ${
                  activeTab === 'job-titles'
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
                }`}
              >
                Job Titles
                {jobTitles.length > 0 && (
                  <span className="ml-2 px-2 py-0.5 bg-slate-200 text-slate-700 rounded-full text-xs">
                    {jobTitles.length}
                  </span>
                )}
              </button>
              <button
                onClick={() => setActiveTab('orders')}
                className={`pb-3 px-1 border-b-2 font-medium transition-colors ${
                  activeTab === 'orders'
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
                }`}
              >
                Orders
              </button>
            </nav>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-6 py-8">
        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            {/* Budget Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl p-6 text-white shadow-lg">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <p className="text-blue-100 text-sm font-medium">Daily Budget</p>
                    <p className="text-3xl font-bold mt-1">
                      ${corporateUser?.dailyBudgetRemaining?.toFixed(2) || '0.00'}
                    </p>
                  </div>
                  <div className="w-12 h-12 bg-white bg-opacity-20 rounded-lg flex items-center justify-center">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-blue-100">of ${corporateUser?.dailyBudgetLimit?.toFixed(2) || '0.00'}</span>
                  <span className="text-blue-100">
                    {corporateUser?.dailyBudgetLimit 
                      ? Math.round((corporateUser.dailyBudgetRemaining / corporateUser.dailyBudgetLimit) * 100) 
                      : 0}% remaining
                  </span>
                </div>
              </div>

              <div className="bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-xl p-6 text-white shadow-lg">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <p className="text-emerald-100 text-sm font-medium">Monthly Budget</p>
                    <p className="text-3xl font-bold mt-1">
                      ${corporateUser?.monthlyBudgetRemaining?.toFixed(2) || '0.00'}
                    </p>
                  </div>
                  <div className="w-12 h-12 bg-white bg-opacity-20 rounded-lg flex items-center justify-center">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                    </svg>
                  </div>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-emerald-100">of ${corporateUser?.monthlyBudgetLimit?.toFixed(2) || '0.00'}</span>
                  <span className="text-emerald-100">
                    {corporateUser?.monthlyBudgetLimit 
                      ? Math.round((corporateUser.monthlyBudgetRemaining / corporateUser.monthlyBudgetLimit) * 100) 
                      : 0}% remaining
                  </span>
                </div>
              </div>
            </div>

            {/* Info Card */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
              <h3 className="text-lg font-semibold text-slate-900 mb-4">Personal Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-start space-x-3">
                  <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center flex-shrink-0">
                    <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-sm text-slate-500">Email</p>
                    <p className="font-medium text-slate-900">{user?.email}</p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-3">
                  <div className="w-10 h-10 rounded-lg bg-purple-50 flex items-center justify-center flex-shrink-0">
                    <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-sm text-slate-500">Department</p>
                    <p className="font-medium text-slate-900">{corporateUser?.department || 'Not assigned'}</p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-3">
                  <div className="w-10 h-10 rounded-lg bg-amber-50 flex items-center justify-center flex-shrink-0">
                    <svg className="w-5 h-5 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-sm text-slate-500">Employee Code</p>
                    <p className="font-medium text-slate-900">{corporateUser?.employeeCode || 'Not assigned'}</p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-3">
                  <div className="w-10 h-10 rounded-lg bg-emerald-50 flex items-center justify-center flex-shrink-0">
                    <svg className="w-5 h-5 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-sm text-slate-500">Status</p>
                    <span className={`inline-block px-2.5 py-1 rounded-full text-xs font-medium ${getStatusColor(corporateUser?.status || '')}`}>
                      {corporateUser?.status}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}


        {/* Employees Tab */}
        {activeTab === 'employees' && (
          <div className="space-y-6">
            <div className="bg-white rounded-xl shadow-sm border border-slate-200">
              <div className="p-6 border-b border-slate-200">
                <div className="flex justify-between items-center">
                  <div>
                    <h2 className="text-xl font-semibold text-slate-900">Team Members</h2>
                    <p className="text-sm text-slate-500 mt-1">
                      {employees.length} total employees
                    </p>
                  </div>
                  <button 
                    onClick={loadEmployees}
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
                        {/* Job Title Header */}
                        <div className="flex items-center justify-between mb-4">
                          <div className="flex items-center space-x-3">
                            <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                              titleId === 'unassigned' 
                                ? 'bg-slate-100' 
                                : 'bg-blue-100'
                            }`}>
                              <svg className={`w-5 h-5 ${
                                titleId === 'unassigned' 
                                  ? 'text-slate-600' 
                                  : 'text-blue-600'
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
                                  Daily: ${jobTitle.dailyBudgetLimit}
                                </span>
                              )}
                              {jobTitle.monthlyBudgetLimit && (
                                <span className="px-2 py-1 bg-green-50 text-green-700 rounded">
                                  Monthly: ${jobTitle.monthlyBudgetLimit}
                                </span>
                              )}
                            </div>
                          )}
                        </div>

                        {/* Employees Grid */}
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
                                    <div className="text-xs text-slate-500 mt-1">
                                      {emp.department}
                                    </div>
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
                                      <span className="font-medium text-slate-900">${emp.dailyBudgetRemaining?.toFixed(2) || '0.00'}</span>
                                    </div>
                                    <div className="flex justify-between">
                                      <span className="text-slate-500">Monthly:</span>
                                      <span className="font-medium text-slate-900">${emp.monthlyBudgetRemaining?.toFixed(2) || '0.00'}</span>
                                    </div>
                                  </div>
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
          </div>
        )}

        {/* Approvals Tab */}
        {activeTab === 'approvals' && (
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="p-6 border-b border-slate-200">
              <div className="flex justify-between items-center">
                <div>
                  <h2 className="text-xl font-semibold text-slate-900">Pending Approvals</h2>
                  <p className="text-sm text-slate-500 mt-1">Review and approve new employee registrations</p>
                </div>
                <button 
                  onClick={loadPendingApprovals}
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
                <p className="text-slate-600 font-medium">All caught up!</p>
                <p className="text-slate-500 text-sm mt-1">No pending approvals at the moment</p>
              </div>
            ) : (
              <div className="divide-y divide-slate-200">
                {pendingApprovals.map((emp) => (
                  <div key={emp.id} className="p-6 hover:bg-slate-50 transition-colors">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start space-x-4 flex-1">
                        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center text-white font-semibold">
                          {emp.firstName?.[0]}{emp.lastName?.[0]}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center space-x-3">
                            <h3 className="text-lg font-semibold text-slate-900">
                              {emp.firstName} {emp.lastName}
                            </h3>
                            <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-amber-100 text-amber-700">
                              PENDING
                            </span>
                          </div>
                          <div className="mt-2 grid grid-cols-2 gap-x-6 gap-y-2 text-sm">
                            <div className="flex items-center space-x-2 text-slate-600">
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                              </svg>
                              <span>{emp.email}</span>
                            </div>
                            {emp.phoneNumber && (
                              <div className="flex items-center space-x-2 text-slate-600">
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                                </svg>
                                <span>{emp.phoneNumber}</span>
                              </div>
                            )}
                            {emp.department && (
                              <div className="flex items-center space-x-2 text-slate-600">
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                                </svg>
                                <span>{emp.department}</span>
                              </div>
                            )}
                            {emp.employeeCode && (
                              <div className="flex items-center space-x-2 text-slate-600">
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                                </svg>
                                <span>{emp.employeeCode}</span>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="flex space-x-3 ml-4">
                        <button
                          onClick={() => handleApprove(emp.id)}
                          className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors font-medium text-sm flex items-center space-x-2"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                          <span>Approve</span>
                        </button>
                        <button
                          onClick={() => handleReject(emp.id)}
                          className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium text-sm flex items-center space-x-2"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                          <span>Reject</span>
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Job Titles Tab */}
        {activeTab === 'job-titles' && (
          <div className="bg-white rounded-xl shadow-sm border border-slate-200">
            <div className="p-6 border-b border-slate-200">
              <div className="flex justify-between items-center">
                <div>
                  <h2 className="text-xl font-semibold text-slate-900">Job Titles</h2>
                  <p className="text-sm text-slate-500 mt-1">Create and manage job titles with budget rules</p>
                </div>
                <div className="flex space-x-3">
                  <button 
                    onClick={loadJobTitles}
                    className="px-4 py-2 bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200 transition-colors font-medium text-sm"
                  >
                    Refresh
                  </button>
                  <button 
                    onClick={() => { setSelectedJobTitle(null); setShowCreateModal(true); }}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium text-sm"
                  >
                    + Create Job Title
                  </button>
                  
                </div>
              </div>
            </div>

            {error && (
              <div className="m-6 p-4 bg-red-50 border border-red-200 text-red-800 rounded-lg">
                {error}
              </div>
            )}

            {isLoading ? (
              <div className="flex flex-col items-center justify-center py-16">
                <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-200 border-t-blue-600"></div>
                <p className="text-slate-500 mt-4">Loading job titles...</p>
              </div>
            ) : jobTitles.length === 0 ? (
              <div className="text-center py-16">
                <svg className="w-16 h-16 text-slate-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                <p className="text-slate-600 font-medium">No job titles yet</p>
                <p className="text-slate-500 text-sm mt-1">Create your first job title to get started</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-6">
                {jobTitles.map((title) => (
                  <div key={title.id} className="border border-slate-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <h3 className="font-semibold text-slate-900">{title.name}</h3>
                        {title.employeeCount !== undefined && (
                          <p className="text-xs text-slate-500 mt-1">
                            {title.employeeCount} {title.employeeCount === 1 ? 'employee' : 'employees'}
                          </p>
                        )}
                      </div>
                      <span className={`px-2 py-1 rounded text-xs font-medium ${
                        title.isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'
                      }`}>
                        {title.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </div>
                    

                    {title.description && (
                      <p className="text-sm text-slate-600 mb-3">{title.description}</p>
                    )}

                    <div className="space-y-2 text-xs text-slate-600 mb-4">
                      {title.dailyBudgetLimit && (
                        <div className="flex justify-between">
                          <span>Daily Limit:</span>
                          <span className="font-medium">${title.dailyBudgetLimit}</span>
                        </div>
                      )}
                      {title.monthlyBudgetLimit && (
                        <div className="flex justify-between">
                          <span>Monthly Limit:</span>
                          <span className="font-medium">${title.monthlyBudgetLimit}</span>
                        </div>
                      )}
                      {title.maxOrderValue && (
                        <div className="flex justify-between">
                          <span>Max Order:</span>
                          <span className="font-medium">${title.maxOrderValue}</span>
                        </div>
                      )}
                      <div className="flex justify-between">
                        <span>Can Order:</span>
                        <span className="font-medium">{title.canOrder ? 'Yes' : 'No'}</span>
                      </div>
                      {title.requiresApproval && title.approvalThreshold && (
                        <div className="flex justify-between">
                          <span>Approval Threshold:</span>
                          <span className="font-medium">${title.approvalThreshold}</span>
                        </div>
                      )}
                      
                    </div>

                    <div className="flex space-x-2">
                      <button
                        onClick={() => { setSelectedJobTitle(title); setShowCreateModal(true); }}
                        className="flex-1 px-3 py-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors text-sm font-medium"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => { setSelectedJobTitleForAssign(title); setShowAssignModal(true); }}
                        className="flex-1 px-3 py-2 bg-green-50 text-green-600 rounded-lg hover:bg-green-100 transition-colors text-sm font-medium"
                      >
                        Assign
                      </button>
                      <button
                        onClick={() => handleDeleteJobTitle(title.id)}
                        className="px-3 py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors text-sm font-medium"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Orders Tab */}
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
                <p className="text-slate-500 mt-4">Loading order settings...</p>
              </div>
            ) : (
              <div className="p-6">
                {/* Order Cutoff Time Card */}
                <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-6 border border-blue-100">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-start space-x-3">
                      <div className="w-12 h-12 rounded-lg bg-blue-500 flex items-center justify-center flex-shrink-0">
                        <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-slate-900">Daily Order Cutoff Time</h3>
                        <p className="text-sm text-slate-600 mt-1">
                          Orders placed after this time will be processed the next business day
                        </p>
                      </div>
                    </div>
                  </div>

                  {!isEditingCutoff ? (
                    <div className="flex items-center justify-between bg-white rounded-lg p-4 border border-slate-200">
                      <div className="flex items-center space-x-4">
                        <div className="text-3xl font-bold text-blue-600">
                          {formatTimeDisplay(orderCutoffTime)}
                        </div>
                        <div className="text-sm text-slate-500">
                          ({orderCutoffTime})
                        </div>
                      </div>
                      <button
                        onClick={() => setIsEditingCutoff(true)}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium text-sm flex items-center space-x-2"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                        <span>Edit</span>
                      </button>
                    </div>
                  ) : (
                    <div className="bg-white rounded-lg p-4 border border-slate-200 space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">
                          Cutoff Time (24-hour format: HH:MM:SS)
                        </label>
                        <input
                          type="text"
                          value={tempCutoffTime}
                          onChange={(e) => setTempCutoffTime(e.target.value)}
                          placeholder="11:00:00"
                          className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                        <p className="text-xs text-slate-500 mt-2">
                          Examples: 09:00:00, 11:30:00, 14:00:00
                        </p>
                      </div>
                      
                      <div className="flex space-x-3">
                        <button
                          type="button"
                          onClick={handleSaveCutoffTime}
                          disabled={isSavingCutoff}
                          className="flex-1 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors font-medium text-sm flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {isSavingCutoff ? (
                            <>
                              <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                              <span>Saving...</span>
                            </>
                          ) : (
                            <>
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                              </svg>
                              <span>Save Changes</span>
                            </>
                          )}
                        </button>
                        <button
                          onClick={handleCancelEdit}
                          disabled={isSavingCutoff}
                          className="px-4 py-2 bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200 transition-colors font-medium text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                <div className="bg-gradient-to-br from-emerald-50 to-teal-50 rounded-xl p-6 border border-emerald-100 mt-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-start space-x-3">
                      <div className="w-12 h-12 rounded-lg bg-emerald-500 flex items-center justify-center flex-shrink-0">
                        <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-slate-900">Default Delivery Time Window</h3>
                        <p className="text-sm text-slate-600 mt-1">
                          Standard delivery window duration for orders
                        </p>
                      </div>
                    </div>
                  </div>

                  {!isEditingDeliveryWindow ? (
                    <div className="flex items-center justify-between bg-white rounded-lg p-4 border border-slate-200">
                      <div className="flex items-center space-x-4">
                        <div className="text-3xl font-bold text-emerald-600">
                          {deliveryTimeWindow ? formatTimeDisplay(deliveryTimeWindow) : 'Not Set'}
                        </div>
                        {deliveryTimeWindow && (
                          <div className="text-sm text-slate-500">
                            ({deliveryTimeWindow})
                          </div>
                        )}
                      </div>
                      <button
                        onClick={() => {
                          setTempDeliveryWindow(deliveryTimeWindow);
                          setIsEditingDeliveryWindow(true);
                        }}
                        className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors font-medium text-sm flex items-center space-x-2"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                        <span>Edit</span>
                      </button>
                    </div>
                  ) : (
                    <div className="bg-white rounded-lg p-4 border border-slate-200 space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">
                          Delivery Window (24-hour format: HH:MM:SS)
                        </label>
                        <input
                          type="text"
                          value={tempDeliveryWindow}
                          onChange={(e) => setTempDeliveryWindow(e.target.value)}
                          placeholder="02:00:00"
                          className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                        />
                        <p className="text-xs text-slate-500 mt-2">
                          Examples: 01:00:00 (1 hour), 02:00:00 (2 hours), 04:00:00 (4 hours)
                        </p>
                      </div>
                      
                      <div className="flex space-x-3">
                        <button
                          onClick={handleSaveDeliveryWindow}
                          disabled={isSavingDeliveryWindow}
                          className="flex-1 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors font-medium text-sm flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {isSavingDeliveryWindow ? (
                            <>
                              <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                              <span>Saving...</span>
                            </>
                          ) : (
                            <>
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                              </svg>
                              <span>Save Changes</span>
                            </>
                          )}
                        </button>
                        <button
                          onClick={handleCancelDeliveryWindowEdit}
                          disabled={isSavingDeliveryWindow}
                          className="px-4 py-2 bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200 transition-colors font-medium text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  )}
                </div>


{todaysOrder?.hasOrder && (
  <div className="mt-6 space-y-6">
    {/* Order Summary Card */}
    <div className="bg-white rounded-xl border border-slate-200 p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-slate-900">Today's Order</h3>
        <div className="flex items-center space-x-3">
          <span className={`px-3 py-1 rounded-full text-sm font-medium ${
            todaysOrder.status === 'pending_approval' ? 'bg-amber-100 text-amber-700' :
            todaysOrder.status === 'APPROVED' ? 'bg-green-100 text-green-700' :
            todaysOrder.status === 'REJECTED' ? 'bg-red-100 text-red-700' :
            'bg-slate-100 text-slate-700'
          }`}>
            {todaysOrder.status.replace('_', ' ')}
          </span>
          
          {todaysOrder.status === 'pending_approval' && (
            <>
              <button
                onClick={handleRejectEntireOrder}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium text-sm flex items-center space-x-2"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
                <span>Reject All</span>
              </button>
              <button
                onClick={handleApproveOrder}
                className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors font-medium text-sm flex items-center space-x-2"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span>Approve Order</span>
              </button>
            </>
          )}
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-slate-50 rounded-lg p-4">
          <p className="text-xs text-slate-500 mb-1">Total Employees</p>
          <p className="text-2xl font-bold text-slate-900">{todaysOrder.totalEmployees}</p>
        </div>
        <div className="bg-blue-50 rounded-lg p-4">
          <p className="text-xs text-blue-600 mb-1">Subtotal</p>
          <p className="text-2xl font-bold text-blue-700">${todaysOrder.subtotal.toFixed(2)}</p>
        </div>
        <div className="bg-amber-50 rounded-lg p-4">
          <p className="text-xs text-amber-600 mb-1">Tax + Delivery</p>
          <p className="text-2xl font-bold text-amber-700">
            ${(todaysOrder.taxAmount + todaysOrder.deliveryFee).toFixed(2)}
          </p>
        </div>
        <div className="bg-emerald-50 rounded-lg p-4">
          <p className="text-xs text-emerald-600 mb-1">Total</p>
          <p className="text-2xl font-bold text-emerald-700">${todaysOrder.totalAmount.toFixed(2)}</p>
        </div>
      </div>

      {todaysOrder.restaurants && todaysOrder.restaurants.length > 0 && (
        <div>
          <h4 className="text-sm font-semibold text-slate-900 mb-3">Restaurants</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {todaysOrder.restaurants.map((restaurant: any, idx: number) => (
              <div key={idx} className="flex items-center justify-between bg-slate-50 rounded-lg p-3">
                <div>
                  <p className="font-medium text-slate-900">{restaurant.name}</p>
                  <p className="text-xs text-slate-500">{restaurant.employeeCount} employees</p>
                </div>
                <p className="text-sm font-semibold text-slate-900">${restaurant.totalAmount.toFixed(2)}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>

    {/* Employee Sub-Orders */}
    <div className="bg-white rounded-xl border border-slate-200">
      <div className="p-6 border-b border-slate-200">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-lg font-semibold text-slate-900">Employee Orders</h3>
            <p className="text-sm text-slate-500 mt-1">
              {todaysOrder.employeeOrders?.length || 0} employees ordered today
            </p>
          </div>
          {todaysOrder.status === 'pending_approval' && selectedSubOrders.size > 0 && (
            <div className="flex items-center space-x-3">
              <span className="text-sm text-slate-600">
                {selectedSubOrders.size} selected
              </span>
              <button
                onClick={() => {
                  const selected = todaysOrder.employeeOrders?.filter((emp: any) => 
                    selectedSubOrders.has(emp.subOrderId)
                  );
                  handleBulkRejectSubOrders(
                    Array.from(selectedSubOrders),
                    selected.map((emp: any) => emp.employeeName)
                  );
                }}
                className="px-3 py-1.5 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors font-medium text-sm"
              >
                Reject Selected
              </button>
            </div>
          )}
        </div>
        {todaysOrder.status === 'pending_approval' && todaysOrder.employeeOrders?.length > 0 && (
          <label className="flex items-center space-x-2 cursor-pointer">
            <input
              type="checkbox"
              checked={selectedSubOrders.size === todaysOrder.employeeOrders.filter((emp: any) => emp.status !== 'REJECTED').length}
              onChange={handleSelectAll}
              className="w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
            />
            <span className="text-sm text-slate-600">Select All</span>
          </label>
        )}
      </div>

      {todaysOrder.employeeOrders && todaysOrder.employeeOrders.length > 0 ? (
        <div className="divide-y divide-slate-200">
          {todaysOrder.employeeOrders.map((empOrder: any) => (
            <div key={empOrder.employeeId}>
              <div 
                className="p-4 hover:bg-slate-50 transition-colors cursor-pointer"
                // onClick={() => setExpandedEmployeeId(
                //   expandedEmployeeId === empOrder.employeeId ? null : empOrder.employeeId
                // )}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    {todaysOrder.status === 'pending_approval' && empOrder.status !== 'REJECTED' && (
                      <input
                        type="checkbox"
                        checked={selectedSubOrders.has(empOrder.subOrderId)}
                        onChange={(e) => {
                          e.stopPropagation();
                          handleToggleSubOrder(empOrder.subOrderId);
                        }}
                        onClick={(e) => e.stopPropagation()}
                        className="w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                      />
                    )}
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white font-semibold">
                      {empOrder.employeeName.split(' ').map((n: string) => n[0]).join('')}
                    </div>
                    <div>
                      <p className="font-medium text-slate-900">{empOrder.employeeName}</p>
                      {empOrder.jobTitle && (
                        <p className="text-xs text-slate-500">{empOrder.jobTitle}</p>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center space-x-4">
                    <div className="text-right">
                      <p className="text-sm font-semibold text-slate-900">${empOrder.totalAmount.toFixed(2)}</p>
                      <p className="text-xs text-slate-500">
                        {empOrder.restaurantCount} {empOrder.restaurantCount === 1 ? 'restaurant' : 'restaurants'}
                      </p>
                    </div>
                    <span className={`px-2 py-1 rounded text-xs font-medium ${
                      empOrder.status === 'PENDING' ? 'bg-amber-100 text-amber-700' :
                      empOrder.status === 'CONFIRMED' ? 'bg-green-100 text-green-700' :
                      empOrder.status === 'REJECTED' ? 'bg-red-100 text-red-700' :
                      'bg-slate-100 text-slate-700'
                    }`}>
                      {empOrder.status}
                    </span>
                    { /*
                      <svg 
                      className={`w-5 h-5 text-slate-400 transition-transform ${
                        expandedEmployeeId === empOrder.employeeId ? 'rotate-180' : ''
                      }`} 
                      fill="none" 
                      stroke="currentColor" 
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                    */}         
                  </div>
                </div>
              </div>
              
              {/* Expanded Restaurant Orders */}
              {expandedEmployeeId === empOrder.employeeId && empOrder.restaurantOrders && (
                <div className="bg-slate-50 border-t border-slate-200">
                  <div className="p-4 space-y-3">
                    {empOrder.restaurantOrders.map((ro: any, idx: number) => (
                      <div key={idx} className="bg-white rounded-lg p-4 border border-slate-200">
                        <div className="flex items-start justify-between mb-3">
                          <div>
                            <p className="font-medium text-slate-900">{ro.restaurantName}</p>
                            <p className="text-xs text-slate-500 mt-1">{ro.items?.length || 0} items</p>
                          </div>
                          <p className="text-sm font-semibold text-slate-900">${ro.totalAmount?.toFixed(2)}</p>
                        </div>
                        
                        {ro.items && ro.items.length > 0 && (
                          <div className="space-y-2">
                            {ro.items.map((item: any, itemIdx: number) => (
                              <div key={itemIdx} className="flex items-start justify-between text-sm">
                                <div className="flex-1">
                                  <p className="text-slate-900">
                                    {item.quantity}x {item.name}
                                  </p>
                                  {item.customizations && item.customizations.length > 0 && (
                                    <p className="text-xs text-slate-500 ml-4">
                                      {item.customizations.join(', ')}
                                    </p>
                                  )}
                                </div>
                                <p className="text-slate-600 ml-4">${item.price?.toFixed(2)}</p>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                    
                    {todaysOrder.status === 'pending_approval' && empOrder.status !== 'REJECTED' && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleRejectSubOrder(empOrder.subOrderId, empOrder.employeeName);
                        }}
                        className="w-full px-4 py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors font-medium text-sm"
                      >
                        Reject This Employee's Order
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <p className="text-slate-500">No employee orders yet</p>
        </div>
      )}
    </div>
  </div>
)}

              {!todaysOrder?.hasOrder && !isLoading && (
                <div className="mt-6 text-center py-12 bg-slate-50 rounded-xl border border-slate-200">
                  <svg className="w-16 h-16 text-slate-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                  <p className="text-slate-600 font-medium">No orders placed today</p>
                  <p className="text-slate-500 text-sm mt-1">Orders will appear here once employees start placing them</p>
                </div>
              )}

                {/* Info Section */}
                <div className="mt-6 bg-blue-50 border border-blue-100 rounded-lg p-4">
                  <div className="flex items-start space-x-3">
                    <svg className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                    </svg>
                    <div className="text-sm text-blue-800">
                      <p className="font-medium mb-1">Important Information</p>
                      <ul className="list-disc list-inside space-y-1 text-blue-700">
                        <li>The cutoff time applies to all orders across the organization</li>
                        <li>Orders placed before the cutoff time will be processed on the same day</li>
                        <li>Orders placed after the cutoff time will be queued for the next business day</li>
                        <li>Time must be in 24-hour format (HH:MM:SS)</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Modal */}
        {showCreateModal && (
          <JobTitleModal
            isOpen={showCreateModal}
            onClose={() => { setShowCreateModal(false); setSelectedJobTitle(null); }}
            onSuccess={loadJobTitles}
            organizationId={organizationId || ''}
            jobTitle={selectedJobTitle}
          />
        )}
        {/* Assignment Modal */}
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
        {showRejectModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-semibold text-slate-900">Reject Order</h3>
                <button
                  onClick={() => {
                    setShowRejectModal(false);
                    setRejectReason('');
                    setRejectNotes('');
                    setSelectedRejectSubOrder(null);
                  }}
                  className="text-slate-400 hover:text-slate-600"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <div className="mb-4">
                <p className="text-sm text-slate-600 mb-2">
                  {selectedRejectSubOrder?.employeeName ? (
                    <>Rejecting order for: <span className="font-semibold">{selectedRejectSubOrder.employeeName}</span></>
                  ) : selectedRejectSubOrder?.employeeNames ? (
                    <>Rejecting orders for: <span className="font-semibold">{selectedRejectSubOrder.employeeNames.join(', ')}</span></>
                  ) : (
                    <>Rejecting entire order for all employees</>
                  )}
                </p>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Reason <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={rejectReason}
                    onChange={(e) => setRejectReason(e.target.value)}
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  >
                    <option value="">Select a reason...</option>
                    {predefinedReasons.map((reason) => (
                      <option key={reason} value={reason}>
                        {reason}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Additional Notes (Optional)
                  </label>
                  <textarea
                    value={rejectNotes}
                    onChange={(e) => setRejectNotes(e.target.value)}
                    placeholder="Provide additional context..."
                    rows={3}
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent resize-none"
                  />
                </div>
              </div>

              <div className="flex space-x-3 mt-6">
                <button
                  onClick={() => {
                    setShowRejectModal(false);
                    setRejectReason('');
                    setRejectNotes('');
                    setSelectedRejectSubOrder(null);
                  }}
                  className="flex-1 px-4 py-2 bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200 transition-colors font-medium"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmReject}
                  disabled={!rejectReason}
                  className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Confirm Reject
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}