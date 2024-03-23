import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import  IUser from '../Models/User';


const initialState = {} as IUser;

export const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setAuthentication: (state: IUser, action: PayloadAction<IUser>) => {
      state.companyname = action.payload.companyname;
      state.email = action.payload.email;
      state.expiration = action.payload.expiration;
      state.firstname = action.payload.firstname;
      state.lastname = action.payload.lastname;
      state.phoneno = action.payload.phoneno;
      state.refreshtoken = action.payload.refreshtoken;
      state.rolename = action.payload.rolename;
      state.token = action.payload.token;
      state.isAuthenticated = true;
    },
  },
});

export const { setAuthentication } = authSlice.actions;

export default authSlice.reducer;
