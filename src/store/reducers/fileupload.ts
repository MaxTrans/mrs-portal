import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import  IUploadFiles from '../Models/UploadFiles';


const initialState = Array<IUploadFiles>();

export const fileUploadSlice = createSlice({
  name: 'upload',
  initialState,
  reducers: {
    setUploadedFiles: (state: Array<IUploadFiles>, action: PayloadAction<IUploadFiles>) => {
      state.push({
        filename: action.payload.filename,
        fileId: action.payload.fileId,
        size: action.payload.size,
        fileextension: action.payload.fileextension,
        filepath: action.payload.filepath
      })
    },
    removeUploadedFiles: (state: Array<IUploadFiles>) => {
      while(state.length > 0){
        state.pop();
      }
    }
  },
});

export const { setUploadedFiles, removeUploadedFiles } = fileUploadSlice.actions;

export default fileUploadSlice.reducer;
