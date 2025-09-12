import React, { useState } from 'react';

const EmployeeSidebar = ({ employees, selectedEmployee, onEmployeeSelect }) => {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredEmployees = employees.filter(employee =>
    employee.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    employee.empId?.toString().includes(searchTerm) ||
    employee.department?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="h-full">
      <div className="p-4 border-b">
        <h2 className="text-lg font-semibold text-gray-900 mb-3">SEARCH EMPLOYEE</h2>
        <div className="relative">
          <input
            type="text"
            placeholder="Search Employee..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm('')}
              className="absolute right-2 top-2 text-gray-400 hover:text-gray-600"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>
      </div>

      <div className="p-4">
        <div className="space-y-3">
          {filteredEmployees.map((employee) => (
            <div
              key={employee._id}
              onClick={() => onEmployeeSelect(employee)}
              className={`p-3 rounded-lg border cursor-pointer transition-colors ${
                selectedEmployee?._id === employee._id
                  ? 'bg-indigo-50 border-indigo-200'
                  : 'bg-white border-gray-200 hover:bg-gray-50'
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-medium text-gray-900 text-sm">
                      {employee.name}
                    </h3>
                    <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                      {employee.empId || 'N/A'}
                    </span>
                  </div>
                  
                  <div className="space-y-1 text-xs text-gray-600">
                    <div className="flex items-center gap-2">
                      <span className="font-medium">Unit:</span>
                      <span>KU01</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="font-medium">Department:</span>
                      <span>{employee.department || 'Sales'}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="font-medium">Grade:</span>
                      <span>{employee.grade || '4'}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="font-medium">Contact No:</span>
                      <span>{employee.contactNo || 'N/A'}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="font-medium">Level:</span>
                      <span>L1</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {filteredEmployees.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            <p>No employees found</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default EmployeeSidebar;
