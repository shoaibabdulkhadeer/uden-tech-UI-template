// features/dashboardSlice.ts
import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import API from '../../../config/axios.config';
import { API_ENDPOINTS } from '../../../shared/api-endpoints';

interface DashboardState {
  dashboardData: any;
  status: boolean;
  error: string | null;
}

const initialState: DashboardState = {
  dashboardData: {},
  status: false,
  error: null,
};

const addDashboardData = createAsyncThunk<any>(
  'dashboard/addData',
  async (_, thunkAPI) => {
    try {
      const response = await API.post(API_ENDPOINTS.FETCH_LEARING_PATH); // Keep endpoint same
      return response.data;
    } catch (error: any) {
      return thunkAPI.rejectWithValue(
        error.response?.data || { message: 'Failed to add dashboard data' }
      );
    }
  }
);

const dashboardSlice = createSlice({
  name: 'dashboard',
  initialState,
  reducers: {
    reset: () => initialState,
  },
  extraReducers: (builder) => {
    builder
      .addCase(addDashboardData.pending, (state) => {
        state.status = true;
        state.error = null;
      })
      .addCase(addDashboardData.fulfilled, (state, action: PayloadAction<any>) => {
        state.status = false;
        state.dashboardData = action.payload;
      })
      .addCase(addDashboardData.rejected, (state, action: any) => {
        state.status = false;
        state.error = action.payload?.message || 'Failed to add dashboard data';
        state.dashboardData = action.payload
      });
  },
});

export { addDashboardData };
export const { reset: dashboardReset } = dashboardSlice.actions;
export const dashboardReducer = dashboardSlice.reducer;
