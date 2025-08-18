import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const OAuthSuccess = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const token = params.get('token');
    const name = params.get('name');
    const email = params.get('email');

    if (token && name && email) {
      const user = { name, email };
      localStorage.setItem('user', JSON.stringify(user));
      localStorage.setItem('token', token);
      console.log('User and token saved to localStorage:', user);

      navigate('/dashboard'); // ✅ Redirect after setting
    } else {
      console.warn('Missing token or user info in query parameters');
      navigate('/auth'); // fallback
    }
  }, [navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <p className="text-lg text-gray-600">Signing you in...</p>
    </div>
  );
};

export default OAuthSuccess;