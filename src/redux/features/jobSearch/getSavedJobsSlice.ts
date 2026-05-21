import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import API from '../../../config/axios.config';
import { API_ENDPOINTS } from '../../../shared/api-endpoints';

interface GetSavedJobsParams {
	pageId?: number;
	pageLimit?: number;
}

interface GetSavedJobsState {
	savedJobsData: any;
	status: boolean;
	error: string | null;
}

const initialState: GetSavedJobsState = {
	savedJobsData: null,
	status: false,
	error: null,
};

const getSavedJobs = createAsyncThunk<any, GetSavedJobsParams | void>(
	'jobSearch/getSavedJobs',
	async (params, thunkAPI) => {
		try {
			const pageId    = params?.pageId    ?? 1;
			const pageLimit = params?.pageLimit ?? 10;
			const response = await API.get(API_ENDPOINTS.JOB_GET_SAVED, {
				params: { pageId, pageLimit },
			});
			return response.data;
		} catch (error: any) {
			return thunkAPI.rejectWithValue(
				error.response?.data || { message: 'Failed to fetch saved jobs' }
			);
		}
	}
);

const getSavedJobsSlice = createSlice({
	name: 'getSavedJobs',
	initialState,
	reducers: {
		reset: () => initialState,
	},
	extraReducers: (builder) => {
		builder
			.addCase(getSavedJobs.pending, (state) => {
				state.status = true;
				state.error = null;
			})
			.addCase(getSavedJobs.fulfilled, (state, action: PayloadAction<any>) => {
				state.status = false;
				state.savedJobsData = action.payload;
			})
			.addCase(getSavedJobs.rejected, (state, action: any) => {
				state.status = false;
				state.error = action.payload?.message || 'Failed to fetch saved jobs';
				state.savedJobsData = action.payload;
			});
	},
});

export { getSavedJobs };
export const { reset: getSavedJobsReset } = getSavedJobsSlice.actions;
export const getSavedJobsReducer = getSavedJobsSlice.reducer;
