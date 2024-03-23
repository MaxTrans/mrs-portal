import { Navigate, Outlet } from 'react-router-dom';
import { useSelector } from 'react-redux';
import store from '../store/store';
import User from '../store/Models/User';

const PrivateRoute = () => {
  const isLoggedIn = useSelector((state: User) => store.getState().auth.isAuthenticated);
  return isLoggedIn ? <Outlet /> : <Navigate to="/login" />;
};

export default PrivateRoute;
