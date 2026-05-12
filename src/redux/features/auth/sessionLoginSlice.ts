import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import axios from 'axios';
import { environment } from '../../../environments/environment';

interface SessionLoginState {
  sessionData: any;
  status: boolean;
  error: string | null;
}

const initialState: SessionLoginState = {
  sessionData: {},
  status: false,
  error: null,
};

interface SessionLoginParams {
  token: string; // This is the token from URL
}

const getSessionLogin = createAsyncThunk<any, SessionLoginParams>(
  'sessionLogin/getSession',
  async ({ token }, thunkAPI) => {
    try {
      const response = await axios.get(
        `${environment.APP_API_URL}/sessionlogin`, // Replace with real path
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      return response.data;
    } catch (error: any) {
      return thunkAPI.rejectWithValue(
        error.response?.data || { message: 'Session login failed' }
      );
    }
  }
);

const sessionLoginSlice = createSlice({
  name: 'sessionLogin',
  initialState,
  reducers: {
    reset: () => initialState,
  },
  extraReducers: (builder) => {
    builder
      .addCase(getSessionLogin.pending, (state) => {
        state.status = true;
        state.error = null;
      })
      .addCase(getSessionLogin.fulfilled, (state, action: PayloadAction<any>) => {
        state.status = false;
        state.sessionData = action.payload;
      })
      .addCase(getSessionLogin.rejected, (state, action: any) => {
        state.status = false;
  const payload = action.payload || {};
  state.error = payload.message || 'Session login failed';
  state.sessionData = payload;
      });
  },
});

export { getSessionLogin };
export const { reset: sessionLoginReset } = sessionLoginSlice.actions;
export const sessionLoginReducer = sessionLoginSlice.reducer;
