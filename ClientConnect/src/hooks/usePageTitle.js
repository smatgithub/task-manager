import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

const usePageTitle = () => {
  const location = useLocation();

  useEffect(() => {
    const getPageName = (pathname) => {
      // Remove leading slash and split by '/'
      const path = pathname.replace(/^\//, '');
      
      // Handle specific routes
      const routeMap = {
        '': 'Home',
        'auth': 'Login',
        'login': 'Login',
        'register': 'Register',
        'dashboard': 'Dashboard',
        'tasksForm': 'TaskMaster',
        'UserTasksBoard': 'TaskBoard',
        'profile': 'Profile',
        'settings': 'Settings',
        'admin': 'Admin',
        'users': 'UserManagement',
        'application-settings': 'AppSettings',
        'user-access-control': 'AccessControl',
        'oauth-success': 'OAuthSuccess'
      };

      // Check for exact match first
      if (routeMap[path]) {
        return routeMap[path];
      }

      // Check for partial matches (for nested routes)
      for (const [route, name] of Object.entries(routeMap)) {
        if (path.startsWith(route) && route !== '') {
          return name;
        }
      }

      // Default fallback - capitalize first letter of path
      return path.charAt(0).toUpperCase() + path.slice(1).replace(/-/g, ' ');
    };

    const pageName = getPageName(location.pathname);
    const title = `e.${pageName}`;
    
    document.title = title;
  }, [location.pathname]);
};

export default usePageTitle;
