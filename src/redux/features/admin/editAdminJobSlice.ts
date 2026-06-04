import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import API from '../../../config/axios.config';
import { API_ENDPOINTS } from '../../../shared/api-endpoints';

export interface EditAdminJobPayload {
	jobId: string;
	title?: string;
	company?: string;
	description?: string;
	location?: string;
	sector?: string;
	work_mode?: string;
	job_type?: string;
	experience_level?: string;
	skills_required?: string[];
	salary_range?: string;
	apply_url?: string;
}

interface EditAdminJobState {
	editAdminJobData: any;
	status: boolean;
	error: string | null;
}

const initialState: EditAdminJobState = {
	editAdminJobData: null,
	status: false,
	error: null,
};

const editAdminJob = createAsyncThunk<any, EditAdminJobPayload>(
	'admin/editAdminJob',
	async ({ jobId, ...body }, thunkAPI) => {
		try {
			const response = await API.patch(
				API_ENDPOINTS.EDIT_ADMIN_JOB.replace('{job_id}', jobId),
				body
			);
			return response.data;
		} catch (error: any) {
			return thunkAPI.rejectWithValue(
				error.response?.data || { message: 'Failed to update job' }
			);
		}
	}
);

const editAdminJobSlice = createSlice({
	name: 'editAdminJob',
	initialState,
	reducers: {
		reset: () => initialState,
	},
	extraReducers: (builder) => {
		builder
			.addCase(editAdminJob.pending, (state) => {
				state.status = true;
				state.error = null;
			})
			.addCase(editAdminJob.fulfilled, (state, action: PayloadAction<any>) => {
				state.status = false;
				state.editAdminJobData = action.payload;
			})
			.addCase(editAdminJob.rejected, (state, action: any) => {
				state.status = false;
				state.error = action.payload?.message || 'Failed to update job';
				state.editAdminJobData = action.payload;
			});
	},
});

export { editAdminJob };
export const { reset: editAdminJobReset } = editAdminJobSlice.actions;
export const editAdminJobReducer = editAdminJobSlice.reducer;
