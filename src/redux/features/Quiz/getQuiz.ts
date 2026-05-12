import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import API from '../../../config/axios.config';
import { API_ENDPOINTS } from '../../../shared/api-endpoints';
interface ResponseData {
	code: number;
	message: string;
	data: any;
}
//#region fetching quiz questions Data
const getQuizAPI = createAsyncThunk(
  'getQuizRes',
  async (data:any, thunkAPI) => {
    try {
      const response = await API.post(`${API_ENDPOINTS.GET_QUIZ}`,data);
      return response.data;
    } catch (error: any) {
      return thunkAPI.rejectWithValue(
        error.response?.data || { message: 'Failed to fetch questions' }
      );
    }
  }
);
//#endregion

interface getQuizState {
	getQuizRes: ResponseData | any;
	getQuizloading: boolean;
	getQuizError: string;
}

const initialState: getQuizState = {
    getQuizRes: [],
	getQuizloading: false,
	getQuizError: ''
};

const getQuizSlice = createSlice({
	name: 'getQuizRes',
	initialState,
	reducers: {
		reset: (state) => {
			state.getQuizRes = [];
			state.getQuizRes = initialState.getQuizRes;
			state.getQuizloading = false;
			state.getQuizError = '';
		}
	},
	extraReducers: (builder) => {
		builder
			.addCase(getQuizAPI.pending, (state) => {
				state.getQuizloading = true;
				state.getQuizError = '';
			})
			.addCase(getQuizAPI.fulfilled, (state, action) => {
				state.getQuizRes = action.payload;
				state.getQuizloading = false;
				state.getQuizError = '';
			})
			.addCase(getQuizAPI.rejected, (state, action) => {
				state.getQuizRes = [];
				state.getQuizloading = false;
				state.getQuizError = '';
			});
	}
});

export {getQuizAPI };
export const { reset: resetgetQuiz } = getQuizSlice.actions;
export const getQuizStateSlice = getQuizSlice.reducer;
