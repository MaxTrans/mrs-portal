import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import  IUser from '../Models/User';
import User from '../Models/User';
import APIService from '@app/services/Api.service';


const initialState = {} as User;

export const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setAuthentication: (state: IUser, action: PayloadAction<IUser>) => {
      state.id = action.payload.id,
      state.companyId = action.payload.companyId;
      state.companyName = action.payload.companyName;
      state.email = action.payload.email;
      state.expiration = action.payload.expiration;
      state.firstName = action.payload.firstName;
      state.lastName = action.payload.lastName;
      state.phoneNo = action.payload.phoneNo;
      state.refreshToken = action.payload.refreshToken;
      state.roleName = action.payload.roleName;
      state.token = action.payload.token;
      state.isAuthenticated = action.payload.isAuthenticated;
      state.filePreference = action.payload.filePreference;
      APIService.requests.setAutentication(action.payload.token);
    },
  },
});

export const { setAuthentication } = authSlice.actions;

export default authSlice.reducer;
