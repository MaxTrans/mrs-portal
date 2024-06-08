import { useEffect, useState } from 'react';
import { Routes, Route, useLocation, useNavigate } from 'react-router-dom';
import { ToastContainer, toast } from 'react-toastify';
import Main from '@modules/main/Main';
import Login from '@modules/login/Login';
import Register from '@modules/register/Register';
import ForgetPassword from '@modules/forgot-password/ForgotPassword';
import RecoverPassword from '@modules/recover-password/RecoverPassword';
import { useWindowSize } from '@app/hooks/useWindowSize';
import { calculateWindowSize } from '@app/utils/helpers';
import { useDispatch, useSelector } from 'react-redux';
import { setWindowSize } from '@app/store/reducers/ui';
import ReactGA from 'react-ga4';

import Dashboard from '@pages/Dashboard';
import Blank from '@pages/Blank';
import JobsList from '@app/pages/admin/JobsList';
import Profile from '@pages/profile/Profile';

import PublicRoute from './routes/PublicRoute';
import PrivateRoute from './routes/PrivateRoute';
import { setAuthentication } from './store/reducers/auth';
import {
  GoogleProvider,
  getAuthStatus,
  getFacebookLoginStatus,
} from './utils/oidc-providers';
import Intake from './pages/intake';
import ClientJobList from './pages/client/ClientJobList';
import ClientsList from './pages/admin/clients';
import SessionTimeout from './components/session-timeout/SessionTimeout';

const { VITE_NODE_ENV } = import.meta.env;

const App = () => {
  const windowSize = useWindowSize();
  const screenSize = useSelector((state: any) => state.ui.screenSize);
  const dispatch = useDispatch();
  const location = useLocation();
  const navigate = useNavigate();

  const [isAppLoading, setIsAppLoading] = useState(true);

  const checkSession = async () => {
    try {
      let responses: any = await Promise.all([
        getAuthStatus(),
      ]);

      responses = responses.filter((r: any) => Boolean(r));

      if (responses && responses.length > 0) {
        dispatch(setAuthentication(responses[0]));
      }
      else
      {
          navigate('/login');
      }
    } catch (error: any) {
      console.log('error', error);
    }
    setIsAppLoading(false);
  };

  useEffect(() => {
    checkSession();
  }, []);

  useEffect(() => {
    const size = calculateWindowSize(windowSize.width);
    if (screenSize !== size) {
      dispatch(setWindowSize(size));
    }
  }, [windowSize]);

  useEffect(() => {
    if (location && location.pathname && VITE_NODE_ENV === 'production') {
      ReactGA.send({
        hitType: 'pageview',
        page: location.pathname,
      });
    }
  }, [location]);

  const handleSessionTimeout = () => {
    // Perform logout or other actions
    toast.warn('Session timed out');
    navigate('/login');
  };

  if (isAppLoading) {
    return <p>Loading</p>;
  }

  return (
    <>
      <Routes>
        <Route path="/login" element={<PublicRoute />}>
          <Route path="/login" element={<Login />} />
        </Route>
        <Route path="/register" element={<PublicRoute />}>
          <Route path="/register" element={<Register />} />
        </Route>
        <Route path="/forgot-password" element={<PublicRoute />}>
          <Route path="/forgot-password" element={<ForgetPassword />} />
        </Route>
        <Route path="/recover-password" element={<PublicRoute />}>
          <Route path="/recover-password" element={<RecoverPassword />} />
        </Route>
        <Route path="/" element={<PrivateRoute />}>
          <Route path="/" element={<Main />}>
            {/* <Route path="/sub-menu-2" element={<Blank />} /> */}
            <Route path="/admin-jobs" element={<JobsList />} />
            <Route path="/client-jobs" element={<ClientJobList />} />
            <Route path="/client-list" element={<ClientsList />} />
            <Route path="/intake" element={<Intake />} />
            {/* <Route path="/blank" element={<Blank />} /> */}
            <Route path="/profile" element={<Profile />} />
            <Route path="/" element={<Dashboard />} />
          </Route>
        </Route>
      </Routes>
      <ToastContainer
        autoClose={3000}
        draggable={false}
        position="top-right"
        hideProgressBar={false}
        newestOnTop
        closeOnClick
        rtl={false}
        pauseOnHover
      />
      <SessionTimeout timeoutInSeconds={28800} onTimeout={handleSessionTimeout} />
    </>
    
  );
};

export default App;
