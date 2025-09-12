const User = require('../models/User');
const TaskMaster = require('../models/TaskMaster');
const TaskUpdate = require('../models/TaskUpdate');

// Get all employees for admin dashboard
const getEmployees = async (req, res) => {
  try {
    const employees = await User.find({}, 'name email empId role department createdAt')
      .sort({ name: 1 });
    
    res.json(employees);
  } catch (error) {
    console.error('Error fetching employees:', error);
    res.status(500).json({ error: 'Failed to fetch employees' });
  }
};

// Get performance metrics for selected employee
const getPerformanceMetrics = async (req, res) => {
  try {
    const { empId } = req.params;
    const { fromDate, toDate } = req.query;

    // Calculate performance metrics based on task completion
    const startDate = new Date(fromDate);
    const endDate = new Date(toDate);

    // Get all tasks assigned to this employee
    const tasks = await TaskMaster.find({
      'assignees.empId': parseInt(empId),
      createdAt: { $gte: startDate, $lte: endDate }
    }).populate('taskUpdates');

    // Calculate metrics
    const totalTasks = tasks.length;
    const completedTasks = tasks.filter(task => task.status === 'done').length;
    const onTimeTasks = tasks.filter(task => {
      if (task.status === 'done' && task.endDate) {
        return new Date(task.endDate) >= new Date();
      }
      return false;
    }).length;

    const notDoneScore = totalTasks > 0 ? ((totalTasks - completedTasks) / totalTasks) * 100 : 0;
    const notDoneOnTimeScore = completedTasks > 0 ? ((completedTasks - onTimeTasks) / completedTasks) * 100 : 0;

    // Calculate current week number
    const now = new Date();
    const startOfYear = new Date(now.getFullYear(), 0, 1);
    const weekNumber = Math.ceil((now - startOfYear) / (7 * 24 * 60 * 60 * 1000));

    res.json({
      notDoneScore: Math.round(notDoneScore * 10) / 10,
      notDoneOnTimeScore: Math.round(notDoneOnTimeScore * 10) / 10,
      week: weekNumber,
      totalTasks,
      completedTasks,
      onTimeTasks
    });
  } catch (error) {
    console.error('Error fetching performance metrics:', error);
    res.status(500).json({ error: 'Failed to fetch performance metrics' });
  }
};

// Get weekly score data for selected employee
const getScoreData = async (req, res) => {
  try {
    const { empId } = req.params;
    const { fromDate, toDate } = req.query;

    const startDate = new Date(fromDate);
    const endDate = new Date(toDate);

    // Generate weekly data for the date range
    const weeks = [];
    const currentDate = new Date(startDate);
    
    while (currentDate <= endDate) {
      const weekStart = new Date(currentDate);
      const weekEnd = new Date(currentDate);
      weekEnd.setDate(weekEnd.getDate() + 6);

      // Get tasks for this week
      const weekTasks = await TaskMaster.find({
        'assignees.empId': parseInt(empId),
        createdAt: { $gte: weekStart, $lte: weekEnd }
      });

      const dailyTasks = weekTasks.filter(task => task.taskType === 'daily');
      const otdTasks = weekTasks.filter(task => task.taskType === 'otd');
      const delegationTasks = weekTasks.filter(task => task.taskType === 'adhoc');

      const completedTasks = weekTasks.filter(task => task.status === 'done');
      const onTimeTasks = completedTasks.filter(task => {
        if (task.endDate) {
          return new Date(task.endDate) >= new Date();
        }
        return false;
      });

      const weekNumber = Math.ceil((weekStart - new Date(weekStart.getFullYear(), 0, 1)) / (7 * 24 * 60 * 60 * 1000));

      weeks.push({
        week: weekNumber,
        dailyTaskCnt: dailyTasks.length,
        notDonePercent: dailyTasks.length > 0 ? 
          ((dailyTasks.length - dailyTasks.filter(t => t.status === 'done').length) / dailyTasks.length) * -100 : 0,
        otd: {
          total: otdTasks.length,
          prevPending: 0, // This would need more complex logic
          notDoneOnTimePercent: otdTasks.length > 0 ? 
            ((otdTasks.length - onTimeTasks.length) / otdTasks.length) * -100 : 0,
          notDonePercent: otdTasks.length > 0 ? 
            ((otdTasks.length - otdTasks.filter(t => t.status === 'done').length) / otdTasks.length) * -100 : 0
        },
        delgTargetDate: {
          tdReq: delegationTasks.length,
          tdDelayPercent: 0, // This would need more complex logic
          tdNdPercent: delegationTasks.length > 0 ? 
            ((delegationTasks.length - delegationTasks.filter(t => t.status === 'done').length) / delegationTasks.length) * -100 : 0
        },
        delgReschedule: {
          rdReq: 0, // This would need more complex logic
          rdNdPercent: 0
        },
        delgDone: {
          wcReq: delegationTasks.length,
          notDone: delegationTasks.filter(t => t.status !== 'done').length,
          wcNdPercent: delegationTasks.length > 0 ? 
            ((delegationTasks.length - delegationTasks.filter(t => t.status === 'done').length) / delegationTasks.length) * -100 : 0
        },
        score: {
          notDonePercent: weekTasks.length > 0 ? 
            ((weekTasks.length - completedTasks.length) / weekTasks.length) * -100 : 0,
          notDoneOntimePercent: completedTasks.length > 0 ? 
            ((completedTasks.length - onTimeTasks.length) / completedTasks.length) * -100 : 0
        }
      });

      currentDate.setDate(currentDate.getDate() + 7);
    }

    res.json(weeks);
  } catch (error) {
    console.error('Error fetching score data:', error);
    res.status(500).json({ error: 'Failed to fetch score data' });
  }
};

