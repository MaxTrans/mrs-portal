import { removeWindowClass } from '@app/utils/helpers';
import APIService from './Api.service';
import User from '@app/store/Models/User';

export const loginByAuth = async (email: string, password: string) => {
  const token = 'I_AM_THE_TOKEN';
  localStorage.setItem('token', token);
  removeWindowClass('login-page');
  removeWindowClass('hold-transition');
  return token;
};

export const registerByAuth = async (email: string, password: string) => {
  const token = 'I_AM_THE_TOKEN';
  localStorage.setItem('token', token);
  removeWindowClass('register-page');
  removeWindowClass('hold-transition');
  return token;
};


const user = {
  login: (user: User) => APIService.requests.post('Account/LoginUser', user)
}
