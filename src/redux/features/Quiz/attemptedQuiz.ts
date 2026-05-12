import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import API from '../../../config/axios.config';
import { API_ENDPOINTS } from '../../../shared/api-endpoints';
interface ResponseData {
    code: number;
    message: string;
    data: any;
}
//#region attempteding quiz Data
const attemptedQuizAPI = createAsyncThunk('attemptedQuizRes', async (data:any,thunkAPI) => {
    try {
        const response = await API.post(
                `${API_ENDPOINTS.ATTEMPTED_QUIZZES}`, data
            );
        return response.data;
    } catch (error: any) {
      return thunkAPI.rejectWithValue(
        error.response?.data || { message: 'Failed to attempted quiz' }
      );
    }
});
//#endregion

interface attemptedQuizState {
    attemptedQuizRes: ResponseData | any;
    attemptedQuizloading: boolean;
    attemptedQuizError: string;
}

const initialState: attemptedQuizState = {
    attemptedQuizRes: [],
    attemptedQuizloading: false,
    attemptedQuizError: ''
};

const attemptedQuizSlice = createSlice({
    name: 'attemptedQuizRes',
    initialState,
    reducers: {
        reset: (state) => {
            state.attemptedQuizRes = [];
            state.attemptedQuizRes = initialState.attemptedQuizRes;
            state.attemptedQuizloading = false;
            state.attemptedQuizError = '';
        }
    },
    extraReducers: (builder) => {
        builder
            .addCase(attemptedQuizAPI.pending, (state) => {
                state.attemptedQuizloading = true;
                state.attemptedQuizError = '';
            })
            .addCase(attemptedQuizAPI.fulfilled, (state, action) => {
                state.attemptedQuizRes = action.payload;
                state.attemptedQuizloading = false;
                state.attemptedQuizError = '';
            })
            .addCase(attemptedQuizAPI.rejected, (state, action) => {
                state.attemptedQuizRes = [];
                state.attemptedQuizloading = false;
                state.attemptedQuizError = '';
            });
    }
});

export {attemptedQuizAPI };
export const { reset: resetattemptedQuiz } = attemptedQuizSlice.actions;
export const attemptedQuizStateSlice = attemptedQuizSlice.reducer;
