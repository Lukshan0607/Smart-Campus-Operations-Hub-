import { useState, useEffect } from 'react';
import Home from "./pages/Home";
import Login from "./pages/login";
import Signup from "./pages/signup";
import OAuthSuccess from "./pages/oauth-success";

function App() {
  const [currentPage, setCurrentPage] = useState('home');

  useEffect(() => {
    // Get current page from URL path
    const path = window.location.pathname;
    if (path === '/login') {
      setCurrentPage('login');
    } else if (path === '/signup') {
      setCurrentPage('signup');
    } else if (path === '/oauth-success') {
      setCurrentPage('oauth-success');
    } else {
      setCurrentPage('home');
    }
  }, []);

  const renderPage = () => {
    switch(currentPage) {
      case 'home':
        return <Home />;
      case 'login':
        return <Login />;
      case 'signup':
        return <Signup />;
      case 'oauth-success':
        return <OAuthSuccess />;
      default:
        return <Home />;
    }
  };

  return renderPage();
}

export default App;