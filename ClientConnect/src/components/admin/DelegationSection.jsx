import React, { useState, useEffect } from 'react';

const DelegationSection = ({ selectedEmployee, dateRange }) => {
  const [delegationTasks, setDelegationTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('All');
  const [summaryStats, setSummaryStats] = useState({
    all: 323,
    done: 95,
    pending: 0,
    overdue: 113,
    noTrgtDt: 92,
    cancelled: 23
  });

  useEffect(() => {
    if (selectedEmployee) {
      fetchDelegationTasks();
    }
  }, [selectedEmployee, dateRange, statusFilter]);

  const fetchDelegationTasks = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/admin/delegation-tasks/${selectedEmployee.empId}?fromDate=${dateRange.fromDate}&toDate=${dateRange.toDate}&status=${statusFilter}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setDelegationTasks(data.tasks);
        setSummaryStats(data.summaryStats);
        return;
      }
      
      // Fallback to mock data if API fails
      const mockData = [
        {
          taskId: 54460,
          description: "delegation error !! Please check the system logs and resolve the issue",
          issueDate: "15/09/23",
          updatedAt: "15/09/23",
          targetDate: "N",
          delegatedBy: "Somnath Das",
          finishDate: "",
          totalReschedule: "",
          status: "No_Trgt_Dt"
        },
        {
          taskId: 51044,
          description: "Name- Sirajuddin Sarkar, Emp ID- S18000360, Issue- System access problem",
          issueDate: "13/07/23",
          updatedAt: "13/07/23",
          targetDate: "N",
          delegatedBy: "Arnab Chowdhury",
          finishDate: "",
          totalReschedule: "",
          status: "No_Trgt_Dt"
        },
        {
          taskId: 53911,
          description: "Solusoft training need to be completed by end of this month",
          issueDate: "06/09/23",
          updatedAt: "06/09/23",
          targetDate: "N",
          delegatedBy: "Somnath Das",
          finishDate: "",
          totalReschedule: "",
          status: "No_Trgt_Dt"
        },
        {
          taskId: 51939,
          description: "I did not get OT on 15th September, please check and resolve",
          issueDate: "29/07/23",
          updatedAt: "29/07/23",
          targetDate: "N",
          delegatedBy: "Arnab Chowdhury",
          finishDate: "",
          totalReschedule: "",
          status: "No_Trgt_Dt"
        },
        {
          taskId: 51234,
          description: "Database backup verification and testing",
          issueDate: "20/08/23",
          updatedAt: "20/08/23",
          targetDate: "25/08/23",
          delegatedBy: "Somnath Das",
          finishDate: "25/08/23",
          totalReschedule: "0",
          status: "Done"
        },
        {
          taskId: 52345,
          description: "Server maintenance and security updates",
          issueDate: "10/09/23",
          updatedAt: "10/09/23",
          targetDate: "15/09/23",
          delegatedBy: "Arnab Chowdhury",
          finishDate: "",
          totalReschedule: "2",
          status: "Overdue"
        }
      ];

      // Filter by status
      const filteredData = statusFilter === 'All' 
        ? mockData 
        : mockData.filter(task => task.status === statusFilter);

      setDelegationTasks(filteredData);
    } catch (error) {
      console.error('Error fetching delegation tasks:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Done':
        return 'bg-green-100 text-green-800';
      case 'Overdue':
        return 'bg-red-100 text-red-800';
      case 'No_Trgt_Dt':
        return 'bg-yellow-100 text-yellow-800';
      case 'Cancelled':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-blue-100 text-blue-800';
    }
  };

  const getTabColor = (status, count) => {
    if (status === 'Done') return 'bg-green-500 text-white';
    if (status === 'Overdue') return 'bg-red-500 text-white';
    return 'bg-gray-100 text-gray-700';
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

  return (
    <div className="bg-white rounded-lg shadow">
      <div className="px-4 py-3 border-b flex justify-between items-center">
        <h2 className="text-lg font-semibold text-gray-900">DELEGATION</h2>
        <div className="flex items-center gap-3">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="border border-gray-300 rounded-md px-2 py-1 text-sm"
          >
            <option value="All">All</option>
            <option value="Done">Done</option>
            <option value="Pending">Pending</option>
            <option value="Overdue">Overdue</option>
            <option value="No_Trgt_Dt">No Trgt Dt</option>
            <option value="Cancelled">Cancelled</option>
          </select>
          <button className="bg-indigo-600 text-white px-3 py-1.5 rounded-md hover:bg-indigo-700 text-sm">
            Download
          </button>
        </div>
      </div>

      {/* Summary Tabs */}
      <div className="px-4 py-3 border-b">
        <div className="flex space-x-1">
          <button
            onClick={() => setStatusFilter('All')}
            className={`px-4 py-2 rounded-md text-sm font-medium ${getTabColor('All', summaryStats.all)}`}
          >
            All: {summaryStats.all}
          </button>
          <button
            onClick={() => setStatusFilter('Done')}
            className={`px-4 py-2 rounded-md text-sm font-medium ${getTabColor('Done', summaryStats.done)}`}
          >
            Done: {summaryStats.done}
          </button>
          <button
            onClick={() => setStatusFilter('Pending')}
            className={`px-4 py-2 rounded-md text-sm font-medium ${getTabColor('Pending', summaryStats.pending)}`}
          >
            Pending: {summaryStats.pending}
          </button>
          <button
            onClick={() => setStatusFilter('Overdue')}
            className={`px-4 py-2 rounded-md text-sm font-medium ${getTabColor('Overdue', summaryStats.overdue)}`}
          >
            Overdue: {summaryStats.overdue}
          </button>
          <button
            onClick={() => setStatusFilter('No_Trgt_Dt')}
            className={`px-4 py-2 rounded-md text-sm font-medium ${getTabColor('No_Trgt_Dt', summaryStats.noTrgtDt)}`}
          >
            No Trgt Dt: {summaryStats.noTrgtDt}
          </button>
          <button
            onClick={() => setStatusFilter('Cancelled')}
            className={`px-4 py-2 rounded-md text-sm font-medium ${getTabColor('Cancelled', summaryStats.cancelled)}`}
          >
            Cancelled: {summaryStats.cancelled}
          </button>
        </div>
      </div>
      
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-2 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">TASK ID</th>
              <th className="px-2 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">TASK DESCRIPTION</th>
              <th className="px-2 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ISSUE DATE</th>
              <th className="px-2 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">UPDATED AT</th>
              <th className="px-2 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">TARGET DATE</th>
              <th className="px-2 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">DELEGATED BY</th>
              <th className="px-2 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">FINISH DATE</th>
              <th className="px-2 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">TOTAL RESCHEDULE</th>
              <th className="px-2 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">STATUS</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {delegationTasks.map((task) => (
              <tr key={task.taskId} className="hover:bg-gray-50">
                <td className="px-2 py-2 whitespace-nowrap text-sm font-medium text-gray-900">
                  {task.taskId}
                </td>
                <td className="px-2 py-2 text-sm text-gray-900 max-w-xs">
                  <div className="truncate" title={task.description}>
                    {task.description}
                  </div>
                  <button className="text-indigo-600 hover:text-indigo-800 text-xs mt-1">
                    More
                  </button>
                </td>
                <td className="px-2 py-2 whitespace-nowrap text-sm text-gray-900">
                  {task.issueDate}
                </td>
                <td className="px-2 py-2 whitespace-nowrap text-sm text-gray-900">
                  {task.updatedAt}
                </td>
                <td className="px-2 py-2 whitespace-nowrap text-sm text-gray-900">
                  {task.targetDate}
                </td>
                <td className="px-2 py-2 whitespace-nowrap text-sm text-gray-900">
                  {task.delegatedBy}
                </td>
                <td className="px-2 py-2 whitespace-nowrap text-sm text-gray-900">
                  {task.finishDate}
                </td>
                <td className="px-2 py-2 whitespace-nowrap text-sm text-gray-900">
                  {task.totalReschedule}
                </td>
                <td className="px-2 py-2 whitespace-nowrap">
                  <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(task.status)}`}>
                    {task.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default DelegationSection;
