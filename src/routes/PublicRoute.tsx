import { Navigate, Outlet } from 'react-router-dom';
import { useSelector } from 'react-redux';
import store from '../store/store';
import User from '../store/Models/User';

const PublicRoute = () => {
  const isLoggedIn = useSelector((state: User) => store.getState().auth.isAuthenticated);
  return isLoggedIn ? <Navigate to="/" /> : <Outlet />;
};

export default PublicRoute;
