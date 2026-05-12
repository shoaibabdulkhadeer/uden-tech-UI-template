// features/continueLearningPathSlice.ts
import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import API from '../../../config/axios.config';
import { API_ENDPOINTS } from '../../../shared/api-endpoints';

interface ContinueLearningPathState {
  continuepathdata: any;
  status: boolean;
  error: string | null;
}

const initialState: ContinueLearningPathState = {
    continuepathdata: {},
  status: false,
  error: null,
};

interface AddContinueLearningPathData {
  [key: string]: any;
}

const addContinueLearningPath = createAsyncThunk<any, AddContinueLearningPathData>(
  'continueLearningPath/addPath',
  async (addContinueLearningPathData, thunkAPI) => {
    try {
      const response = await API.post(API_ENDPOINTS.CONTINUE_LEARNING, addContinueLearningPathData);
      return response.data;
    } catch (error: any) {
      return thunkAPI.rejectWithValue(
        error.response?.data || { message: 'Failed to add continue learning path' }
      );
    }
  }
);

const continueLearningPathSlice = createSlice({
  name: 'continueLearningPath',
  initialState,
  reducers: {
    reset: () => initialState,
  },
  extraReducers: (builder) => {
    builder
      .addCase(addContinueLearningPath.pending, (state) => {
        state.status = true;
        state.error = null;
      })
      .addCase(addContinueLearningPath.fulfilled, (state, action: PayloadAction<any>) => {
        state.status = false;
        state.continuepathdata = action.payload;
      })
      .addCase(addContinueLearningPath.rejected, (state, action: any) => {
        state.status = false;
        state.error = action.payload?.message || 'Failed to add continue learning path';
        state.continuepathdata = action.payload;
      });
  },
});

export { addContinueLearningPath };
export const { reset: continueLearningPathReset } = continueLearningPathSlice.actions;
export const continueLearningPathReducer = continueLearningPathSlice.reducer;
