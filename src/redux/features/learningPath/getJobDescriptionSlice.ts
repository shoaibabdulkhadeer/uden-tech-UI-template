// features/learningPathSlice.ts
import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import API from '../../../config/axios.config';
import { API_ENDPOINTS } from '../../../shared/api-endpoints';

interface getJobDescriptionState {
  getJobDescription: any;
  getJobDescriptionLoading: boolean;
  getJobDescriptionError: string | null;
}

const initialState: getJobDescriptionState = {
  getJobDescription: {},
  getJobDescriptionLoading: false,
  getJobDescriptionError: null,
};


const getJobDescriptionApi = createAsyncThunk(
  'getJobDescription/addPath',
  async (getJobDescriptionData:any, thunkAPI) => {
    try {
      const response = await API.post(API_ENDPOINTS.GET_JOB_DESCRIPTION, getJobDescriptionData);
      return response.data;
    } catch (error: any) {
      return thunkAPI.rejectWithValue(
        error.response?.data || { message: 'Failed to get Job Description' }
      );
    }
  }
);

const getJobDescriptionSlice = createSlice({
  name: 'getJobDescription',
  initialState,
  reducers: {
    reset: () => initialState,
  },
  extraReducers: (builder) => {
    builder
      .addCase(getJobDescriptionApi.pending, (state:any) => {
        state.getJobDescriptionLoading = true;
        state.getJobDescriptionError = null;
      })
      .addCase(getJobDescriptionApi.fulfilled, (state:any, action: PayloadAction<any>) => {
        state.getJobDescriptionLoading = false;
        state.getJobDescription = action.payload;
      })
      .addCase(getJobDescriptionApi.rejected, (state:any, action: any) => {
        state.getJobDescriptionLoading = false;
        state.getJobDescriptionError = action.payload?.message || 'Failed to add learning path';
        state.getJobDescription = action.payload;
      });
  },
});

export { getJobDescriptionApi };
export const { reset: getJobDescriptionReset } = getJobDescriptionSlice.actions;
export const getJobDescriptionReducer = getJobDescriptionSlice.reducer;
