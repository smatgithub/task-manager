import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const OAuthSuccess = () => {
  const navigate = useNavigate();
  const { login } = useAuth();

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const token = params.get('token');
    const name = params.get('name');
    const email = params.get('email');
    const id = params.get('id');

    if (token && name && email) {
      // Decode JWT token to get user role and other data
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        const user = { 
          name, 
          email,
          role: payload.role || 'user',
          empId: payload.empId || null,
          id: payload.id || id
        };
        
        login(user, token); // Use context login method
        console.log('User and token saved via context:', user);

        navigate('/dashboard'); // ✅ Redirect after setting
      } catch (error) {
        console.error('Error decoding JWT token:', error);
        // Fallback to basic user data
        const user = { name, email, role: 'user' };
        login(user, token);
        navigate('/dashboard');
      }
    } else {
      console.warn('Missing token or user info in query parameters');
      navigate('/auth'); // fallback
    }
  }, [navigate, login]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <p className="text-lg text-gray-600">Signing you in...</p>
    </div>
  );
};

export default OAuthSuccess;