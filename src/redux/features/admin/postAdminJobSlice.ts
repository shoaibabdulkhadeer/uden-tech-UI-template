import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import API from '../../../config/axios.config';
import { API_ENDPOINTS } from '../../../shared/api-endpoints';

export interface PostAdminJobPayload {
	title: string;
	company: string;
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

interface PostAdminJobState {
	postAdminJobData: any;
	status: boolean;
	error: string | null;
}

const initialState: PostAdminJobState = {
	postAdminJobData: null,
	status: false,
	error: null,
};

const postAdminJob = createAsyncThunk<any, PostAdminJobPayload>(
	'admin/postAdminJob',
	async (payload, thunkAPI) => {
		try {
			const response = await API.post(API_ENDPOINTS.GET_ADMIN_JOBS, payload);
			return response.data;
		} catch (error: any) {
			return thunkAPI.rejectWithValue(
				error.response?.data || { message: 'Failed to post job' }
			);
		}
	}
);

const postAdminJobSlice = createSlice({
	name: 'postAdminJob',
	initialState,
	reducers: {
		reset: () => initialState,
	},
	extraReducers: (builder) => {
		builder
			.addCase(postAdminJob.pending, (state) => {
				state.status = true;
				state.error = null;
			})
			.addCase(postAdminJob.fulfilled, (state, action: PayloadAction<any>) => {
				state.status = false;
				state.postAdminJobData = action.payload;
			})
			.addCase(postAdminJob.rejected, (state, action: any) => {
				state.status = false;
				state.error = action.payload?.message || 'Failed to post job';
				state.postAdminJobData = action.payload;
			});
	},
});

export { postAdminJob };
export const { reset: postAdminJobReset } = postAdminJobSlice.actions;
export const postAdminJobReducer = postAdminJobSlice.reducer;
