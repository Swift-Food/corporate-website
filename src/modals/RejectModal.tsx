import { useState } from "react";

interface RejectModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (reason: string, notes: string) => void;
  selectedOrder: { 
    employeeName?: string; 
    employeeNames?: string[]; 
  } | null;
}

export function RejectModal({ isOpen, onClose, onConfirm, selectedOrder }: RejectModalProps) {
  const [rejectReason, setRejectReason] = useState('');
  const [rejectNotes, setRejectNotes] = useState('');
  
  const predefinedReasons = [
    'Budget exceeded',
    'Invalid items ordered',
    'Duplicate order',
    'Outside approved vendors',
    'Missing approval',
    'Policy violation',
    'Other (specify in notes)',
  ];

  if (!isOpen) return null;

  const handleClose = () => {
    setRejectReason('');
    setRejectNotes('');
    onClose();
  };

  const handleConfirm = () => {
    if (!rejectReason) return;
    onConfirm(rejectReason, rejectNotes);
    handleClose();
  };

  return (
    // Remove the duplicate wrapper div
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-semibold text-slate-900">Reject Order</h3>
          <button
            onClick={handleClose} // Changed
            className="text-slate-400 hover:text-slate-600"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="mb-4">
          <p className="text-sm text-slate-600 mb-2">
            {selectedOrder?.employeeName ? ( // Changed
              <>Rejecting order for: <span className="font-semibold">{selectedOrder.employeeName}</span></>
            ) : selectedOrder?.employeeNames ? ( // Changed
              <>Rejecting orders for: <span className="font-semibold">{selectedOrder.employeeNames.join(', ')}</span></>
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
            onClick={handleClose} // Changed
            className="flex-1 px-4 py-2 bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200 transition-colors font-medium"
          >
            Cancel
          </button>
          <button
            onClick={handleConfirm} // Changed
            disabled={!rejectReason}
            className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Confirm Reject
          </button>
        </div>
      </div>
    </div>
  );
}