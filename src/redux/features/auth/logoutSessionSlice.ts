// features/logoutSessionSlice.ts
import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import API from '../../../config/axios.config';
import { API_ENDPOINTS } from '../../../shared/api-endpoints';

interface LogoutSessionState {
  logoutData: any;
  status: boolean;
  error: string | null;
}

const initialState: LogoutSessionState = {
  logoutData: {},
  status: false,
  error: null,
};

const logoutSession = createAsyncThunk<any>(
  'logoutSession/logout',
  async (_, thunkAPI) => {
    try {
      const token = sessionStorage.getItem('accessToken');

      const response = await API.post(
        API_ENDPOINTS?.LOGOUT_SESSION,
        {}, // No body
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Ocp-Apim-Subscription-Key': ''
          }
        }
      );

      return response.data;
    } catch (error: any) {
      return thunkAPI.rejectWithValue(
        error.response?.data || { message: 'Failed to logout session' }
      );
    }
  }
);

const logoutSessionSlice = createSlice({
  name: 'logoutSession',
  initialState,
  reducers: {
    reset: () => initialState,
  },
  extraReducers: (builder) => {
    builder
      .addCase(logoutSession.pending, (state) => {
        state.status = true;
        state.error = null;
      })
      .addCase(logoutSession.fulfilled, (state, action: PayloadAction<any>) => {
        state.status = false;
        state.logoutData = action.payload;
      })
      .addCase(logoutSession.rejected, (state, action: any) => {
        state.status = false;
        state.error = action.payload?.message || 'Failed to logout session';
      });
  },
});

export { logoutSession };
export const { reset: logoutSessionReset } = logoutSessionSlice.actions;
export const logoutSessionReducer = logoutSessionSlice.reducer;
