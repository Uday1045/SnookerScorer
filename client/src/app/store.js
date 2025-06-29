import { configureStore } from '@reduxjs/toolkit';
// Import your reducers here (e.g., authReducer)
import authReducer from '../features/authSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer, // Add other reducers as needed

  },
});
