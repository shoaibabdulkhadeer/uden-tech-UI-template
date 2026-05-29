import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import API from '../../../config/axios.config';
import { API_ENDPOINTS } from '../../../shared/api-endpoints';

export interface TrackerParams {
	status?: 'applied' | 'interviewing' | 'offer' | 'rejected' | 'withdrawn' | 'shortlisted';
	pageId?: number;
	pageLimit?: number;
}

interface TrackerState {
	trackerData: any;
	status: boolean;
	error: string | null;
}

const initialState: TrackerState = {
	trackerData: null,
	status: false,
	error: null,
};

const getTrackerApplications = createAsyncThunk<any, TrackerParams | void>(
	'tracker/getTrackerApplications',
	async (params, thunkAPI) => {
		try {
			const queryParams: Record<string, any> = {
				pageId:    params?.pageId    ?? 1,
				pageLimit: params?.pageLimit ?? 10,
			};
			if (params?.status) queryParams.status = params.status;
			const response = await API.get(API_ENDPOINTS.GET_TRACKER, { params: queryParams });
			return response.data;
		} catch (error: any) {
			return thunkAPI.rejectWithValue(
				error.response?.data || { message: 'Failed to fetch tracked applications' }
			);
		}
	}
);

const trackerSlice = createSlice({
	name: 'tracker',
	initialState,
	reducers: {
		reset: () => initialState,
	},
	extraReducers: (builder) => {
		builder
			.addCase(getTrackerApplications.pending, (state) => {
				state.status = true;
				state.error = null;
			})
			.addCase(getTrackerApplications.fulfilled, (state, action: PayloadAction<any>) => {
				state.status = false;
				state.trackerData = action.payload;
			})
			.addCase(getTrackerApplications.rejected, (state, action: any) => {
				state.status = false;
				state.error = action.payload?.message || 'Failed to fetch tracked applications';
				state.trackerData = action.payload;
			});
	},
});

export { getTrackerApplications };
export const { reset: trackerReset } = trackerSlice.actions;
export const trackerReducer = trackerSlice.reducer;
