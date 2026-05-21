import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import API from '../../../config/axios.config';
import { API_ENDPOINTS } from '../../../shared/api-endpoints';

interface UnsaveJobState {
	unsaveJobData: any;
	status: boolean;
	error: string | null;
	pendingId: string | null;
}

const initialState: UnsaveJobState = {
	unsaveJobData: null,
	status: false,
	error: null,
	pendingId: null,
};

const unsaveJob = createAsyncThunk<any, string>(
	'jobSearch/unsaveJob',
	async (jobId, thunkAPI) => {
		try {
			const response = await API.delete(API_ENDPOINTS.JOB_UNSAVE.replace('{job_id}', jobId));
			return { ...response.data, jobId };
		} catch (error: any) {
			return thunkAPI.rejectWithValue(
				error.response?.data || { message: 'Failed to remove saved job' }
			);
		}
	}
);

const unsaveJobSlice = createSlice({
	name: 'unsaveJob',
	initialState,
	reducers: {
		reset: () => initialState,
	},
	extraReducers: (builder) => {
		builder
			.addCase(unsaveJob.pending, (state, action) => {
				state.status = true;
				state.error = null;
				state.pendingId = action.meta.arg;
			})
			.addCase(unsaveJob.fulfilled, (state, action: PayloadAction<any>) => {
				state.status = false;
				state.unsaveJobData = action.payload;
				state.pendingId = null;
			})
			.addCase(unsaveJob.rejected, (state, action: any) => {
				state.status = false;
				state.error = action.payload?.message || 'Failed to remove saved job';
				state.unsaveJobData = action.payload;
				state.pendingId = null;
			});
	},
});

export { unsaveJob };
export const { reset: unsaveJobReset } = unsaveJobSlice.actions;
export const unsaveJobReducer = unsaveJobSlice.reducer;
