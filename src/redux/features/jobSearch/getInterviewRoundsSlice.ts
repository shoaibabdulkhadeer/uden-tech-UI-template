import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import API from '../../../config/axios.config';
import { API_ENDPOINTS } from '../../../shared/api-endpoints';

export interface InterviewRound {
	round: number;
	name: string;
	subtitle?: string;
}

export interface GetInterviewRoundsPayload {
	company: string;
	role: string;
}

interface GetInterviewRoundsState {
	interviewRoundsData: any;
	status: boolean;
	error: string | null;
}

const initialState: GetInterviewRoundsState = {
	interviewRoundsData: null,
	status: false,
	error: null,
};

const getInterviewRounds = createAsyncThunk<any, GetInterviewRoundsPayload>(
	'interview/getInterviewRounds',
	async ({ company, role }, thunkAPI) => {
		try {
			const response = await API.get(API_ENDPOINTS.GET_INTERVIEW_ROUNDS, {
				params: { company, role },
			});
			return response.data;
		} catch (error: any) {
			return thunkAPI.rejectWithValue(
				error.response?.data || { message: 'Failed to fetch interview rounds' }
			);
		}
	}
);

const getInterviewRoundsSlice = createSlice({
	name: 'getInterviewRounds',
	initialState,
	reducers: {
		reset: () => initialState,
	},
	extraReducers: (builder) => {
		builder
			.addCase(getInterviewRounds.pending, (state) => {
				state.status = true;
				state.error = null;
			})
			.addCase(getInterviewRounds.fulfilled, (state, action: PayloadAction<any>) => {
				state.status = false;
				state.interviewRoundsData = action.payload;
			})
			.addCase(getInterviewRounds.rejected, (state, action: any) => {
				state.status = false;
				state.error = action.payload?.message || 'Failed to fetch interview rounds';
				state.interviewRoundsData = action.payload;
			});
	},
});

export { getInterviewRounds };
export const { reset: getInterviewRoundsReset } = getInterviewRoundsSlice.actions;
export const getInterviewRoundsReducer = getInterviewRoundsSlice.reducer;
