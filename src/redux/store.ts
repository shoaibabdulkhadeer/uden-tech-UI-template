import { configureStore } from '@reduxjs/toolkit';
// import thunkMiddleware from 'redux-thunk';
import rootReducer from '../redux';

const store = configureStore({
  reducer: rootReducer
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
export default store;
