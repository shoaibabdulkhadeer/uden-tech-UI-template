import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import API from '../../../config/axios.config';
import { API_ENDPOINTS } from '../../../shared/api-endpoints';

interface GetJobByIdState {
	jobByIdData: any;
	status: boolean;
	error: string | null;
}

const initialState: GetJobByIdState = {
	jobByIdData: null,
	status: false,
	error: null,
};

const getJobById = createAsyncThunk<any, string>(
	'jobSearch/getJobById',
	async (jobId, thunkAPI) => {
		try {
			const response = await API.get(API_ENDPOINTS.JOB_GET_BY_ID.replace('{job_id}', jobId));
			return response.data;
		} catch (error: any) {
			return thunkAPI.rejectWithValue(
				error.response?.data || { message: 'Failed to fetch job details' }
			);
		}
	}
);

const getJobByIdSlice = createSlice({
	name: 'getJobById',
	initialState,
	reducers: {
		reset: () => initialState,
	},
	extraReducers: (builder) => {
		builder
			.addCase(getJobById.pending, (state) => {
				state.status = true;
				state.error = null;
			})
			.addCase(getJobById.fulfilled, (state, action: PayloadAction<any>) => {
				state.status = false;
				state.jobByIdData = action.payload;
			})
			.addCase(getJobById.rejected, (state, action: any) => {
				state.status = false;
				state.error = action.payload?.message || 'Failed to fetch job details';
				state.jobByIdData = action.payload;
			});
	},
});

export { getJobById };
export const { reset: getJobByIdReset } = getJobByIdSlice.actions;
export const getJobByIdReducer = getJobByIdSlice.reducer;
