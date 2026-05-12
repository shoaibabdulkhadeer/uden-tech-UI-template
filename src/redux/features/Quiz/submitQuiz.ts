import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import API from '../../../config/axios.config';
import { API_ENDPOINTS } from '../../../shared/api-endpoints';
interface ResponseData {
    code: number;
    message: string;
    data: any;
}
//#region submiting quiz Data
const submitQuizAPI = createAsyncThunk('submitQuizRes', async (data:any,thunkAPI) => {
    try {
        const response = await API.post(
                `${API_ENDPOINTS.SUBMIT_QUIZ}`, data
            );
        return response.data;
    } catch (error: any) {
      return thunkAPI.rejectWithValue(
        error.response?.data || { message: 'Failed to submit quiz' }
      );
    }
});
//#endregion

interface submitQuizState {
    submitQuizRes: ResponseData | any;
    submitQuizloading: boolean;
    submitQuizError: string;
}

const initialState: submitQuizState = {
    submitQuizRes: [],
    submitQuizloading: false,
    submitQuizError: ''
};

const submitQuizSlice = createSlice({
    name: 'submitQuizRes',
    initialState,
    reducers: {
        reset: (state) => {
            state.submitQuizRes = [];
            state.submitQuizRes = initialState.submitQuizRes;
            state.submitQuizloading = false;
            state.submitQuizError = '';
        }
    },
    extraReducers: (builder) => {
        builder
            .addCase(submitQuizAPI.pending, (state) => {
                state.submitQuizloading = true;
                state.submitQuizError = '';
            })
            .addCase(submitQuizAPI.fulfilled, (state, action) => {
                state.submitQuizRes = action.payload;
                state.submitQuizloading = false;
                state.submitQuizError = '';
            })
            .addCase(submitQuizAPI.rejected, (state, action) => {
                state.submitQuizRes = [];
                state.submitQuizloading = false;
                state.submitQuizError = '';
            });
    }
});

export {submitQuizAPI };
export const { reset: resetsubmitQuiz } = submitQuizSlice.actions;
export const submitQuizStateSlice = submitQuizSlice.reducer;
