import { BrowserRouter as Router, Routes, Route} from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { SettingsProvider } from './contexts/SettingsContext';
import usePageTitle from './hooks/usePageTitle';
import Navbar from './components/Navbar';
import EnhancedChatWindow from './components/chat/EnhancedChatWindow';
import ProtectedRoute from './components/ProtectedRoute';
import Home from './pages/Home'
import AuthPage from './pages/AuthPage';
import OAuthSuccess from './pages/OAuthSuccess';
import Dashboard from './pages/Dashboard';
import UserTasksBoard from './pages/UserTasksBoard';
import TaskForm from './pages/TaskFormPage'
import UserProfile from './pages/UserProfile';
import UserManagement from './pages/UserManagement';
import RegisterPage from './pages/RegisterPage';
import AdminTaskReview from './pages/AdminTaskReview';
import UserSettings from './pages/UserSettings';
import ApplicationSettings from './pages/ApplicationSettings';
import UserAccessControl from './pages/UserAccessControl';

function App() {
  return (
    <AuthProvider>
      <SettingsProvider>
        <Router>
          <AppContent />
        </Router>
      </SettingsProvider>
    </AuthProvider>
  );
}

function AppContent() {
  // Set dynamic page title
  usePageTitle();

  return (
    <>
      <Navbar />
      <EnhancedChatWindow />
      <div className="pt-16">
        <Routes>
          <Route path='/' element={<Home />} />
          <Route path="/auth" element={<AuthPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/oauth-success" element={<OAuthSuccess />} />
          <Route path="/dashboard" element={
            <ProtectedRoute requiredPage="dashboard">
              <Dashboard />
            </ProtectedRoute>
          } />
          <Route path="/UserTasksBoard" element={
            <ProtectedRoute requiredPage="taskBoard">
              <UserTasksBoard />
            </ProtectedRoute>
          } />
          <Route path="/tasksForm" element={
            <ProtectedRoute requiredPage="taskCreation">
              <TaskForm />
            </ProtectedRoute>
          } />
          <Route path="/profile" element={
            <ProtectedRoute requiredPage="profile">
              <UserProfile />
            </ProtectedRoute>
          } />
          <Route path="/users" element={
            <ProtectedRoute requiredRole="admin">
              <UserManagement />
            </ProtectedRoute>
          } />
          <Route path="/admin" element={
            <ProtectedRoute requiredPage="adminTaskReview">
              <AdminTaskReview />
            </ProtectedRoute>
          } />
          <Route path="/settings" element={
            <ProtectedRoute>
              <UserSettings />
            </ProtectedRoute>
          } />
          <Route path="/application-settings" element={
            <ProtectedRoute requiredRole="admin">
              <ApplicationSettings />
            </ProtectedRoute>
          } />
          <Route path="/user-access-control" element={
            <ProtectedRoute requiredPage="userAccessControl">
              <UserAccessControl />
            </ProtectedRoute>
          } />
        </Routes>
      </div>
    </>
  );
}

export default App;
