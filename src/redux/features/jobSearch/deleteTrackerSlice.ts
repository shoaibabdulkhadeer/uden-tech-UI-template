import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import API from '../../../config/axios.config';
import { API_ENDPOINTS } from '../../../shared/api-endpoints';

interface DeleteTrackerState {
	deleteTrackerData: any;
	status: boolean;
	error: string | null;
	pendingTrackerId: string | null;
}

const initialState: DeleteTrackerState = {
	deleteTrackerData: null,
	status: false,
	error: null,
	pendingTrackerId: null,
};

const deleteTracker = createAsyncThunk<any, string>(
	'tracker/deleteTracker',
	async (trackerId, thunkAPI) => {
		try {
			const response = await API.delete(
				API_ENDPOINTS.DELETE_TRACKER.replace('{tracker_id}', trackerId)
			);
			return { ...response.data, trackerId };
		} catch (error: any) {
			return thunkAPI.rejectWithValue(
				error.response?.data || { message: 'Failed to delete tracker entry' }
			);
		}
	}
);

const deleteTrackerSlice = createSlice({
	name: 'deleteTracker',
	initialState,
	reducers: {
		reset: () => initialState,
	},
	extraReducers: (builder) => {
		builder
			.addCase(deleteTracker.pending, (state, action) => {
				state.status = true;
				state.error = null;
				state.pendingTrackerId = action.meta.arg;
			})
			.addCase(deleteTracker.fulfilled, (state, action: PayloadAction<any>) => {
				state.status = false;
				state.deleteTrackerData = action.payload;
				state.pendingTrackerId = null;
			})
			.addCase(deleteTracker.rejected, (state, action: any) => {
				state.status = false;
				state.error = action.payload?.message || 'Failed to delete tracker entry';
				state.deleteTrackerData = action.payload;
				state.pendingTrackerId = null;
			});
	},
});

export { deleteTracker };
export const { reset: deleteTrackerReset } = deleteTrackerSlice.actions;
export const deleteTrackerReducer = deleteTrackerSlice.reducer;
