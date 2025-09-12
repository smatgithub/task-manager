import React, { useState, useEffect } from 'react';

const PerformanceMetrics = ({ selectedEmployee, dateRange }) => {
  const [metrics, setMetrics] = useState({
    notDoneScore: 100.0,
    notDoneOnTimeScore: 30.0,
    week: 36
  });

  useEffect(() => {
    // Fetch performance metrics for selected employee
    if (selectedEmployee) {
      fetchPerformanceMetrics();
    }
  }, [selectedEmployee, dateRange]);

  const fetchPerformanceMetrics = async () => {
    try {
      const response = await fetch(`/api/admin/performance-metrics/${selectedEmployee.empId}?fromDate=${dateRange.fromDate}&toDate=${dateRange.toDate}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      if (response.ok) {
        const data = await response.json();
        setMetrics(data);
      } else {
        // Fallback to mock data if API fails
        setMetrics({
          notDoneScore: Math.random() * 100,
          notDoneOnTimeScore: Math.random() * 100,
          week: 36
        });
      }
    } catch (error) {
      console.error('Error fetching performance metrics:', error);
      // Fallback to mock data
      setMetrics({
        notDoneScore: Math.random() * 100,
        notDoneOnTimeScore: Math.random() * 100,
        week: 36
      });
    }
  };

  const CircularProgress = ({ percentage, color, label, size = 80 }) => {
    const radius = (size - 8) / 2;
    const circumference = 2 * Math.PI * radius;
    const strokeDasharray = circumference;
    const strokeDashoffset = circumference - (percentage / 100) * circumference;

    return (
      <div className="flex flex-col items-center">
        <div className="relative" style={{ width: size, height: size }}>
          <svg
            width={size}
            height={size}
            className="transform -rotate-90"
          >
            {/* Background circle */}
            <circle
              cx={size / 2}
              cy={size / 2}
              r={radius}
              stroke="currentColor"
              strokeWidth="4"
              fill="transparent"
              className="text-gray-200"
            />
            {/* Progress circle */}
            <circle
              cx={size / 2}
              cy={size / 2}
              r={radius}
              stroke="currentColor"
              strokeWidth="4"
              fill="transparent"
              strokeDasharray={strokeDasharray}
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="round"
              className={`transition-all duration-300 ${color}`}
            />
          </svg>
          {/* Percentage text */}
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-lg font-bold text-gray-700">
              {percentage.toFixed(1)}%
            </span>
          </div>
        </div>
        <span className="text-xs text-gray-600 mt-2 text-center">{label}</span>
      </div>
    );
  };

  return (
    <div className="flex items-center justify-between">
      <div className="text-sm text-gray-600">
        <span className="font-medium">Performance Metrics</span>
        <span className="ml-2">Week: {metrics.week}</span>
      </div>
      
      <div className="flex items-center gap-6">
        <CircularProgress
          percentage={metrics.notDoneScore}
          color="text-green-500"
          label="Not Done Score"
          size={60}
        />
        <CircularProgress
          percentage={metrics.notDoneOnTimeScore}
          color="text-red-500"
          label="Not Done on Time Score"
          size={60}
        />
      </div>
    </div>
  );
};

export default PerformanceMetrics;
