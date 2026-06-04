import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import API from '../../../config/axios.config';
import { API_ENDPOINTS } from '../../../shared/api-endpoints';

interface CheckUrlState {
	checkUrlData: any;
	status: boolean;
	error: string | null;
}

const initialState: CheckUrlState = {
	checkUrlData: null,
	status: false,
	error: null,
};

const checkUrl = createAsyncThunk<any, string>(
	'admin/checkUrl',
	async (url, thunkAPI) => {
		try {
			const response = await API.post(API_ENDPOINTS.CHECK_URL, { url });
			return response.data;
		} catch (error: any) {
			return thunkAPI.rejectWithValue(
				error.response?.data || { message: 'Failed to check URL' }
			);
		}
	}
);

const checkUrlSlice = createSlice({
	name: 'checkUrl',
	initialState,
	reducers: {
		reset: () => initialState,
	},
	extraReducers: (builder) => {
		builder
			.addCase(checkUrl.pending, (state) => {
				state.status = true;
				state.error = null;
				state.checkUrlData = null;
			})
			.addCase(checkUrl.fulfilled, (state, action: PayloadAction<any>) => {
				state.status = false;
				state.checkUrlData = action.payload;
			})
			.addCase(checkUrl.rejected, (state, action: any) => {
				state.status = false;
				state.error = action.payload?.message || 'Failed to check URL';
				state.checkUrlData = action.payload;
			});
	},
});

export { checkUrl };
export const { reset: checkUrlReset } = checkUrlSlice.actions;
export const checkUrlReducer = checkUrlSlice.reducer;
