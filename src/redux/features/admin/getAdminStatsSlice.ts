import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import API from '../../../config/axios.config';
import { API_ENDPOINTS } from '../../../shared/api-endpoints';

export interface AdminStatsData {
	users: { total: number; active: number };
	jobs: { total: number; admin_posted: number; ai_discovered: number };
	searches: number;
	saved_jobs: number;
	tracker_entries: number;
	tokens_consumed: number;
}

interface GetAdminStatsState {
	adminStatsData: any;
	status: boolean;
	error: string | null;
}

const initialState: GetAdminStatsState = {
	adminStatsData: null,
	status: false,
	error: null,
};

const getAdminStats = createAsyncThunk<any, void>(
	'admin/getAdminStats',
	async (_, thunkAPI) => {
		try {
			const response = await API.get(API_ENDPOINTS.GET_ADMIN_STATS);
			return response.data;
		} catch (error: any) {
			return thunkAPI.rejectWithValue(
				error.response?.data || { message: 'Failed to fetch admin stats' }
			);
		}
	}
);

const getAdminStatsSlice = createSlice({
	name: 'getAdminStats',
	initialState,
	reducers: {
		reset: () => initialState,
	},
	extraReducers: (builder) => {
		builder
			.addCase(getAdminStats.pending, (state) => {
				state.status = true;
				state.error = null;
			})
			.addCase(getAdminStats.fulfilled, (state, action: PayloadAction<any>) => {
				state.status = false;
				state.adminStatsData = action.payload;
			})
			.addCase(getAdminStats.rejected, (state, action: any) => {
				state.status = false;
				state.error = action.payload?.message || 'Failed to fetch admin stats';
				state.adminStatsData = action.payload;
			});
	},
});

export { getAdminStats };
export const { reset: getAdminStatsReset } = getAdminStatsSlice.actions;
export const getAdminStatsReducer = getAdminStatsSlice.reducer;
