import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import API from '../../../config/axios.config';
import { API_ENDPOINTS } from '../../../shared/api-endpoints';

interface ExtractJobUrlState {
	extractJobUrlData: any;
	status: boolean;
	error: string | null;
}

const initialState: ExtractJobUrlState = {
	extractJobUrlData: null,
	status: false,
	error: null,
};

const extractJobUrl = createAsyncThunk<any, { url: string }>(
	'admin/extractJobUrl',
	async (payload, thunkAPI) => {
		try {
			const response = await API.post(API_ENDPOINTS.EXTRACT_JOB_URL, payload);
			return response.data;
		} catch (error: any) {
			return thunkAPI.rejectWithValue(
				error.response?.data || { message: 'Failed to extract job from URL' }
			);
		}
	}
);

const extractJobUrlSlice = createSlice({
	name: 'extractJobUrl',
	initialState,
	reducers: {
		reset: () => initialState,
	},
	extraReducers: (builder) => {
		builder
			.addCase(extractJobUrl.pending, (state) => {
				state.status = true;
				state.error = null;
			})
			.addCase(extractJobUrl.fulfilled, (state, action: PayloadAction<any>) => {
				state.status = false;
				state.extractJobUrlData = action.payload;
			})
			.addCase(extractJobUrl.rejected, (state, action: any) => {
				state.status = false;
				state.error = action.payload?.message || 'Failed to extract job from URL';
				state.extractJobUrlData = action.payload;
			});
	},
});

export { extractJobUrl };
export const { reset: extractJobUrlReset } = extractJobUrlSlice.actions;
export const extractJobUrlReducer = extractJobUrlSlice.reducer;
