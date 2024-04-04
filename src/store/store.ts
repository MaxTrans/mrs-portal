import { configureStore } from '@reduxjs/toolkit';

import { authSlice } from '@app/store/reducers/auth';
import { uiSlice } from '@app/store/reducers/ui';
import { fileUploadSlice } from '@app/store/reducers/fileupload';
import { createLogger } from 'redux-logger';

const store = configureStore({
  reducer: {
    auth: authSlice.reducer,
    ui: uiSlice.reducer,
    uploadfile: fileUploadSlice.reducer
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(createLogger()) as any,
});

export default store;
