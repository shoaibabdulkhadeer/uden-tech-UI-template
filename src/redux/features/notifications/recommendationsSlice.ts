import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import API from '../../../config/axios.config';
import { API_ENDPOINTS } from '../../../shared/api-endpoints';

interface RecommendationMatch {
  job_id: string;
  title: string;
  company: string;
  fit_score: number;
  fit_bucket: string;
  explanation: string;
  matched_skills: string[];
  missing_skills: string[];
}

interface RecommendationsState {
  matches: RecommendationMatch[];
  total: number;
  status: boolean;
  error: string | null;
  fetched: boolean;
}

const initialState: RecommendationsState = {
  matches: [],
  total: 0,
  status: false,
  error: null,
  fetched: false,
};

const fetchRecommendations = createAsyncThunk<any, void>(
  'recommendations/fetchRecommendations',
  async (_, thunkAPI) => {
    try {
      const response = await API.get(`${API_ENDPOINTS.RECOMMENDATIONS}?pageId=1&pageLimit=10`);
      return response.data;
    } catch (error: any) {
      return thunkAPI.rejectWithValue(
        error.response?.data || { message: 'Failed to fetch recommendations' }
      );
    }
  }
);

const recommendationsSlice = createSlice({
  name: 'recommendations',
  initialState,
  reducers: {
    reset: () => initialState,
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchRecommendations.pending, (state) => {
        state.status = true;
        state.error = null;
      })
      .addCase(fetchRecommendations.fulfilled, (state, action: PayloadAction<any>) => {
        state.status = false;
        state.fetched = true;
        state.matches = action.payload?.data?.matches || [];
        state.total = action.payload?.data?.total || 0;
      })
      .addCase(fetchRecommendations.rejected, (state, action: any) => {
        state.status = false;
        state.fetched = true;
        state.error = action.payload?.message || 'Failed to fetch recommendations';
      });
  },
});

export { fetchRecommendations };
export const { reset: recommendationsReset } = recommendationsSlice.actions;
export const recommendationsReducer = recommendationsSlice.reducer;
