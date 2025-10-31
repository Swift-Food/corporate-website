// modals/assignJobTitleModal.tsx

'use client';

import { useState, useEffect } from 'react';
import { jobTitlesApi } from '@/api/jobTitle';
import { employeesApi } from '@/api/employees';
import { CorporateUser } from '@/types/user';

interface AssignJobTitleModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  organizationId: string;
  managerId: string;
  jobTitle: any;
}

export function AssignJobTitleModal({ 
  isOpen, 
  onClose, 
  onSuccess, 
  organizationId, 
  managerId,
  jobTitle 
}: AssignJobTitleModalProps) {
  const [employees, setEmployees] = useState<CorporateUser[]>([]);
  const [selectedEmployees, setSelectedEmployees] = useState<string[]>([]);
  const [initiallySelectedEmployees, setInitiallySelectedEmployees] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingEmployees, setIsLoadingEmployees] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    if (isOpen) {
      loadEmployees();
    } else {
      // Reset when modal closes
      setSelectedEmployees([]);
      setInitiallySelectedEmployees([]);
      setSearchTerm('');
    }
  }, [isOpen]);

  const loadEmployees = async () => {
    setIsLoadingEmployees(true);
    try {
      const data = await employeesApi.getAllEmployees(organizationId, managerId);
      setEmployees(data);
      
      // Pre-select employees who already have this job title
      const employeesWithJobTitle = data
        .filter(emp => emp.jobTitleId === jobTitle.id)
        .map(emp => emp.id);
      
      setSelectedEmployees(employeesWithJobTitle);
      setInitiallySelectedEmployees(employeesWithJobTitle);
    } catch (err) {
      console.error('Failed to load employees:', err);
      alert('Failed to load employees');
    } finally {
      setIsLoadingEmployees(false);
    }
  };

  const handleToggleEmployee = (employeeId: string) => {
    setSelectedEmployees(prev => 
      prev.includes(employeeId)
        ? prev.filter(id => id !== employeeId)
        : [...prev, employeeId]
    );
  };

  const handleSelectAll = () => {
    if (selectedEmployees.length === filteredEmployees.length) {
      setSelectedEmployees([]);
    } else {
      setSelectedEmployees(filteredEmployees.map(emp => emp.id));
    }
  };

  const handleAssign = async () => {
    // Calculate which employees to add and which to remove
    const employeesToAssign = selectedEmployees.filter(
      id => !initiallySelectedEmployees.includes(id)
    );
    
    const employeesToRemove = initiallySelectedEmployees.filter(
      id => !selectedEmployees.includes(id)
    );

    if (employeesToAssign.length === 0 && employeesToRemove.length === 0) {
      alert('No changes to save');
      return;
    }

    setIsLoading(true);
    try {
      await jobTitlesApi.assign(
        organizationId,
        {
          jobTitleId: jobTitle.id,
          employeeIds: selectedEmployees, // All currently selected
          removedEmployeeIds: employeesToRemove, // Those that were removed
        },
        managerId
      );
      
      onSuccess();
      onClose();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to assign job title');
    } finally {
      setIsLoading(false);
    }
  };

  const filteredEmployees = employees.filter(emp => 
    `${emp.firstName} ${emp.lastName} ${emp.email}`.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getChangesSummary = () => {
    const toAdd = selectedEmployees.filter(id => !initiallySelectedEmployees.includes(id)).length;
    const toRemove = initiallySelectedEmployees.filter(id => !selectedEmployees.includes(id)).length;
    
    const changes = [];
    if (toAdd > 0) changes.push(`+${toAdd} to add`);
    if (toRemove > 0) changes.push(`-${toRemove} to remove`);
    
    return changes.length > 0 ? changes.join(', ') : 'No changes';
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        <div className="p-6 border-b border-slate-200">
          <h2 className="text-xl font-semibold text-slate-900">
            Assign "{jobTitle.name}" to Employees
          </h2>
          <p className="text-sm text-slate-500 mt-1">
            Select or deselect employees to assign or remove this job title
          </p>
        </div>

        <div className="p-6 border-b border-slate-200 space-y-3">
          <input
            type="text"
            placeholder="Search employees..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          />
          
          {!isLoadingEmployees && filteredEmployees.length > 0 && (
            <button
              onClick={handleSelectAll}
              className="text-sm text-blue-600 hover:text-blue-700 font-medium"
            >
              {selectedEmployees.length === filteredEmployees.length ? 'Deselect All' : 'Select All'}
            </button>
          )}
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          {isLoadingEmployees ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-4 border-blue-200 border-t-blue-600"></div>
            </div>
          ) : filteredEmployees.length === 0 ? (
            <div className="text-center py-8 text-slate-500">
              {searchTerm ? 'No employees found matching your search' : 'No employees found'}
            </div>
          ) : (
            <div className="space-y-2">
              {filteredEmployees.map((emp) => {
                const isSelected = selectedEmployees.includes(emp.id);
                const wasInitiallySelected = initiallySelectedEmployees.includes(emp.id);
                const isChanged = isSelected !== wasInitiallySelected;
                
                return (
                  <label
                    key={emp.id}
                    className={`flex items-center space-x-3 p-3 rounded-lg cursor-pointer transition-colors ${
                      isChanged 
                        ? 'bg-blue-50 border-2 border-blue-200 hover:bg-blue-100' 
                        : 'hover:bg-slate-50 border-2 border-transparent'
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => handleToggleEmployee(emp.id)}
                      className="w-5 h-5 text-blue-600 rounded"
                    />
                    <div className="flex items-center space-x-3 flex-1">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white font-semibold text-sm">
                        {emp.firstName?.[0]}{emp.lastName?.[0]}
                      </div>
                      <div className="flex-1">
                        <div className="font-medium text-slate-900">
                          {emp.firstName} {emp.lastName}
                        </div>
                        <div className="text-sm text-slate-500">{emp.email}</div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      {emp.department && (
                        <span className="text-xs text-slate-500 bg-slate-100 px-2 py-1 rounded">
                          {emp.department}
                        </span>
                      )}
                      {isChanged && (
                        <span className={`text-xs font-medium px-2 py-1 rounded ${
                          isSelected 
                            ? 'bg-green-100 text-green-700' 
                            : 'bg-red-100 text-red-700'
                        }`}>
                          {isSelected ? 'Will Add' : 'Will Remove'}
                        </span>
                      )}
                      {wasInitiallySelected && !isChanged && (
                        <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded">
                          Current
                        </span>
                      )}
                    </div>
                  </label>
                );
              })}
            </div>
          )}
        </div>

        <div className="p-6 border-t border-slate-200">
          <div className="flex justify-between items-center mb-4">
            <div className="text-sm">
              <span className="text-slate-600">
                {selectedEmployees.length} employee{selectedEmployees.length !== 1 ? 's' : ''} selected
              </span>
              <span className="text-slate-400 mx-2">•</span>
              <span className={`font-medium ${
                getChangesSummary() === 'No changes' ? 'text-slate-500' : 'text-blue-600'
              }`}>
                {getChangesSummary()}
              </span>
            </div>
          </div>
          
          <div className="flex space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 text-slate-700 bg-slate-100 rounded-lg hover:bg-slate-200 font-medium"
            >
              Cancel
            </button>
            <button
              onClick={handleAssign}
              disabled={isLoading || getChangesSummary() === 'No changes'}
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
            >
              {isLoading ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}