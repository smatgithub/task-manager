import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import Navbar from './components/Navbar';
import Home from './pages/Home'
import AuthPage from './pages/AuthPage';
import OAuthSuccess from './pages/OAuthSuccess';
import Dashboard from './pages/Dashboard';
import UserTasksBoard from './pages/UserTasksBoard';
import TaskForm from './pages/TaskFormPage'
import UserProfile from './pages/UserProfile';

function App() {
  return (
    <Router>
      <AppContent />
    </Router>
  );
}

function AppContent() {
  // const location = useLocation();

  return (
    <>
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
    </>
  );
}

export default App;
