// features/learningPathSlice.ts
import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import API from '../../../config/axios.config';
import { API_ENDPOINTS } from '../../../shared/api-endpoints';

interface DeleteLearningPathState {
  pathId: any;
  status: boolean;
  error: string | null;
}

const initialState: DeleteLearningPathState = {
  pathId: {},
  status: false,
  error: null,
};

interface DeleteLearningPathData {
  [key: string]: any;
}

const DeleteLearningPath = createAsyncThunk(
  'learningPath/DeletePath',
  async (DeleteLearningPathData: any, thunkAPI) => {
    try {
      const response = await API.delete(API_ENDPOINTS.DELETE_LEARNING_PATH, {
        data: DeleteLearningPathData,
      });
      return response.data;
    } catch (error: any) {
      return thunkAPI.rejectWithValue(
        error.response?.data || { message: 'Failed to delete learning path' }
      );
    }
  }
);


const DeletelearningPathSlice = createSlice({
  name: 'DeletelearningPath',
  initialState,
  reducers: {
    reset: () => initialState,
  },
  extraReducers: (builder) => {
    builder
      .addCase(DeleteLearningPath.pending, (state) => {
        state.status = true;
        state.error = null;
      })
      .addCase(DeleteLearningPath.fulfilled, (state, action: PayloadAction<any>) => {
        state.status = false;
        state.pathId = action.payload;
      })
      .addCase(DeleteLearningPath.rejected, (state, action: any) => {
        state.status = false;
        state.error = action.payload?.message || 'Failed to add learning path';
        state.pathId = action.payload;
      });
  },
});

export { DeleteLearningPath };
export const { reset: DeletelearningPathReset } = DeletelearningPathSlice.actions;
export const DeletelearningPathReducer = DeletelearningPathSlice.reducer;
