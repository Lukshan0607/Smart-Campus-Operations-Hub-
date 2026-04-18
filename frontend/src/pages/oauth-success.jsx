import React, { useEffect } from 'react';

export default function OAuthSuccessPage() {
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const token = urlParams.get('token');
    const user = urlParams.get('user');

    if (token && user) {
      try {
        // Store token and user data in localStorage
        localStorage.setItem('sc_token', token);
        localStorage.setItem('sc_user', user);
        
        // Redirect to home page
        window.location.href = '/';
      } catch (error) {
        console.error('Error storing OAuth data:', error);
        window.location.href = '/login?error=auth_failed';
      }
    } else {
      // Missing token or user data, redirect to login with error
      window.location.href = '/login?error=missing_data';
    }
  }, []);

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <p className="text-gray-600">Completing sign in...</p>
      </div>
    </div>
  );
}
