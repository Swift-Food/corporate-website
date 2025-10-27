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
  const [isLoading, setIsLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    if (isOpen) {
      loadEmployees();
    }
  }, [isOpen]);

  const loadEmployees = async () => {
    try {
      const data = await employeesApi.getAllEmployees(organizationId, managerId);
      setEmployees(data);
    } catch (err) {
      console.error('Failed to load employees:', err);
    }
  };

  const handleToggleEmployee = (employeeId: string) => {
    setSelectedEmployees(prev => 
      prev.includes(employeeId)
        ? prev.filter(id => id !== employeeId)
        : [...prev, employeeId]
    );
  };

  const handleAssign = async () => {
    if (selectedEmployees.length === 0) {
      alert('Please select at least one employee');
      return;
    }

    setIsLoading(true);
    try {
      await jobTitlesApi.assign(
        organizationId,
        {
          jobTitleId: jobTitle.id,
          employeeIds: selectedEmployees,
        },
        managerId
      );
      onSuccess();
      onClose();
      setSelectedEmployees([]);
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to assign job title');
    } finally {
      setIsLoading(false);
    }
  };

  const filteredEmployees = employees.filter(emp => 
    `${emp.firstName} ${emp.lastName} ${emp.email}`.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        <div className="p-6 border-b border-slate-200">
          <h2 className="text-xl font-semibold text-slate-900">
            Assign "{jobTitle.name}" to Employees
          </h2>
          <p className="text-sm text-slate-500 mt-1">
            Select employees to assign this job title
          </p>
        </div>

        <div className="p-6 border-b border-slate-200">
          <input
            type="text"
            placeholder="Search employees..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          {filteredEmployees.length === 0 ? (
            <div className="text-center py-8 text-slate-500">
              No employees found
            </div>
          ) : (
            <div className="space-y-2">
              {filteredEmployees.map((emp) => (
                <label
                  key={emp.id}
                  className="flex items-center space-x-3 p-3 rounded-lg hover:bg-slate-50 cursor-pointer transition-colors"
                >
                  <input
                    type="checkbox"
                    checked={selectedEmployees.includes(emp.id)}
                    onChange={() => handleToggleEmployee(emp.id)}
                    className="w-5 h-5 text-blue-600 rounded"
                  />
                  <div className="flex items-center space-x-3 flex-1">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white font-semibold text-sm">
                      {emp.firstName?.[0]}{emp.lastName?.[0]}
                    </div>
                    <div>
                      <div className="font-medium text-slate-900">
                        {emp.firstName} {emp.lastName}
                      </div>
                      <div className="text-sm text-slate-500">{emp.email}</div>
                    </div>
                  </div>
                  {emp.department && (
                    <span className="text-xs text-slate-500 bg-slate-100 px-2 py-1 rounded">
                      {emp.department}
                    </span>
                  )}
                </label>
              ))}
            </div>
          )}
        </div>

        <div className="p-6 border-t border-slate-200 flex justify-between items-center">
          <div className="text-sm text-slate-600">
            {selectedEmployees.length} employee{selectedEmployees.length !== 1 ? 's' : ''} selected
          </div>
          <div className="flex space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-slate-700 bg-slate-100 rounded-lg hover:bg-slate-200 font-medium"
            >
              Cancel
            </button>
            <button
              onClick={handleAssign}
              disabled={isLoading || selectedEmployees.length === 0}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 font-medium"
            >
              {isLoading ? 'Assigning...' : `Assign to ${selectedEmployees.length}`}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}