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
    <div className="bg-gradient-to-r from-slate-800 to-slate-700 rounded-xl shadow-2xl border border-slate-600">
      <div className="px-6 py-4 border-b border-slate-600">
        <h2 className="text-lg font-semibold text-white flex items-center">
          <svg className="w-5 h-5 mr-2 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
          </svg>
          SCORE
        </h2>
      </div>
      
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-slate-700">
            <tr>
              <th className="px-3 py-3 text-left text-xs font-semibold text-slate-300 uppercase tracking-wider">Week</th>
              <th className="px-3 py-3 text-left text-xs font-semibold text-slate-300 uppercase tracking-wider">Daily</th>
              <th className="px-3 py-3 text-left text-xs font-semibold text-slate-300 uppercase tracking-wider">Not Done %</th>
              <th className="px-3 py-3 text-left text-xs font-semibold text-slate-300 uppercase tracking-wider">OTD</th>
              <th className="px-3 py-3 text-left text-xs font-semibold text-slate-300 uppercase tracking-wider">Delg. Target</th>
              <th className="px-3 py-3 text-left text-xs font-semibold text-slate-300 uppercase tracking-wider">Delg. Reschedule</th>
              <th className="px-3 py-3 text-left text-xs font-semibold text-slate-300 uppercase tracking-wider">Delg. Done</th>
              <th className="px-3 py-3 text-left text-xs font-semibold text-slate-300 uppercase tracking-wider">Score</th>
            </tr>
          </thead>
          <tbody className="bg-slate-800 divide-y divide-slate-700">
            {scoreData.map((row, index) => (
              <tr key={index} className="hover:bg-slate-700 transition-colors duration-200">
                <td className="px-3 py-3 whitespace-nowrap text-sm font-bold text-white">
                  {row.week}
                </td>
                <td className="px-3 py-3 whitespace-nowrap text-sm text-slate-200">
                  {row.dailyTaskCnt}
                </td>
                <td className={`px-3 py-3 whitespace-nowrap text-sm font-bold ${getScoreColor(row.notDonePercent)}`}>
                  {row.notDonePercent.toFixed(1)}
                </td>
                <td className="px-3 py-3 whitespace-nowrap text-sm text-slate-200">
                  <div className="space-y-1 text-xs">
                    <div className="text-slate-300">Total: <span className="text-white font-medium">{row.otd.total}</span></div>
                    <div className="text-slate-300">Pending: <span className="text-white font-medium">{row.otd.prevPending}</span></div>
                    <div className={getScoreColor(row.otd.notDoneOnTimePercent)}>
                      OnTime%: {row.otd.notDoneOnTimePercent.toFixed(1)}
                    </div>
                    <div className={getScoreColor(row.otd.notDonePercent)}>
                      Done%: {row.otd.notDonePercent.toFixed(1)}
                    </div>
                  </div>
                </td>
                <td className="px-3 py-3 whitespace-nowrap text-sm text-slate-200">
                  <div className="space-y-1 text-xs">
                    <div className="text-slate-300">Req: <span className="text-white font-medium">{row.delgTargetDate.tdReq}</span></div>
                    <div className={getScoreColor(row.delgTargetDate.tdDelayPercent)}>
                      Delay%: {row.delgTargetDate.tdDelayPercent.toFixed(1)}
                    </div>
                    <div className={getScoreColor(row.delgTargetDate.tdNdPercent)}>
                      ND%: {row.delgTargetDate.tdNdPercent.toFixed(1)}
                    </div>
                  </div>
                </td>
                <td className="px-3 py-3 whitespace-nowrap text-sm text-slate-200">
                  <div className="space-y-1 text-xs">
                    <div className="text-slate-300">Req: <span className="text-white font-medium">{row.delgReschedule.rdReq}</span></div>
                    <div className={getScoreColor(row.delgReschedule.rdNdPercent)}>
                      ND%: {row.delgReschedule.rdNdPercent.toFixed(1)}
                    </div>
                  </div>
                </td>
                <td className="px-3 py-3 whitespace-nowrap text-sm text-slate-200">
                  <div className="space-y-1 text-xs">
                    <div className="text-slate-300">Req: <span className="text-white font-medium">{row.delgDone.wcReq}</span></div>
                    <div className="text-slate-300">ND: <span className="text-white font-medium">{row.delgDone.notDone}</span></div>
                    <div className={getScoreColor(row.delgDone.wcNdPercent)}>
                      ND%: {row.delgDone.wcNdPercent.toFixed(1)}
                    </div>
                  </div>
                </td>
                <td className="px-3 py-3 whitespace-nowrap text-sm text-slate-200">
                  <div className="space-y-1 text-xs">
                    <div className={`font-bold ${getScoreColor(row.score.notDonePercent)}`}>
                      Done%: {row.score.notDonePercent.toFixed(1)}
                    </div>
                    <div className={`font-bold ${getScoreColor(row.score.notDoneOntimePercent)}`}>
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
