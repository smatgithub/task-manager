import React from 'react';
import TaskBoard from '../components/taskboard/TaskBoard';

export default function UserTasksBoard() {
  const user = JSON.parse(localStorage.getItem('user') || 'null');
  const empId = user?.empId || 101; // enforce your real guard later
  return <TaskBoard empId={empId} />;
}