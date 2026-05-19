// features/profile/resumeUploadSlice.ts
import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import API from '../../../config/axios.config';
import { API_ENDPOINTS } from '../../../shared/api-endpoints';

interface ResumeUploadState {
  resumeData: any;
  status: boolean;
  error: string | null;
}

const initialState: ResumeUploadState = {
  resumeData: null,
  status: false,
  error: null,
};

const uploadResume = createAsyncThunk<any, File>(
  'profile/uploadResume',
  async (file: File, thunkAPI) => {
    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await API.post(API_ENDPOINTS.RESUME_UPLOAD, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data;
    } catch (error: any) {
      return thunkAPI.rejectWithValue(
        error.response?.data || { message: 'Failed to upload resume' }
      );
    }
  }
);

const resumeUploadSlice = createSlice({
  name: 'resumeUpload',
  initialState,
  reducers: {
    reset: () => initialState,
  },
  extraReducers: (builder) => {
    builder
      .addCase(uploadResume.pending, (state) => {
        state.status = true;
        state.error = null;
      })
      .addCase(uploadResume.fulfilled, (state, action: PayloadAction<any>) => {
        state.status = false;
        state.resumeData = action.payload;
      })
      .addCase(uploadResume.rejected, (state, action: any) => {
        state.status = false;
        state.error = action.payload?.message || 'Failed to upload resume';
        state.resumeData = action.payload;
      });
  },
});

export { uploadResume };
export const { reset: resumeUploadReset } = resumeUploadSlice.actions;
export const resumeUploadReducer = resumeUploadSlice.reducer;
