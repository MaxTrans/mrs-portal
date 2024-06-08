import React, { useState, useEffect } from 'react';
import Modal from 'react-bootstrap/Modal'
import Button from 'react-bootstrap/Button'
import { useNavigate } from 'react-router-dom';
import { refreshToken } from '@app/utils/oidc-providers';
import IUser from '@app/store/Models/User';
import { AxiosResponse } from 'axios';
import { toast } from 'react-toastify';
import { useDispatch } from 'react-redux';
import { setAuthentication } from '@store/reducers/auth';

const SessionTimeout = ({ timeoutInSeconds, onTimeout }: { timeoutInSeconds: number; onTimeout: () => void }) => {
  const [countdown, setCountdown] = useState(timeoutInSeconds);
  const [showDialog, setShowDialog] =  useState(false);
  const timeout = timeoutInSeconds;
  const navigate = useNavigate();
  const dispatch = useDispatch();

  useEffect(() => {
    if(location.href.indexOf('login') == -1){
      const timer = setTimeout(() => {
          localStorage.removeItem('authentication');
          onTimeout();
          clearTimeout(timer);
        }, timeoutInSeconds * 1000);
      
      const intervalTimer = setInterval(() => { 
        timeoutInSeconds = timeoutInSeconds - 1;
        setCountdown(timeoutInSeconds);
        //console.log(timeoutInSeconds); 
        if (timeoutInSeconds == Math.round(timeout * .30))
          setShowDialog(true);
      }, 1000);

      // Reset the timer when the user interacts
      const resetTimer = () => {
        setCountdown(timeoutInSeconds);
      };

      window.addEventListener('mousemove', resetTimer);
      window.addEventListener('keydown', resetTimer);

      return () => {
        clearTimeout(timer);
        clearInterval(intervalTimer);
        window.removeEventListener('mousemove', resetTimer);
        window.removeEventListener('keydown', resetTimer);
      };
  }
  }, [timeoutInSeconds, onTimeout]);

  function handleLogout(){
    localStorage.removeItem('authentication');
    navigate('/login');
  }
  async function handleExtend(){
    try {
      const user = JSON.parse(localStorage.getItem('authentication')??'') as IUser
      const response = await refreshToken(user);

      const newUser = (response as AxiosResponse).data as IUser;
     
      dispatch(setAuthentication(newUser));
      setShowDialog(false);
    } catch (error: any) {
      
      toast.error(error.message || 'Failed');
    }
  }
  
  return (
    <div className="static-modal">
    <Modal animation={false} show={showDialog} onHide={() =>handleLogout()} backdrop={true}>
      <Modal.Header placeholder="">
        <Modal.Title>Session Timeout</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        Your session will timeout in {countdown} seconds
      </Modal.Body>
      <Modal.Footer>
        <Button className='btn btn-sm btn-danger' onClick={() => handleLogout()}>Logout</Button>
        <Button className='btn btn-sm btn-success' onClick={() => handleExtend()}>Extend</Button>
      </Modal.Footer>
    </Modal>
  </div>
  );
};

export default SessionTimeout;
