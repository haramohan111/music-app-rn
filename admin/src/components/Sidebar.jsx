import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

const Sidebar = ({ activeMenu }) => {
  const [hoverEnabled, setHoverEnabled] = useState(true);
  const [menuStates, setMenuStates] = useState({});
  const [settingsOpen, setSettingsOpen] = useState(false);

  // Define your management menus here
  const managementMenus = [
    {
      id: 'user',
      title: 'User Management',
      icon: '👥',
      items: [
        { id: 'add-user', text: 'Add User', icon: '➕', path: '/admin/user/add-user' },
        { id: 'manage-users', text: 'Manage Users', icon: '🛠️', path: '/admin/user/manage-users' }
      ]
    },
    {
      id: 'music',
      title: 'Music Management',
      icon: '🎵',
      items: [
        { id: 'add-music', text: 'Add Music', icon: '➕', path: '/admin/music/add-music' },
        { id: 'only-music', text: 'Only Music', icon: '➕', path: '/admin/music/only-music' },
        { id: 'manage-music', text: 'Manage Music', icon: '🛠️', path: '/admin/music/manage-music' }

      ]
    },
  ];

  // Initialize state from localStorage and menu states
  useEffect(() => {
    const savedHoverState = localStorage.getItem('sidebarHoverEnabled');
    if (savedHoverState !== null) {
      setHoverEnabled(savedHoverState === 'true');
    }

    // Initialize menu states
    const initialMenuStates = {};
    managementMenus.forEach(menu => {
      initialMenuStates[menu.id] = {
        isHovering: false,
        menuOpen: false
      };
    });
    setMenuStates(initialMenuStates);
  }, []);

  const toggleHover = () => {
    const newState = !hoverEnabled;
    setHoverEnabled(newState);
    localStorage.setItem('sidebarHoverEnabled', newState);

    if (!newState) {
      const updatedStates = {};
      Object.keys(menuStates).forEach(menuId => {
        updatedStates[menuId] = { ...menuStates[menuId], menuOpen: false };
      });
      setMenuStates(updatedStates);
    }
    setSettingsOpen(false);
  };

  const handleMenuClick = (menuId) => {
    if (!hoverEnabled) {
      setMenuStates(prev => ({
        ...prev,
        [menuId]: {
          ...prev[menuId],
          menuOpen: !prev[menuId].menuOpen
        }
      }));
    }
  };

  const handleMouseEnter = (menuId) => {
    if (hoverEnabled) {
      setMenuStates(prev => ({
        ...prev,
        [menuId]: {
          ...prev[menuId],
          isHovering: true
        }
      }));
    }
  };

  const handleMouseLeave = (menuId) => {
    if (hoverEnabled) {
      setMenuStates(prev => ({
        ...prev,
        [menuId]: {
          ...prev[menuId],
          isHovering: false
        }
      }));
    }
  };

  const toggleSettings = () => {
    setSettingsOpen(!settingsOpen);
  };

  return (
    <div className={`sidebar ${!hoverEnabled ? 'no-hover' : ''}`}>
      <div className="sidebar-header">
        <h2>Admin Panel</h2>
      </div>
      <nav className="sidebar-menu">
        <Link
          to="/admin/dashboard"
          className={`menu-item ${activeMenu === 'dashboard' ? 'active' : ''}`}
        >
          <span className="icon">📊</span>
          <span className="text">Dashboard</span>
        </Link>

        {/* Dynamic Management Menus */}
        {managementMenus.map(menu => (
          <div
            key={menu.id}
            className="menu-group"
            onMouseEnter={() => handleMouseEnter(menu.id)}
            onMouseLeave={() => handleMouseLeave(menu.id)}
          >
            <div
              className={`menu-item ${(menuStates[menu.id]?.menuOpen || menuStates[menu.id]?.isHovering) ? 'active' : ''
                }`}
              onClick={() => handleMenuClick(menu.id)}
            >
              <span className="icon">{menu.icon}</span>
              <span className="text">{menu.title}</span>
              <span className="arrow">
                {(menuStates[menu.id]?.menuOpen || menuStates[menu.id]?.isHovering) ? '▼' : '▶'}
              </span>
            </div>

            {(menuStates[menu.id]?.menuOpen || (menuStates[menu.id]?.isHovering && hoverEnabled)) && (
              <div className={`sub-menu ${(menuStates[menu.id]?.menuOpen || menuStates[menu.id]?.isHovering) ? 'active' : ''
                }`}>
                {menu.items.map(item => (
                  <Link
                    key={item.id}
                    to={item.path}
                    className="submenu-item"
                  >
                    <span className="icon">{item.icon}</span>
                    <span className="text">{item.text}</span>
                  </Link>
                ))}
              </div>
            )}
          </div>
        ))}

        {/* Settings Menu */}
        <div className="menu-group">
          <div
            className={`menu-item ${settingsOpen ? 'active' : ''}`}
            onClick={toggleSettings}
          >
            <span className="icon">⚙️</span>
            <span className="text">Settings</span>
            <span className="arrow">{settingsOpen ? '▼' : '▶'}</span>
          </div>

          {settingsOpen && (
            <div className="sub-menu">
              <div className="submenu-item" onClick={toggleHover}>
                <span className="icon">{hoverEnabled ? '🔴' : '🟢'}</span>
                <span className="text">
                  {hoverEnabled ? 'Disable Hover' : 'Enable Hover'}
                </span>
              </div>
            </div>
          )}
        </div>
      </nav>
    </div>
  );
};

export default Sidebar;