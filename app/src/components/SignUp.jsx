import { useEffect, useState } from 'react';
import { FaTimes } from 'react-icons/fa';
import '../styles/SignUpModel.css'; // Import your CSS file for styling
import { registerUser } from '../redux/features/auth/authSlice';
import { useDispatch, useSelector } from 'react-redux';
import { toast } from 'react-toastify';


const SignupModal = ({ onClose, switchToLogin }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [birthDate, setBirthDate] = useState('');
  const [gender, setGender] = useState('');



  const dispatch = useDispatch();
  const { status, error } = useSelector((state) => state.auth);

console.log("status", status);  
console.log("error", error);
  useEffect(() => {
    if (status === 'succeeded') {
      toast.success('Signup successful! Please log in.');
      onClose();
      setEmail('');
      setPassword('');
      setConfirmPassword('');
      setDisplayName('');
      setBirthDate('');
      setGender('');
    } else if (status === 'failed') {
      toast.error(error);
    }
  }, [status, error, onClose]);


  const handleSubmit = (e) => {
    e.preventDefault();
    // Handle signup logic here
    console.log('Signup submitted', { email, password, confirmPassword, displayName, birthDate, gender });
    if (password !== confirmPassword) {
      alert("Passwords do not match");
      return;
    } else if (password.length < 6) {
      alert("Password must be at least 6 characters long");
      return;
    } else {
      // You can dispatch a signup action or call an API here
      dispatch(registerUser({ displayName, email, password, confirmPassword, birthDate, gender }));
    }

  };

  return (
    <div className="signup-modal-overlay">
      <div className="signup-modal-container">
        <button className="signup-modal-close" onClick={onClose}>
          <FaTimes />
        </button>

        <div className="signup-modal-header">
          <h2 className="signup-modal-title">Sign up for free</h2>
          <p className="signup-modal-subtitle">Create an account to enjoy unlimited music.</p>
        </div>

        <form className="signup-modal-form" onSubmit={handleSubmit}>
          {/* {error && <div className="signup-error">{error}</div>} */}
          <div className="signup-form-group">
            <label htmlFor="displayName" className="signup-form-label">Display name</label>
            <input
              type="text"
              id="displayName"
              className="signup-form-input"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              required
            />
          </div>
          <div className="signup-form-group">
            <label htmlFor="email" className="signup-form-label">Email address</label>
            <input
              type="email"
              id="email"
              className="signup-form-input"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="signup-form-group">
            <label htmlFor="password" className="signup-form-label">Password</label>
            <input
              type="password"
              id="password"
              className="signup-form-input"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          <div className="signup-form-group">
            <label htmlFor="cpassword" className="signup-form-label">Confirm Password</label>
            <input
              type="password"
              id="cpassword"
              className="signup-form-input"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
            />
          </div>

          {/* <div className="signup-form-group">
            <label htmlFor="displayName" className="signup-form-label">Display name</label>
            <input
              type="text"
              id="displayName"
              className="signup-form-input"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              required
            />
          </div> */}

          <div className="signup-form-group">
            <label htmlFor="birthDate" className="signup-form-label">Date of birth</label>
            <input
              type="date"
              id="birthDate"
              className="signup-form-input"
              value={birthDate}
              onChange={(e) => setBirthDate(e.target.value)}
              required
            />
          </div>

          <div className="signup-form-group">
            <label htmlFor="gender" className="signup-form-label">Gender</label>
            <select
              id="gender"
              className="signup-form-input"
              value={gender}
              onChange={(e) => setGender(e.target.value)}
              required
            >
              <option value="">Select gender</option>
              <option value="male">Male</option>
              <option value="female">Female</option>
              <option value="non-binary">Non-binary</option>
              <option value="other">Other</option>
              <option value="prefer-not-to-say">Prefer not to say</option>
            </select>
          </div>

          <button type="submit" className="signup-modal-btn">Sign Up</button>
        </form>

        {/* <div className="signup-modal-divider">or</div> */}

        {/* Social signup options can be added here if needed */}
        {/* <div className="signup-modal-social">
          Social buttons would go here
        </div> */}

        {/* <div className="signup-modal-footer">
          Already have an account? <a href="#" onClick={(e) => { e.preventDefault(); switchToLogin(); }}>Log in</a>
        </div> */}
      </div>
    </div>
  );
};

export default SignupModal;