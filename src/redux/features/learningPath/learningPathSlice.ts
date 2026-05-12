// features/learningPathSlice.ts
import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import API from '../../../config/axios.config';
import { API_ENDPOINTS } from '../../../shared/api-endpoints';

interface LearningPathState {
  pathdata: any;
  status: boolean;
  error: string | null;
}

const initialState: LearningPathState = {
  pathdata: {},
  status: false,
  error: null,
};

interface AddLearningPathData {
  [key: string]: any;
}

const addLearningPath = createAsyncThunk<any, AddLearningPathData>(
  'learningPath/addPath',
  async (addLearningPathData, thunkAPI) => {
    try {
      const response = await API.post(API_ENDPOINTS.ADD_LEARNING_PATH, addLearningPathData);
      return response.data;
    } catch (error: any) {
      return thunkAPI.rejectWithValue(
        error.response?.data || { message: 'Failed to add learning path' }
      );
    }
  }
);

const learningPathSlice = createSlice({
  name: 'learningPath',
  initialState,
  reducers: {
    reset: () => initialState,
  },
  extraReducers: (builder) => {
    builder
      .addCase(addLearningPath.pending, (state) => {
        state.status = true;
        state.error = null;
      })
      .addCase(addLearningPath.fulfilled, (state, action: PayloadAction<any>) => {
        state.status = false;
        state.pathdata = action.payload;
      })
      .addCase(addLearningPath.rejected, (state, action: any) => {
        state.status = false;
        state.error = action.payload?.message || 'Failed to add learning path';
        state.pathdata = action.payload;
      });
  },
});

export { addLearningPath };
export const { reset: learningPathReset } = learningPathSlice.actions;
export const learningPathReducer = learningPathSlice.reducer;
