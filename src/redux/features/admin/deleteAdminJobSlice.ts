import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import API from '../../../config/axios.config';
import { API_ENDPOINTS } from '../../../shared/api-endpoints';

interface DeleteAdminJobState {
	deleteAdminJobData: any;
	status: boolean;
	error: string | null;
	pendingJobId: string | null;
}

const initialState: DeleteAdminJobState = {
	deleteAdminJobData: null,
	status: false,
	error: null,
	pendingJobId: null,
};

const deleteAdminJob = createAsyncThunk<any, string>(
	'admin/deleteAdminJob',
	async (jobId, thunkAPI) => {
		try {
			const response = await API.delete(
				API_ENDPOINTS.DELETE_ADMIN_JOB.replace('{job_id}', jobId)
			);
			return { ...response.data, jobId };
		} catch (error: any) {
			return thunkAPI.rejectWithValue(
				error.response?.data || { message: 'Failed to delete job' }
			);
		}
	}
);

const deleteAdminJobSlice = createSlice({
	name: 'deleteAdminJob',
	initialState,
	reducers: {
		reset: () => initialState,
	},
	extraReducers: (builder) => {
		builder
			.addCase(deleteAdminJob.pending, (state, action) => {
				state.status = true;
				state.error = null;
				state.pendingJobId = action.meta.arg;
			})
			.addCase(deleteAdminJob.fulfilled, (state, action: PayloadAction<any>) => {
				state.status = false;
				state.deleteAdminJobData = action.payload;
				state.pendingJobId = null;
			})
			.addCase(deleteAdminJob.rejected, (state, action: any) => {
				state.status = false;
				state.error = action.payload?.message || 'Failed to delete job';
				state.deleteAdminJobData = action.payload;
				state.pendingJobId = null;
			});
	},
});

export { deleteAdminJob };
export const { reset: deleteAdminJobReset } = deleteAdminJobSlice.actions;
export const deleteAdminJobReducer = deleteAdminJobSlice.reducer;
