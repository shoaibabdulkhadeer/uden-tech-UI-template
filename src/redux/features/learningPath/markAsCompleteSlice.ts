import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import API from '../../../config/axios.config';
import { API_ENDPOINTS } from '../../../shared/api-endpoints';

interface MarkAsCompleteState {
  completeData: any;
  status: boolean;
  error: string | null;
}

const initialState: MarkAsCompleteState = {
  completeData: {},
  status: false,
  error: null,
};

interface MarkCompletePayload {
  [key: string]: any;
}

const markAsComplete = createAsyncThunk<any, MarkCompletePayload>(
  'complete/markAsComplete',
  async (payload, thunkAPI) => {
    try {
      const response = await API.post(API_ENDPOINTS.MARK_AS_COMPLETE, payload);
      return response.data;
    } catch (error: any) {
      return thunkAPI.rejectWithValue(
        error.response?.data || { message: 'Failed to mark as complete' }
      );
    }
  }
);

const markAsCompleteSlice = createSlice({
  name: 'complete',
  initialState,
  reducers: {
    reset: () => initialState,
  },
  extraReducers: (builder) => {
    builder
      .addCase(markAsComplete.pending, (state) => {
        state.status = true;
        state.error = null;
      })
      .addCase(markAsComplete.fulfilled, (state, action: PayloadAction<any>) => {
        state.status = false;
        state.completeData = action.payload;
      })
      .addCase(markAsComplete.rejected, (state, action: any) => {
        state.status = false;
        state.error = action.payload?.message || 'Failed to mark as complete';
        state.completeData = action.payload;
      });
  },
});

export { markAsComplete };
export const { reset: markAsCompleteReset } = markAsCompleteSlice.actions;
export const markAsCompleteReducer = markAsCompleteSlice.reducer;
