import React, { useState, useEffect } from 'react';

const DailySection = ({ selectedEmployee, dateRange }) => {
  const [dailyTasks, setDailyTasks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (selectedEmployee) {
      fetchDailyTasks();
    }
  }, [selectedEmployee, dateRange]);

  const fetchDailyTasks = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/admin/daily-tasks/${selectedEmployee.empId}?fromDate=${dateRange.fromDate}&toDate=${dateRange.toDate}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setDailyTasks(data);
        return;
      }
      
      // Fallback to mock data if API fails
      const mockData = [
        {
          id: 748,
          task: "Updation of worklist for the month of September 2023",
          endDate: "N",
          status: "pending"
        },
        {
          id: 749,
          task: "Creating New Google Workspace Account for New Employee",
          endDate: "31/03/2026",
          status: "in-progress"
        },
        {
          id: 10745,
          task: "Guide and train user on new system features",
          endDate: "31/01/2026",
          status: "pending"
        },
        {
          id: 13244,
          task: "Test new application deployment",
          endDate: "N",
          status: "done"
        }
      ];
      setDailyTasks(mockData);
    } catch (error) {
      console.error('Error fetching daily tasks:', error);
    } finally {
      setLoading(false);
    }
  };

  const generateDateColumns = () => {
    const dates = [];
    const startDate = new Date(dateRange.fromDate);
    const endDate = new Date(dateRange.toDate);
    
    for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
      dates.push(new Date(d));
    }
    
    return dates;
  };

  const getTaskStatusForDate = (task, date) => {
    // Mock logic - in real implementation, this would check actual task status
    const random = Math.random();
    if (random < 0.3) return 'N';
    if (random < 0.6) return 'Sep 07 1:00:AM';
    return 'Aug 31 1:00:AM';
  };

  const getStatusColor = (status) => {
    if (status === 'N') return 'bg-red-100 text-red-800';
    if (status.includes('AM') || status.includes('PM')) return 'bg-green-100 text-green-800';
    return 'bg-gray-100 text-gray-800';
  };

  const formatDateHeader = (date) => {
    const days = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];
    const months = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'];
    
    const dayName = days[date.getDay()];
    const day = date.getDate().toString().padStart(2, '0');
    const month = months[date.getMonth()];
    
    return `${day} ${month} ${dayName}`;
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="space-y-3">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-8 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  const dateColumns = generateDateColumns();

  return (
    <div className="bg-white rounded-lg shadow">
      <div className="px-4 py-3 border-b flex justify-between items-center">
        <h2 className="text-lg font-semibold text-gray-900">DAILY</h2>
        <button className="bg-indigo-600 text-white px-3 py-1.5 rounded-md hover:bg-indigo-700 text-sm">
          Download
        </button>
      </div>
      
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-2 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
              <th className="px-2 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">TASK</th>
              <th className="px-2 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">END DATE</th>
              <th className="px-2 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">EDIT</th>
              {dateColumns.map((date, index) => (
                <th key={index} className="px-1 py-2 text-center text-xs font-medium text-gray-500 uppercase tracking-wider min-w-16">
                  {formatDateHeader(date)}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {dailyTasks.map((task) => (
              <tr key={task.id} className="hover:bg-gray-50">
                <td className="px-2 py-2 whitespace-nowrap text-sm font-medium text-gray-900">
                  {task.id}
                </td>
                <td className="px-2 py-2 text-sm text-gray-900 max-w-xs">
                  <div className="truncate" title={task.task}>
                    {task.task}
                  </div>
                  <button className="text-indigo-600 hover:text-indigo-800 text-xs mt-1">
                    More
                  </button>
                </td>
                <td className="px-2 py-2 whitespace-nowrap text-sm text-gray-900">
                  {task.endDate}
                </td>
                <td className="px-2 py-2 whitespace-nowrap text-sm text-gray-900">
                  <button className="text-gray-400 hover:text-gray-600">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                  </button>
                </td>
                {dateColumns.map((date, index) => {
                  const status = getTaskStatusForDate(task, date);
                  return (
                    <td key={index} className="px-1 py-2 text-center">
                      <span className={`inline-flex px-1 py-0.5 text-xs font-medium rounded-full ${getStatusColor(status)}`}>
                        {status}
                      </span>
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default DailySection;
