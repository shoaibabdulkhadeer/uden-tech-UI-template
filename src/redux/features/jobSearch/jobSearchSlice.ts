import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import API from '../../../config/axios.config';
import { API_ENDPOINTS } from '../../../shared/api-endpoints';

export interface JobSearchPayload {
	mode?: 'title' | 'description' | 'skills';
	query?: string;
	description?: string;
	max_results?: number;
	filters?: {
		sector?: string;
		work_mode?: string;
		job_type?: string;
		experience_level?: string;
		location?: string;
		experience_min?: number;
		experience_max?: number;
		skills?: string[];
		currency?: string;
	};
}

interface JobSearchState {
	jobSearchData: any;
	status: boolean;
	error: string | null;
}

const initialState: JobSearchState = {
	jobSearchData: null,
	status: false,
	error: null,
};

const searchJobs = createAsyncThunk<any, JobSearchPayload>(
	'jobSearch/searchJobs',
	async (payload, thunkAPI) => {
		try {
			const response = await API.post(API_ENDPOINTS.JOB_SEARCH, payload);
			return response.data;
		} catch (error: any) {
			return thunkAPI.rejectWithValue(
				error.response?.data || { message: 'Failed to search jobs' }
			);
		}
	}
);

const jobSearchSlice = createSlice({
	name: 'jobSearch',
	initialState,
	reducers: {
		reset: () => initialState,
	},
	extraReducers: (builder) => {
		builder
			.addCase(searchJobs.pending, (state) => {
				state.status = true;
				state.error = null;
			})
			.addCase(searchJobs.fulfilled, (state, action: PayloadAction<any>) => {
				state.status = false;
				state.jobSearchData = action.payload;
			})
			.addCase(searchJobs.rejected, (state, action: any) => {
				state.status = false;
				state.error = action.payload?.message || 'Failed to search jobs';
				state.jobSearchData = action.payload;
			});
	},
});

export { searchJobs };
export const { reset: jobSearchReset } = jobSearchSlice.actions;
export const jobSearchReducer = jobSearchSlice.reducer;
