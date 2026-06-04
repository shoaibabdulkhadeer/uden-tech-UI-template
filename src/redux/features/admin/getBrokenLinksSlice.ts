import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import API from '../../../config/axios.config';
import { API_ENDPOINTS } from '../../../shared/api-endpoints';

export interface GetBrokenLinksParams {
	pageId?: number;
	pageLimit?: number;
}

interface GetBrokenLinksState {
	brokenLinksData: any;
	status: boolean;
	error: string | null;
}

const initialState: GetBrokenLinksState = {
	brokenLinksData: null,
	status: false,
	error: null,
};

const getBrokenLinks = createAsyncThunk<any, GetBrokenLinksParams>(
	'admin/getBrokenLinks',
	async ({ pageId = 1, pageLimit = 10 }, thunkAPI) => {
		try {
			const response = await API.get(API_ENDPOINTS.GET_BROKEN_LINKS, {
				params: { pageId, pageLimit },
			});
			return response.data;
		} catch (error: any) {
			return thunkAPI.rejectWithValue(
				error.response?.data || { message: 'Failed to fetch broken links' }
			);
		}
	}
);

const getBrokenLinksSlice = createSlice({
	name: 'getBrokenLinks',
	initialState,
	reducers: {
		reset: () => initialState,
	},
	extraReducers: (builder) => {
		builder
			.addCase(getBrokenLinks.pending, (state) => {
				state.status = true;
				state.error = null;
			})
			.addCase(getBrokenLinks.fulfilled, (state, action: PayloadAction<any>) => {
				state.status = false;
				state.brokenLinksData = action.payload;
			})
			.addCase(getBrokenLinks.rejected, (state, action: any) => {
				state.status = false;
				state.error = action.payload?.message || 'Failed to fetch broken links';
				state.brokenLinksData = action.payload;
			});
	},
});

export { getBrokenLinks };
export const { reset: getBrokenLinksReset } = getBrokenLinksSlice.actions;
export const getBrokenLinksReducer = getBrokenLinksSlice.reducer;
