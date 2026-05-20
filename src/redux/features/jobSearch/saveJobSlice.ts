import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import API from '../../../config/axios.config';
import { API_ENDPOINTS } from '../../../shared/api-endpoints';

interface SaveJobState {
	saveJobData: any;
	status: boolean;
	error: string | null;
}

const initialState: SaveJobState = {
	saveJobData: null,
	status: false,
	error: null,
};

const saveJob = createAsyncThunk<any, string>(
	'jobSearch/saveJob',
	async (jobId, thunkAPI) => {
		try {
			const response = await API.post(API_ENDPOINTS.JOB_SAVE.replace('{job_id}', jobId));
			return response.data;
		} catch (error: any) {
			return thunkAPI.rejectWithValue(
				error.response?.data || { message: 'Failed to save job' }
			);
		}
	}
);

const saveJobSlice = createSlice({
	name: 'saveJob',
	initialState,
	reducers: {
		reset: () => initialState,
	},
	extraReducers: (builder) => {
		builder
			.addCase(saveJob.pending, (state) => {
				state.status = true;
				state.error = null;
			})
			.addCase(saveJob.fulfilled, (state, action: PayloadAction<any>) => {
				state.status = false;
				state.saveJobData = action.payload;
			})
			.addCase(saveJob.rejected, (state, action: any) => {
				state.status = false;
				state.error = action.payload?.message || 'Failed to save job';
				state.saveJobData = action.payload;
			});
	},
});

export { saveJob };
export const { reset: saveJobReset } = saveJobSlice.actions;
export const saveJobReducer = saveJobSlice.reducer;
