// features/tokenSlice.ts
import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import API from '../../../config/axios.config';
import { API_ENDPOINTS } from '../../../shared/api-endpoints';

interface TokenState {
  tokenDetails: any;
  status: boolean;
  error: string | null;
}

const initialState: TokenState = {
  tokenDetails: {},
  status: false,
  error: null,
};

const getTokenDetails = createAsyncThunk<any>(
  'token/getDetails',
  async (_, thunkAPI) => {
    try {
      const response = await API.post(API_ENDPOINTS.GET_TOKEN_DETAILS); // Change endpoint accordingly
      return response.data;
    } catch (error: any) {
      return thunkAPI.rejectWithValue(
        error.response?.data || { message: 'Failed to fetch token details' }
      );
    }
  }
);

const tokenSlice = createSlice({
  name: 'token',
  initialState,
  reducers: {
    reset: () => initialState,
  },
  extraReducers: (builder) => {
    builder
      .addCase(getTokenDetails.pending, (state) => {
        state.status = true;
        state.error = null;
      })
      .addCase(getTokenDetails.fulfilled, (state, action: PayloadAction<any>) => {
        state.status = false;
        state.tokenDetails = action.payload;
      })
      .addCase(getTokenDetails.rejected, (state, action: any) => {
        state.status = false;
        state.error = action.payload?.message || 'Failed to fetch token details';
      });
  },
});

export { getTokenDetails };
export const { reset: tokenReset } = tokenSlice.actions;
export const tokenReducer = tokenSlice.reducer;