// Get daily tasks for selected employee
const getDailyTasks = async (req, res) => {
  try {
    const { empId } = req.params;
    const { fromDate, toDate } = req.query;

    const startDate = new Date(fromDate);
    const endDate = new Date(toDate);

    const dailyTasks = await TaskMaster.find({
      'assignees.empId': parseInt(empId),
      taskType: 'daily',
      createdAt: { $gte: startDate, $lte: endDate }
    }).sort({ createdAt: -1 });

    const formattedTasks = dailyTasks.map(task => ({
      id: task._id,
      task: task.description,
      endDate: task.endDate ? new Date(task.endDate).toLocaleDateString('en-GB') : 'N',
      status: task.status
    }));

    res.json(formattedTasks);
  } catch (error) {
    console.error('Error fetching daily tasks:', error);
    res.status(500).json({ error: 'Failed to fetch daily tasks' });
  }
};

// Get OTD tasks for selected employee
const getOtdTasks = async (req, res) => {
  try {
    const { empId } = req.params;
    const { fromDate, toDate } = req.query;

    const startDate = new Date(fromDate);
    const endDate = new Date(toDate);

    const otdTasks = await TaskMaster.find({
      'assignees.empId': parseInt(empId),
      taskType: 'otd',
      createdAt: { $gte: startDate, $lte: endDate }
    }).sort({ createdAt: -1 });

    const formattedTasks = otdTasks.map(task => ({
      id: task._id,
      task: task.description,
      freq: 'W-Sat', // This would need to be stored in the task model
      endDate: task.endDate ? new Date(task.endDate).toISOString().split('T')[0] : 'N',
      status: task.status
    }));

    res.json(formattedTasks);
  } catch (error) {
    console.error('Error fetching OTD tasks:', error);
    res.status(500).json({ error: 'Failed to fetch OTD tasks' });
  }
};

// Get delegation tasks for selected employee
const getDelegationTasks = async (req, res) => {
  try {
    const { empId } = req.params;
    const { fromDate, toDate, status } = req.query;

    const startDate = new Date(fromDate);
    const endDate = new Date(toDate);

    let query = {
      'assignees.empId': parseInt(empId),
      taskType: 'adhoc',
      createdAt: { $gte: startDate, $lte: endDate }
    };

    if (status && status !== 'All') {
      query.status = status.toLowerCase();
    }

    const delegationTasks = await TaskMaster.find(query)
      .populate('createdById', 'name')
      .sort({ createdAt: -1 });

    const formattedTasks = delegationTasks.map(task => ({
      taskId: task._id,
      description: task.description,
      issueDate: new Date(task.createdAt).toLocaleDateString('en-GB'),
      updatedAt: new Date(task.updatedAt).toLocaleDateString('en-GB'),
      targetDate: task.endDate ? new Date(task.endDate).toLocaleDateString('en-GB') : 'N',
      delegatedBy: task.createdById?.name || 'Unknown',
      finishDate: task.status === 'done' ? new Date(task.updatedAt).toLocaleDateString('en-GB') : '',
      totalReschedule: '0', // This would need more complex logic
      status: task.status === 'done' ? 'Done' : 
              task.status === 'overdue' ? 'Overdue' : 
              task.status === 'cancelled' ? 'Cancelled' : 'No_Trgt_Dt'
    }));

    // Calculate summary stats
    const allTasks = await TaskMaster.find({
      'assignees.empId': parseInt(empId),
      taskType: 'adhoc',
      createdAt: { $gte: startDate, $lte: endDate }
    });

    const summaryStats = {
      all: allTasks.length,
      done: allTasks.filter(t => t.status === 'done').length,
      pending: allTasks.filter(t => t.status === 'open' || t.status === 'in-progress').length,
      overdue: allTasks.filter(t => t.status === 'stuck').length,
      noTrgtDt: allTasks.filter(t => !t.endDate).length,
      cancelled: allTasks.filter(t => t.status === 'archived').length
    };

    res.json({
      tasks: formattedTasks,
      summaryStats
    });
  } catch (error) {
    console.error('Error fetching delegation tasks:', error);
    res.status(500).json({ error: 'Failed to fetch delegation tasks' });
  }
};

module.exports = {
  getEmployees,
  getPerformanceMetrics,
  getScoreData,
  getDailyTasks,
  getOtdTasks,
  getDelegationTasks
};
