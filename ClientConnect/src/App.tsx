import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Home from './pages/Home'
import AuthPage from './pages/AuthPage';
import OAuthSuccess from './pages/OAuthSuccess';
import Dashboard from './pages/Dashboard'; // or your landing page after login
import UserTasksBoard from './pages/UserTasksBoard';
import TaskForm from './pages/TaskFormPage'
import UserProfile from './pages/UserProfile';
// import UserTasksBoard from './pages/UserTasksBoard';

function App() {
  return (
    <Router>
      <Navbar />
      <div className="pt-16">
        <Routes>
          <Route path='/' element={<Home />} />
          <Route path="/auth" element={<AuthPage />} />
          <Route path="/oauth-success" element={<OAuthSuccess />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/UserTasksBoard" element={<UserTasksBoard />} />
          <Route path="/tasksForm" element={<TaskForm />} />
          <Route path="/profile" element={<UserProfile />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
