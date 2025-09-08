import { BrowserRouter as Router, Routes, Route} from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import Navbar from './components/Navbar';
import ChatWindow from './components/ChatWindow';
import Home from './pages/Home'
import AuthPage from './pages/AuthPage';
import OAuthSuccess from './pages/OAuthSuccess';
import Dashboard from './pages/Dashboard';
import UserTasksBoard from './pages/UserTasksBoard';
import TaskForm from './pages/TaskFormPage'
import UserProfile from './pages/UserProfile';
import UserManagement from './pages/UserManagement';
import RegisterPage from './pages/RegisterPage';

function App() {
  return (
    <AuthProvider>
      <Router>
        <AppContent />
      </Router>
    </AuthProvider>
  );
}

function AppContent() {
  // const location = useLocation();

  return (
    <>
      <Navbar />
      <ChatWindow />
      <div className="pt-16">
        <Routes>
          <Route path='/' element={<Home />} />
          <Route path="/auth" element={<AuthPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/oauth-success" element={<OAuthSuccess />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/UserTasksBoard" element={<UserTasksBoard />} />
          <Route path="/tasksForm" element={<TaskForm />} />
          <Route path="/profile" element={<UserProfile />} />
          <Route path="/users" element={<UserManagement />} />
        </Routes>
      </div>
    </>
  );
}

export default App;
