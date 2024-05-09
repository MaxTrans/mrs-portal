import { Navigate, Outlet } from 'react-router-dom';
import { useSelector } from 'react-redux';
import store from '../store/store';
import User from '../store/Models/User';

const PublicRoute = () => {
  const user = useSelector((state: User) => store.getState().auth);
  const isLoggedIn = user.isAuthenticated;
  const role =  user.roleName;
  return isLoggedIn && role.toLowerCase() != 'admin' ? <Navigate to="/" /> : <Outlet />;
};

export default PublicRoute;
