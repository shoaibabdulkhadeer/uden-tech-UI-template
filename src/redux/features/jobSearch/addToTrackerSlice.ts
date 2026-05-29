import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import API from '../../../config/axios.config';
import { API_ENDPOINTS } from '../../../shared/api-endpoints';

export interface AddToTrackerPayload {
	job_id: string;
	status?: 'applied' | 'shortlisted';
	notes?: string;
}

interface AddToTrackerState {
	addToTrackerData: any;
	status: boolean;
	error: string | null;
}

const initialState: AddToTrackerState = {
	addToTrackerData: null,
	status: false,
	error: null,
};

const addToTracker = createAsyncThunk<any, AddToTrackerPayload>(
	'tracker/addToTracker',
	async (payload, thunkAPI) => {
		try {
			const response = await API.post(API_ENDPOINTS.ADD_TRACKER, payload);
			return response.data;
		} catch (error: any) {
			return thunkAPI.rejectWithValue(
				error.response?.data || { message: 'Failed to add application to tracker' }
			);
		}
	}
);

const addToTrackerSlice = createSlice({
	name: 'addToTracker',
	initialState,
	reducers: {
		reset: () => initialState,
	},
	extraReducers: (builder) => {
		builder
			.addCase(addToTracker.pending, (state) => {
				state.status = true;
				state.error = null;
			})
			.addCase(addToTracker.fulfilled, (state, action: PayloadAction<any>) => {
				state.status = false;
				state.addToTrackerData = action.payload;
			})
			.addCase(addToTracker.rejected, (state, action: any) => {
				state.status = false;
				state.error = action.payload?.message || 'Failed to add application to tracker';
				state.addToTrackerData = action.payload;
			});
	},
});

export { addToTracker };
export const { reset: addToTrackerReset } = addToTrackerSlice.actions;
export const addToTrackerReducer = addToTrackerSlice.reducer;
