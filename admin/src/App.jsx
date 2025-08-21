import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Dashboard from './components/Home';
import AddUser from './pages/User/AddUser';
import ManageUsers from './pages/User/ManageUsers';
import AddMusic from './pages/music/AddMusic';
import ManageMusic from './pages/music/ManageMusic';
import Home from './components/Home';
import Dashboard1 from './components/Dashboard1';
import AdminLogin from './pages/AdminLogin';
import ProtectedRoute from './ProtectedRoute';
import { useDispatch, useSelector } from 'react-redux';
import { checkAuth } from './redux/features/auth/authService';
import { useEffect } from 'react';
import EditMusic from './pages/music/EditMusic';
import OnlyMusic from './pages/music/OnlyMusic';
import PasswordGenerator from './components/PasswordGenerator';
import { refreshToken, verifyUser } from './redux/features/auth/authSlice';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';


export default function App() {


  return (
    <>           
     <ToastContainer position="top-right" autoClose={3000} hideProgressBar={false} />
    <Router>
      <Routes>
        <Route path="/" element={<AdminLogin />} />
        <Route path="/pp" element={<PasswordGenerator/>}/>

        <Route element={<ProtectedRoute />}>
          <Route path="/admin" element={<Home />}>
            <Route path="dashboard" element={<Dashboard1 />} />
            <Route path="user/add-user" element={<AddUser />} />
            <Route path="user/manage-users" element={<ManageUsers />} />
            <Route path="music/add-music" element={<AddMusic />} />
            <Route path="music/only-music" element={<OnlyMusic />} />
            <Route path="music/manage-music" element={<ManageMusic />} />
            <Route path="music/edit-music/:id" element={<EditMusic />} />
            <Route index element={<Navigate to="dashboard" replace />} />
          </Route>
        </Route>
        {/* <Route path="/" element={<Navigate to="/admin/dashboard" replace />} /> */}

        {/* Optional: 404 page */}
        <Route path="*" element={<div>Page Not Found</div>} />
      </Routes>
    </Router>
    </>
  );
}