import { useState } from 'react';
import Home from "./pages/Home";
import Login from "./pages/login";

function App() {
  const [currentPage] = useState(window.location.pathname === '/login' ? 'login' : 'home');

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