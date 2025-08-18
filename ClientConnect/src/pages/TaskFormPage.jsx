import React from 'react';
import TaskFormComponent from '../components/TaskFormComponent';

const TaskFormPage = () => {
  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-4">Create New Task</h2>
      <TaskFormComponent />
    </div>
  );
};

export default TaskFormPage;