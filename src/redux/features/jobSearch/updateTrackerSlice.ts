import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import API from '../../../config/axios.config';
import { API_ENDPOINTS } from '../../../shared/api-endpoints';

export interface UpdateTrackerPayload {
	trackerId: string;
	status?: 'applied' | 'shortlisted' | 'interviewing' | 'offer' | 'rejected' | 'withdrawn';
	notes?: string;
}

interface UpdateTrackerState {
	updateTrackerData: any;
	status: boolean;
	error: string | null;
}

const initialState: UpdateTrackerState = {
	updateTrackerData: null,
	status: false,
	error: null,
};

const updateTracker = createAsyncThunk<any, UpdateTrackerPayload>(
	'tracker/updateTracker',
	async ({ trackerId, status, notes }, thunkAPI) => {
		try {
			const body: any = {};
			if (status !== undefined) body.status = status;
			if (notes  !== undefined) body.notes  = notes;
			const response = await API.patch(
				API_ENDPOINTS.UPDATE_TRACKER.replace('{tracker_id}', trackerId),
				body
			);
			return { ...response.data, trackerId };
		} catch (error: any) {
			return thunkAPI.rejectWithValue(
				error.response?.data || { message: 'Failed to update tracker entry' }
			);
		}
	}
);

const updateTrackerSlice = createSlice({
	name: 'updateTracker',
	initialState,
	reducers: {
		reset: () => initialState,
	},
	extraReducers: (builder) => {
		builder
			.addCase(updateTracker.pending, (state) => {
				state.status = true;
				state.error = null;
			})
			.addCase(updateTracker.fulfilled, (state, action: PayloadAction<any>) => {
				state.status = false;
				state.updateTrackerData = action.payload;
			})
			.addCase(updateTracker.rejected, (state, action: any) => {
				state.status = false;
				state.error = action.payload?.message || 'Failed to update tracker entry';
				state.updateTrackerData = action.payload;
			});
	},
});

export { updateTracker };
export const { reset: updateTrackerReset } = updateTrackerSlice.actions;
export const updateTrackerReducer = updateTrackerSlice.reducer;
