import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import API from '../../../config/axios.config';
import { API_ENDPOINTS } from '../../../shared/api-endpoints';
interface ResponseData {
    code: number;
    message: string;
    data: any;
}
//#region viewEaching quiz Data
const viewEachQuizAPI = createAsyncThunk('viewEachQuizRes', async (data:any,thunkAPI) => {
    try {
        const response = await API.post(
                `${API_ENDPOINTS.VIEW_EACH_QUIZ}`, data
            );
        return response.data;
    } catch (error: any) {
      return thunkAPI.rejectWithValue(
        error.response?.data || { message: 'Failed to viewEach quiz' }
      );
    }
});
//#endregion

interface viewEachQuizState {
    viewEachQuizRes: ResponseData | any;
    viewEachQuizloading: boolean;
    viewEachQuizError: string;
}

const initialState: viewEachQuizState = {
    viewEachQuizRes: [],
    viewEachQuizloading: false,
    viewEachQuizError: ''
};

const viewEachQuizSlice = createSlice({
    name: 'viewEachQuizRes',
    initialState,
    reducers: {
        reset: (state) => {
            state.viewEachQuizRes = [];
            state.viewEachQuizRes = initialState.viewEachQuizRes;
            state.viewEachQuizloading = false;
            state.viewEachQuizError = '';
        }
    },
    extraReducers: (builder) => {
        builder
            .addCase(viewEachQuizAPI.pending, (state) => {
                state.viewEachQuizloading = true;
                state.viewEachQuizError = '';
            })
            .addCase(viewEachQuizAPI.fulfilled, (state, action) => {
                state.viewEachQuizRes = action.payload;
                state.viewEachQuizloading = false;
                state.viewEachQuizError = '';
            })
            .addCase(viewEachQuizAPI.rejected, (state, action) => {
                state.viewEachQuizRes = [];
                state.viewEachQuizloading = false;
                state.viewEachQuizError = '';
            });
    }
});

export {viewEachQuizAPI };
export const { reset: resetviewEachQuiz } = viewEachQuizSlice.actions;
export const viewEachQuizStateSlice = viewEachQuizSlice.reducer;
