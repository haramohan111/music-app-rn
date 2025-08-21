// App.jsx
import { useState } from 'react';
import '../App.css'; // Assuming you have a CSS file for styles
import Sidebar from './Sidebar';
import { Outlet } from 'react-router-dom';
import { Header } from './Header';

export default function Home() {
  const [isLoggedIn, setIsLoggedIn] = useState(true);
  const [activeMenu, setActiveMenu] = useState('dashboard');



  if (!isLoggedIn) {
    return (
      <div className="login-container">
        <h2>You have been logged out</h2>
        <button onClick={() => setIsLoggedIn(true)}>Login Again</button>
      </div>
    );
  }

  return (
    <div className="admin-dashboard">
      <Sidebar activeMenu={activeMenu} setActiveMenu={setActiveMenu} />

      <div className="main-content">
        <Header />

        <div className="content">
          <Outlet />
        </div>
      </div>
    </div>
  );
}