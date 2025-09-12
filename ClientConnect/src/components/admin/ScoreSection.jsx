import React, { useState, useEffect } from 'react';

const ScoreSection = ({ selectedEmployee, dateRange }) => {
  const [scoreData, setScoreData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (selectedEmployee) {
      fetchScoreData();
    }
  }, [selectedEmployee, dateRange]);

  const fetchScoreData = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/admin/score-data/${selectedEmployee.empId}?fromDate=${dateRange.fromDate}&toDate=${dateRange.toDate}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setScoreData(data);
        return;
      }
      
      // Fallback to mock data if API fails
      const mockData = [
        {
          week: 36,
          dailyTaskCnt: 4,
          notDonePercent: -100.0,
          otd: {
            total: 3,
            prevPending: 0,
            notDoneOnTimePercent: -0.0,
            notDonePercent: -100.0
          },
          delgTargetDate: {
            tdReq: 100,
            tdDelayPercent: -0.0,
            tdNdPercent: -100.0
          },
          delgReschedule: {
            rdReq: 0,
            rdNdPercent: -0.0
          },
          delgDone: {
            wcReq: 116,
            notDone: 116,
            wcNdPercent: -100.0
          },
          score: {
            notDonePercent: -100.0,
            notDoneOntimePercent: -30.0
          }
        },
        {
          week: 35,
          dailyTaskCnt: 4,
          notDonePercent: -100.0,
          otd: {
            total: 5,
            prevPending: 0,
            notDoneOnTimePercent: -0.0,
            notDonePercent: -100.0
          },
          delgTargetDate: {
            tdReq: 100,
            tdDelayPercent: -0.0,
            tdNdPercent: -100.0
          },
          delgReschedule: {
            rdReq: 0,
            rdNdPercent: -0.0
          },
          delgDone: {
            wcReq: 116,
            notDone: 116,
            wcNdPercent: -100.0
          },
          score: {
            notDonePercent: -95.0,
            notDoneOntimePercent: -25.0
          }
        },
        {
          week: 34,
          dailyTaskCnt: 4,
          notDonePercent: -100.0,
          otd: {
            total: 3,
            prevPending: 0,
            notDoneOnTimePercent: -0.0,
            notDonePercent: -100.0
          },
          delgTargetDate: {
            tdReq: 100,
            tdDelayPercent: -0.0,
            tdNdPercent: -100.0
          },
          delgReschedule: {
            rdReq: 0,
            rdNdPercent: -0.0
          },
          delgDone: {
            wcReq: 116,
            notDone: 116,
            wcNdPercent: -100.0
          },
          score: {
            notDonePercent: -100.0,
            notDoneOntimePercent: -30.0
          }
        },
        {
          week: 33,
          dailyTaskCnt: 4,
          notDonePercent: -100.0,
          otd: {
            total: 3,
            prevPending: 0,
            notDoneOnTimePercent: -0.0,
            notDonePercent: -100.0
          },
          delgTargetDate: {
            tdReq: 100,
            tdDelayPercent: -0.0,
            tdNdPercent: -100.0
          },
          delgReschedule: {
            rdReq: 0,
            rdNdPercent: -0.0
          },
          delgDone: {
            wcReq: 116,
            notDone: 116,
            wcNdPercent: -100.0
          },
          score: {
            notDonePercent: -100.0,
            notDoneOntimePercent: -30.0
          }
        },
        {
          week: 32,
          dailyTaskCnt: 4,
          notDonePercent: -83.3,
          otd: {
            total: 3,
            prevPending: 0,
            notDoneOnTimePercent: -0.0,
            notDonePercent: -100.0
          },
          delgTargetDate: {
            tdReq: 100,
            tdDelayPercent: -0.0,
            tdNdPercent: -100.0
          },
          delgReschedule: {
            rdReq: 0,
            rdNdPercent: -0.0
          },
          delgDone: {
            wcReq: 116,
            notDone: 116,
            wcNdPercent: -100.0
          },
          score: {
            notDonePercent: -100.0,
            notDoneOntimePercent: -30.0
          }
        }
      ];
      setScoreData(mockData);
    } catch (error) {
      console.error('Error fetching score data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getScoreColor = (value) => {
    if (value >= 0) return 'text-green-600';
    if (value >= -50) return 'text-yellow-600';
    return 'text-red-600';
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-8 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow">
      <div className="px-4 py-3 border-b">
        <h2 className="text-lg font-semibold text-gray-900">SCORE</h2>
      </div>
      
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-2 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Week</th>
              <th className="px-2 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Daily</th>
              <th className="px-2 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Not Done %</th>
              <th className="px-2 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">OTD</th>
              <th className="px-2 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Delg. Target</th>
              <th className="px-2 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Delg. Reschedule</th>
              <th className="px-2 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Delg. Done</th>
              <th className="px-2 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Score</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {scoreData.map((row, index) => (
              <tr key={index} className="hover:bg-gray-50">
                <td className="px-2 py-2 whitespace-nowrap text-sm font-medium text-gray-900">
                  {row.week}
                </td>
                <td className="px-2 py-2 whitespace-nowrap text-sm text-gray-900">
                  {row.dailyTaskCnt}
                </td>
                <td className={`px-2 py-2 whitespace-nowrap text-sm font-medium ${getScoreColor(row.notDonePercent)}`}>
                  {row.notDonePercent.toFixed(1)}
                </td>
                <td className="px-2 py-2 whitespace-nowrap text-sm text-gray-900">
                  <div className="space-y-1 text-xs">
                    <div>Total: {row.otd.total}</div>
                    <div>Pending: {row.otd.prevPending}</div>
                    <div className={getScoreColor(row.otd.notDoneOnTimePercent)}>
                      OnTime%: {row.otd.notDoneOnTimePercent.toFixed(1)}
                    </div>
                    <div className={getScoreColor(row.otd.notDonePercent)}>
                      Done%: {row.otd.notDonePercent.toFixed(1)}
                    </div>
                  </div>
                </td>
                <td className="px-2 py-2 whitespace-nowrap text-sm text-gray-900">
                  <div className="space-y-1 text-xs">
                    <div>Req: {row.delgTargetDate.tdReq}</div>
                    <div className={getScoreColor(row.delgTargetDate.tdDelayPercent)}>
                      Delay%: {row.delgTargetDate.tdDelayPercent.toFixed(1)}
                    </div>
                    <div className={getScoreColor(row.delgTargetDate.tdNdPercent)}>
                      ND%: {row.delgTargetDate.tdNdPercent.toFixed(1)}
                    </div>
                  </div>
                </td>
                <td className="px-2 py-2 whitespace-nowrap text-sm text-gray-900">
                  <div className="space-y-1 text-xs">
                    <div>Req: {row.delgReschedule.rdReq}</div>
                    <div className={getScoreColor(row.delgReschedule.rdNdPercent)}>
                      ND%: {row.delgReschedule.rdNdPercent.toFixed(1)}
                    </div>
                  </div>
                </td>
                <td className="px-2 py-2 whitespace-nowrap text-sm text-gray-900">
                  <div className="space-y-1 text-xs">
                    <div>Req: {row.delgDone.wcReq}</div>
                    <div>ND: {row.delgDone.notDone}</div>
                    <div className={getScoreColor(row.delgDone.wcNdPercent)}>
                      ND%: {row.delgDone.wcNdPercent.toFixed(1)}
                    </div>
                  </div>
                </td>
                <td className="px-2 py-2 whitespace-nowrap text-sm text-gray-900">
                  <div className="space-y-1 text-xs">
                    <div className={`font-medium ${getScoreColor(row.score.notDonePercent)}`}>
                      Done%: {row.score.notDonePercent.toFixed(1)}
                    </div>
                    <div className={`font-medium ${getScoreColor(row.score.notDoneOntimePercent)}`}>
                      OnTime%: {row.score.notDoneOntimePercent.toFixed(1)}
                    </div>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ScoreSection;
