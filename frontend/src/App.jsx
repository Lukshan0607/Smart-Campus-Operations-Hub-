import { useState, useEffect } from 'react';
import Home from "./pages/Home";
import Login from "./pages/login";

function App() {
  const [currentPage, setCurrentPage] = useState('home');

  useEffect(() => {
    // Get current page from URL path
    const path = window.location.pathname;
    if (path === '/login') {
      setCurrentPage('login');
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
      default:
        return <Home />;
    }
  };

  return renderPage();
}

export default App;