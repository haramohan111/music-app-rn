import { useEffect, useState } from 'react';
import { FaSpotify, FaGoogle, FaFacebook, FaApple, FaTimes } from 'react-icons/fa';
import '../styles/LoginModel.css'; 
import { useDispatch, useSelector } from 'react-redux';
import { loginUser } from '../redux/features/auth/authSlice';
import { toast } from 'react-toastify';

const LoginModal = ({ onClose }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const dispatch = useDispatch();
  const { status, error } = useSelector((state) => state.auth);

console.log('LoginModal rendered with status:', status, 'and error:', error);

  useEffect(() => {
    if (status === 'succeeded') {
      onClose();
      setEmail('');
      setPassword('');
      toast.success('Login successful!');
    } else if (status === 'failed') {
      console.error('Login failed:', error);
      // toast.error(error);
    }else if (status === 'loading') {
      // toast.info('Logging in...');
    }
  }, [status, error, onClose]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await dispatch(loginUser({ email, password })).unwrap();
    } catch (err) {
      console.error('Login failed:', err);
    }
  };


  return (
    <>
    <div className="login-modal-overlay">
      <div className="login-modal-container">
        <button className="login-modal-close" onClick={onClose}>
          <FaTimes />
        </button>
        
        <div className="login-modal-header">
          <h2 className="login-modal-title">Welcome back</h2>
          <p className="login-modal-subtitle">Log in to continue to your music.</p>
        </div>
        

          {/* {error && <div className="login-error">{error}</div>} */}


        <form className="login-modal-form" onSubmit={handleSubmit}>
          <div className="login-form-group">
            <label htmlFor="email" className="login-form-label">Email address</label>
            <input
              type="email"
              id="email"
              className="login-form-input"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          
          <div className="login-form-group">
            <label htmlFor="password" className="login-form-label">Password</label>
            <input
              type="password"
              id="password"
              className="login-form-input"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          
          <button type="submit" className="login-modal-btn">Log In</button>
        </form>
        
        {/* <div className="login-modal-divider">or</div> */}
        
        {/* Uncomment if you want social login options */}
        {/* <div className="login-modal-social">
          <button className="login-social-btn">
            <FaGoogle />
            <span>Continue with Google</span>
          </button>
          <button className="login-social-btn">
            <FaFacebook />
            <span>Continue with Facebook</span>
          </button>
          <button className="login-social-btn">
            <FaApple />
            <span>Continue with Apple</span>
          </button>
        </div> */}
        
        {/* <div className="login-modal-footer">
          Don't have an account? <a href="#">Sign up</a>
        </div> */}
      </div>
    </div>

</>
  );

};

export default LoginModal;