// components/dashboard/JobTitlesTab.tsx

interface JobTitlesTabProps {
  jobTitles: any[];
  isLoading: boolean;
  error: string;
  onRefresh: () => void;
  onCreate: () => void;
  onEdit: (jobTitle: any) => void;
  onAssign: (jobTitle: any) => void;
  onDelete: (id: string) => void;
}

export function JobTitlesTab({ 
  jobTitles, 
  isLoading, 
  error, 
  onRefresh, 
  onCreate, 
  onEdit, 
  onAssign, 
  onDelete 
}: JobTitlesTabProps) {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200">
      <div className="p-6 border-b border-slate-200">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-xl font-semibold text-slate-900">Job Titles</h2>
            <p className="text-sm text-slate-500 mt-1">Create and manage job titles with budget rules</p>
          </div>
          <div className="flex space-x-3">
            <button 
              onClick={onRefresh}
              className="px-4 py-2 bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200 transition-colors font-medium text-sm"
            >
              Refresh
            </button>
            <button 
              onClick={onCreate}
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
                    <span className="font-medium">£{title.dailyBudgetLimit}</span>
                  </div>
                )}
                {title.maxOrderValue && (
                  <div className="flex justify-between">
                    <span>Max Order:</span>
                    <span className="font-medium">£{title.maxOrderValue}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span>Can Order:</span>
                  <span className="font-medium">{title.canOrder ? 'Yes' : 'No'}</span>
                </div>
                {title.requiresApproval && title.approvalThreshold && (
                  <div className="flex justify-between">
                    <span>Approval Threshold:</span>
                    <span className="font-medium">£{title.approvalThreshold}</span>
                  </div>
                )}
              </div>

              <div className="flex space-x-2">
                <button
                  onClick={() => onEdit(title)}
                  className="flex-1 px-3 py-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors text-sm font-medium"
                >
                  Edit
                </button>
                <button
                  onClick={() => onAssign(title)}
                  className="flex-1 px-3 py-2 bg-green-50 text-green-600 rounded-lg hover:bg-green-100 transition-colors text-sm font-medium"
                >
                  Assign
                </button>
                <button
                  onClick={() => onDelete(title.id)}
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
  );
}