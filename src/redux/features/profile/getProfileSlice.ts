import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import API from '../../../config/axios.config';
import { API_ENDPOINTS } from '../../../shared/api-endpoints';

interface GetProfileState {
	profileData: any;
	status: boolean;
	error: string | null;
}

const initialState: GetProfileState = {
	profileData: null,
	status: false,
	error: null,
};

const getProfile = createAsyncThunk<any, string>(
	'profile/getProfile',
	async (userId, thunkAPI) => {
		try {
			const response = await API.get(API_ENDPOINTS.GET_PROFILE.replace('{user_id}', userId));
			return response.data;
		} catch (error: any) {
			return thunkAPI.rejectWithValue(
				error.response?.data || { message: 'Failed to fetch profile' }
			);
		}
	}
);

const getProfileSlice = createSlice({
	name: 'getProfile',
	initialState,
	reducers: {
		reset: () => initialState,
	},
	extraReducers: (builder) => {
		builder
			.addCase(getProfile.pending, (state) => {
				state.status = true;
				state.error = null;
			})
			.addCase(getProfile.fulfilled, (state, action: PayloadAction<any>) => {
				state.status = false;
				state.profileData = action.payload;
			})
			.addCase(getProfile.rejected, (state, action: any) => {
				state.status = false;
				state.error = action.payload?.message || 'Failed to fetch profile';
				state.profileData = action.payload;
			});
	},
});

export { getProfile };
export const { reset: getProfileReset } = getProfileSlice.actions;
export const getProfileReducer = getProfileSlice.reducer;
