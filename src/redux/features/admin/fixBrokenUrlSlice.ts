import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import API from '../../../config/axios.config';
import { API_ENDPOINTS } from '../../../shared/api-endpoints';

export interface FixBrokenUrlPayload {
	jobId: string;
	apply_url: string;
}

interface FixBrokenUrlState {
	fixBrokenUrlData: any;
	status: boolean;
	error: string | null;
	pendingJobId: string | null;
}

const initialState: FixBrokenUrlState = {
	fixBrokenUrlData: null,
	status: false,
	error: null,
	pendingJobId: null,
};

const fixBrokenUrl = createAsyncThunk<any, FixBrokenUrlPayload>(
	'admin/fixBrokenUrl',
	async ({ jobId, apply_url }, thunkAPI) => {
		try {
			const response = await API.patch(
				API_ENDPOINTS.FIX_BROKEN_URL.replace('{job_id}', jobId),
				{ apply_url }
			);
			return { ...response.data, jobId };
		} catch (error: any) {
			return thunkAPI.rejectWithValue(
				error.response?.data || { message: 'Failed to fix URL' }
			);
		}
	}
);

const fixBrokenUrlSlice = createSlice({
	name: 'fixBrokenUrl',
	initialState,
	reducers: {
		reset: () => initialState,
	},
	extraReducers: (builder) => {
		builder
			.addCase(fixBrokenUrl.pending, (state, action) => {
				state.status = true;
				state.error = null;
				state.pendingJobId = action.meta.arg.jobId;
			})
			.addCase(fixBrokenUrl.fulfilled, (state, action: PayloadAction<any>) => {
				state.status = false;
				state.fixBrokenUrlData = action.payload;
				state.pendingJobId = null;
			})
			.addCase(fixBrokenUrl.rejected, (state, action: any) => {
				state.status = false;
				state.error = action.payload?.message || 'Failed to fix URL';
				state.fixBrokenUrlData = action.payload;
				state.pendingJobId = null;
			});
	},
});

export { fixBrokenUrl };
export const { reset: fixBrokenUrlReset } = fixBrokenUrlSlice.actions;
export const fixBrokenUrlReducer = fixBrokenUrlSlice.reducer;
