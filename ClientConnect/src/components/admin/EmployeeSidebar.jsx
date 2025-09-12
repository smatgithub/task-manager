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
      <div className="p-4 border-b border-slate-700">
        <h2 className="text-lg font-semibold text-white mb-3 flex items-center">
          <svg className="w-5 h-5 mr-2 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          SEARCH EMPLOYEE
        </h2>
        <div className="relative">
          <input
            type="text"
            placeholder="Search Employee..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-sm text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
          />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm('')}
              className="absolute right-3 top-3 text-slate-400 hover:text-slate-200 transition-colors duration-200"
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
              className={`p-4 rounded-xl border cursor-pointer transition-all duration-200 transform hover:scale-105 ${
                selectedEmployee?._id === employee._id
                  ? 'bg-gradient-to-r from-blue-600 to-purple-600 border-blue-500 shadow-lg'
                  : 'bg-slate-700 border-slate-600 hover:bg-slate-600 hover:border-slate-500 shadow-md'
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                      selectedEmployee?._id === employee._id
                        ? 'bg-white/20'
                        : 'bg-gradient-to-br from-emerald-500 to-teal-600'
                    }`}>
                      <span className={`text-xs font-bold ${
                        selectedEmployee?._id === employee._id ? 'text-white' : 'text-white'
                      }`}>
                        {employee.name?.charAt(0)?.toUpperCase()}
                      </span>
                    </div>
                    <div className="flex-1">
                      <h3 className={`font-semibold text-sm ${
                        selectedEmployee?._id === employee._id ? 'text-white' : 'text-slate-200'
                      }`}>
                        {employee.name}
                      </h3>
                      <span className={`text-xs px-2 py-1 rounded-full ${
                        selectedEmployee?._id === employee._id
                          ? 'bg-white/20 text-white'
                          : 'bg-slate-600 text-slate-300'
                      }`}>
                        {employee.empId || 'N/A'}
                      </span>
                    </div>
                  </div>
                  
                  <div className="space-y-1 text-xs">
                    <div className="flex items-center gap-2">
                      <span className={`font-medium ${
                        selectedEmployee?._id === employee._id ? 'text-white/80' : 'text-slate-400'
                      }`}>Unit:</span>
                      <span className={selectedEmployee?._id === employee._id ? 'text-white/90' : 'text-slate-300'}>KU01</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`font-medium ${
                        selectedEmployee?._id === employee._id ? 'text-white/80' : 'text-slate-400'
                      }`}>Department:</span>
                      <span className={selectedEmployee?._id === employee._id ? 'text-white/90' : 'text-slate-300'}>{employee.department || 'Sales'}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`font-medium ${
                        selectedEmployee?._id === employee._id ? 'text-white/80' : 'text-slate-400'
                      }`}>Grade:</span>
                      <span className={selectedEmployee?._id === employee._id ? 'text-white/90' : 'text-slate-300'}>{employee.grade || '4'}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`font-medium ${
                        selectedEmployee?._id === employee._id ? 'text-white/80' : 'text-slate-400'
                      }`}>Level:</span>
                      <span className={selectedEmployee?._id === employee._id ? 'text-white/90' : 'text-slate-300'}>L1</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {filteredEmployees.length === 0 && (
          <div className="text-center py-8">
            <div className="w-16 h-16 bg-slate-700 rounded-full flex items-center justify-center mx-auto mb-3">
              <svg className="w-8 h-8 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <p className="text-slate-400">No employees found</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default EmployeeSidebar;
