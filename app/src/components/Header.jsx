import { FaMusic } from 'react-icons/fa';
import { useEffect, useState } from 'react';
import LoginModal from '../components/Login';
import SignupModal from '../components/SignUp';
import '../styles/LoginSign-btn.css'
import { useDispatch, useSelector } from 'react-redux';
import Cookies from 'js-cookie';
import { loginUser, logoutUser } from '../redux/features/auth/authSlice';
import { Link } from 'react-router-dom';
import '../styles/MobileHeader.css'


export default function Header() {

  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userName, setUserName] = useState(null);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showSignModal, setShowSignModal] = useState(false);
  const dispatch = useDispatch();
  const { user, status, error } = useSelector((state) => state.auth);


  // Check auth state on component mount
  useEffect(() => {
    // Check if user is logged in
      // const token = Cookies.get('accessToken');
      if (user?._id) {
        setIsLoggedIn(true);
        setUserName(user?.name);
       
      }else{
        setIsLoggedIn(false);
        setUserName(null);
      }
    
  }, [status,user]);

  const handleLogout = () => {

    setIsLoggedIn(false);
    setUserName(null);
     dispatch(logoutUser());
  };

  const handleLoginSuccess = () => {
    setIsLoggedIn(true);
    const userData = localStorage.getItem('musicStreamUser');
    setUser(JSON.parse(userData));
  };

  const handleSignSuccess = () => {
    setIsLoggedIn(true);
    const userData = localStorage.getItem('musicStreamUser');
    setUser(JSON.parse(userData));
  };

  return (
    <>
    <header className="header">
      <Link to="/" >
      <div className="logo">
        <FaMusic className="logo-icon" />
        <h1>MusicStream</h1>
      </div>
      </Link>

      <div className="search-bar">
        <input type="text" placeholder="Search for songs, artists, or albums" />
      </div>

      <div className="user-actions">
        <Link to="/premium">Premium</Link>
        <Link to="/support">Support</Link>
        <Link to="/aboutus">About Us</Link>
                { !isLoggedIn && (<>
        <span>|</span>

        <a href="#" onClick={() => setShowSignModal(true)} >Sign Up</a>
        </>
        ) }
      </div>

      <div >
        {isLoggedIn ? (
          <>
            <span>Welcome, {userName}</span>
            <button onClick={handleLogout} className="logout-btn">Log out</button>
          </>
        ) : (
          <>
            <button onClick={() => setShowLoginModal(true)} className="login-btn">Log in</button>
          </>
        )}
      </div>


      {showSignModal && (
        <SignupModal
          onClose={() => setShowSignModal(false)}
          onLoginSuccess={handleSignSuccess}
        />
      )}


    </header>

      {showLoginModal && (
        <LoginModal
          onClose={() => setShowLoginModal(false)}
          onLoginSuccess={handleLoginSuccess}
        />
      )}
    </>
  );
}