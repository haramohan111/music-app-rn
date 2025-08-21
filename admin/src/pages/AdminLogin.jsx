// src/components/AdminLogin.jsx
import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { loginAdmin, verifyUser } from '../redux/features/auth/authSlice'; // Adjust the import path as necessary
import { useNavigate } from 'react-router-dom';
import '../styles/AdminLogin.css'; // Import your CSS file for styling

const AdminLogin = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { admin, status, error } = useSelector((state) => state.auth);


    // Auto-verify on idle
    useEffect(() => {
      if (status === 'idle' ) {
        console.log("Dispatching verifyUser action");
        dispatch(verifyUser());
      }
    }, [status, dispatch]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
   await dispatch(loginAdmin({ email, password })).unwrap();

    } catch (err) {
      // Error is already handled by the authSlice/reducer
      console.error('Login failed:', err);
    }
  };

  useEffect(() => {
    // Redirect to dashboard if already logged in
    if (admin && admin._id) {
      navigate('/admin/dashboard');
    }
  }, [admin, navigate]);

  return (
    <div className="admin-login-container">
      <div className="login-card">
        <h2>Admin Login</h2>
        
        {error && (
          <div className="error-message">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder='Enter your email'
              required
              autoFocus
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder='Enter your password'
              required
            />
          </div>

          <button
            type="submit"
            className="login-btn"
            disabled={status === 'loading'}
          >
            {status === 'loading' ? 'Logging in...' : 'Login'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default AdminLogin;