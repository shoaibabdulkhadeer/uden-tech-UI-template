import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import API from '../../../config/axios.config';
import { API_ENDPOINTS } from '../../../shared/api-endpoints';

interface SummarizeState {
  summaryData: any;
  status: boolean;
  error: string | null;
}

const initialState: SummarizeState = {
  summaryData: {},
  status: false,
  error: null,
};

interface AddSummaryData {
  [key: string]: any;
}

const addSummarize = createAsyncThunk<any, AddSummaryData>(
  'summarize/addSummary',
  async (addSummaryData, thunkAPI) => {
    try {
      const response = await API.post(API_ENDPOINTS.ADD_SUMMARY, addSummaryData);
      return response.data;
    } catch (error: any) {
      return thunkAPI.rejectWithValue(
        error.response?.data || { message: 'Failed to add summary' }
      );
    }
  }
);

const summarizeSlice = createSlice({
  name: 'summarize',
  initialState,
  reducers: {
    reset: () => initialState,
  },
  extraReducers: (builder) => {
    builder
      .addCase(addSummarize.pending, (state) => {
        state.status = true;
        state.error = null;
      })
      .addCase(addSummarize.fulfilled, (state, action: PayloadAction<any>) => {
        state.status = false;
        state.summaryData = action.payload;
      })
      .addCase(addSummarize.rejected, (state, action: any) => {
        state.status = false;
        state.error = action.payload?.message || 'Failed to add summary';
        state.summaryData = action.payload;

      });
  },
});

export { addSummarize };
export const { reset: summarizeReset } = summarizeSlice.actions;
export const summarizeReducer = summarizeSlice.reducer;