import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import API from '../../../config/axios.config';
import { API_ENDPOINTS } from '../../../shared/api-endpoints';

export interface GetAdminJobsParams {
	pageId?: number;
	pageLimit?: number;
	// API filter params
	title?: string;       // search by job title
	search?: string;      // generic search (fallback)
	work_mode?: string;
	job_type?: string;
	experience_level?: string;
	sector?: string;
	skills?: string;
}

interface GetAdminJobsState {
	adminJobsData: any;
	status: boolean;
	error: string | null;
}

const initialState: GetAdminJobsState = {
	adminJobsData: null,
	status: false,
	error: null,
};

const getAdminJobs = createAsyncThunk<any, GetAdminJobsParams>(
	'admin/getAdminJobs',
	async ({ pageId = 1, pageLimit = 20, title, search, work_mode, job_type, experience_level, sector, skills }, thunkAPI) => {
		try {
			// Build params — omit empty/undefined values so URL stays clean
			const params: Record<string, any> = { pageId, pageLimit };
			if (title)            params.title            = title;
			if (search)           params.search           = search;
			if (work_mode)        params.work_mode        = work_mode;
			if (job_type)         params.job_type         = job_type;
			if (experience_level) params.experience_level = experience_level;
			if (sector)           params.sector           = sector;
			if (skills)           params.skills           = skills;

			const response = await API.get(API_ENDPOINTS.GET_ADMIN_JOBS, { params });
			return response.data;
		} catch (error: any) {
			return thunkAPI.rejectWithValue(
				error.response?.data || { message: 'Failed to fetch admin jobs' }
			);
		}
	}
);

const getAdminJobsSlice = createSlice({
	name: 'getAdminJobs',
	initialState,
	reducers: {
		reset: () => initialState,
	},
	extraReducers: (builder) => {
		builder
			.addCase(getAdminJobs.pending, (state) => {
				state.status = true;
				state.error = null;
			})
			.addCase(getAdminJobs.fulfilled, (state, action: PayloadAction<any>) => {
				state.status = false;
				state.adminJobsData = action.payload;
			})
			.addCase(getAdminJobs.rejected, (state, action: any) => {
				state.status = false;
				state.error = action.payload?.message || 'Failed to fetch admin jobs';
				state.adminJobsData = action.payload;
			});
	},
});

export { getAdminJobs };
export const { reset: getAdminJobsReset } = getAdminJobsSlice.actions;
export const getAdminJobsReducer = getAdminJobsSlice.reducer;
