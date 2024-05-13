import { Navigate, Outlet } from 'react-router-dom';
import { useSelector } from 'react-redux';
import store from '../store/store';
import User from '../store/Models/User';

const PublicRoute = () => {
  const user = useSelector((state: User) => store.getState().auth);
  if(!user.isAuthenticated) 
    return <Outlet />;
  else if(user.roleName == 'Admin')
    return <Navigate to="/admin-jobs" />;
  else if(user.roleName == 'Client')
    return <Navigate to="/client-jobs" />;
  else
    return <Navigate to="/" />;
};

export default PublicRoute;
