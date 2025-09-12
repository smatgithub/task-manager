import React, { useState, useEffect } from 'react';

const OTDSection = ({ selectedEmployee, dateRange }) => {
  const [otdTasks, setOtdTasks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (selectedEmployee) {
      fetchOtdTasks();
    }
  }, [selectedEmployee, dateRange]);

  const fetchOtdTasks = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/admin/otd-tasks/${selectedEmployee.empId}?fromDate=${dateRange.fromDate}&toDate=${dateRange.toDate}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setOtdTasks(data);
        return;
      }
      
      // Fallback to mock data if API fails
      const mockData = [
        {
          id: 1798,
          task: "MNOP Quarterly Review and Analysis",
          freq: "Q",
          endDate: "2020-03-04",
          status: "pending"
        },
        {
          id: 6762,
          task: "Training Plan Vs Achievement Report",
          freq: "W-Sat",
          endDate: "2023-05-27",
          status: "in-progress"
        },
        {
          id: 6781,
          task: "Attend the Training Session on New Technologies",
          freq: "W-Thr",
          endDate: "2023-06-01",
          status: "done"
        },
        {
          id: 7881,
          task: "Need to Attend WRM meeting and prepare report",
          freq: "M-30",
          endDate: "2023-06-30",
          status: "pending"
        },
        {
          id: 7884,
          task: "System Maintenance and Update",
          freq: "W-Wed",
          endDate: "2023-08-30",
          status: "overdue"
        },
        {
          id: 8234,
          task: "Client Meeting Preparation and Documentation",
          freq: "W-Fri",
          endDate: "2023-09-15",
          status: "in-progress"
        }
      ];
      setOtdTasks(mockData);
    } catch (error) {
      console.error('Error fetching OTD tasks:', error);
    } finally {
      setLoading(false);
    }
  };

  const generateWeekColumns = () => {
    const weeks = [];
    const startDate = new Date(dateRange.fromDate);
    const endDate = new Date(dateRange.toDate);
    
    // Generate weeks from start to end date
    for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 7)) {
      const weekStart = new Date(d);
      const weekEnd = new Date(d);
      weekEnd.setDate(weekEnd.getDate() + 6);
      
      weeks.push({
        start: new Date(weekStart),
        end: new Date(weekEnd),
        weekNumber: Math.ceil((weekStart - new Date(weekStart.getFullYear(), 0, 1)) / (7 * 24 * 60 * 60 * 1000))
      });
    }
    
    return weeks;
  };

  const getTaskStatusForWeek = (task, week) => {
    // Mock logic - in real implementation, this would check actual task status
    const random = Math.random();
    if (random < 0.4) return 'N';
    if (random < 0.7) return `/04 Sep`;
    if (random < 0.9) return `/06 Sep`;
    return `/30 Aug`;
  };

  const getStatusColor = (status) => {
    if (status === 'N') return 'bg-red-100 text-red-800';
    if (status.includes('/')) return 'bg-green-100 text-green-800';
    return 'bg-gray-100 text-gray-800';
  };

  const formatWeekHeader = (week) => {
    const months = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'];
    
    const startDay = week.start.getDate().toString().padStart(2, '0');
    const startMonth = months[week.start.getMonth()];
    const endDay = week.end.getDate().toString().padStart(2, '0');
    const endMonth = months[week.end.getMonth()];
    
    return `WK-${week.weekNumber} ${startDay} ${startMonth}-${endDay} ${endMonth}`;
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="space-y-3">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-8 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  const weekColumns = generateWeekColumns();

  return (
    <div className="bg-white rounded-lg shadow">
      <div className="px-4 py-3 border-b flex justify-between items-center">
        <h2 className="text-lg font-semibold text-gray-900">OTD</h2>
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
              <th className="px-2 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">FREQ</th>
              <th className="px-2 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">END DATE</th>
              <th className="px-2 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">EDIT</th>
              {weekColumns.map((week, index) => (
                <th key={index} className="px-1 py-2 text-center text-xs font-medium text-gray-500 uppercase tracking-wider min-w-20">
                  {formatWeekHeader(week)}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {otdTasks.map((task) => (
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
                  {task.freq}
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
                {weekColumns.map((week, index) => {
                  const status = getTaskStatusForWeek(task, week);
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

export default OTDSection;
