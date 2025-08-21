import React, { useState } from 'react';
import '../styles/Header.css'; // Create this CSS file
import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { logoutUser } from '../redux/features/auth/authSlice'; // Adjust the import path as necessary

export const Header = () => {
    const [hoveredUserMenu, setHoveredUserMenu] = useState(false);
  const dispatch = useDispatch();
  const navigate = useNavigate();
const handleLogout = async () => {
    try {
      // Optional: Call API logout first
      // await axios.post('/logout', {}, { withCredentials: true });
      
      dispatch(logoutUser()).unwrap();
      navigate('/');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };


    return (
        <header className="topbar">
            <div className="topbar-content">
                {/* Left side content (logo or app name) can go here */}
                <div className="app-name">Admin Panel</div>
                
                {/* Right-aligned user area */}
                <div 
                    className="user-area"
                    onMouseEnter={() => setHoveredUserMenu(true)}
                    onMouseLeave={() => setHoveredUserMenu(false)}
                >
                    <div className="user-info">
                        <span className="user-name">Admin User</span>
                        <div className="user-avatar">👤</div>
                    </div>

                    {hoveredUserMenu && (
                        <div className="user-dropdown">
                            <div className="dropdown-header">Admin Actions</div>
                            <button onClick={() => console.log('Add User clicked')}>
                                <span className="icon">➕</span> Add User
                            </button>
                            <button onClick={() => console.log('Manage Users clicked')}>
                                <span className="icon">🛠️</span> Manage Users
                            </button>
                            <div className="dropdown-divider"></div>
                            <button onClick={handleLogout} className="logout-btn">
                                <span className="icon">🚪</span> Logout
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </header>
    );
};