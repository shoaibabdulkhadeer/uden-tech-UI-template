// features/feedbackLinksSlice.ts
import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import API from '../../../config/axios.config';
import { API_ENDPOINTS } from '../../../shared/api-endpoints';

interface FeedbackLinksState {
  feedbackData: any;
  status: boolean;
  error: string | null;
}

const initialState: FeedbackLinksState = {
  feedbackData: {},
  status: false,
  error: null,
};

interface AddFeedbackLinkData {
  [key: string]: any;
}

const addFeedbackLink = createAsyncThunk<any, AddFeedbackLinkData>(
  'feedbackLinks/addLink',
  async (addFeedbackLinkData, thunkAPI) => {
    try {
      const response = await API.post(API_ENDPOINTS.ADD_FEEDBACK_LINK, addFeedbackLinkData);
      return response.data;
    } catch (error: any) {
      return thunkAPI.rejectWithValue(
        error.response?.data || { message: 'Failed to add feedback link' }
      );
    }
  }
);

const feedbackLinksSlice = createSlice({
  name: 'feedbackLinks',
  initialState,
  reducers: {
    reset: () => initialState,
  },
  extraReducers: (builder) => {
    builder
      .addCase(addFeedbackLink.pending, (state) => {
        state.status = true;
        state.error = null;
      })
      .addCase(addFeedbackLink.fulfilled, (state, action: PayloadAction<any>) => {
        state.status = false;
        state.feedbackData = action.payload;
      })
      .addCase(addFeedbackLink.rejected, (state, action: any) => {
        state.status = false;
        state.error = action.payload?.message || 'Failed to add feedback link';
        state.feedbackData = action.payload;
      });
  },
});

export { addFeedbackLink };
export const { reset: feedbackLinksReset } = feedbackLinksSlice.actions;
export const feedbackLinksReducer = feedbackLinksSlice.reducer;
