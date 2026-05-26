import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

const API_URL = "http://localhost:5000/api";

const getAuthHeaders = () => ({
    headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
});

// Fetch Admin Dashboard Summary
export const fetchAdminDashboard = createAsyncThunk(
    "dashboard/fetchAdmin",
    async (_, { rejectWithValue }) => {
        try {
            const response = await axios.get(`${API_URL}/dashboard/admin`, getAuthHeaders());
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || error.message);
        }
    }
);

// Fetch Analytics Data (charts)
export const fetchAnalytics = createAsyncThunk(
    "dashboard/fetchAnalytics",
    async (_, { rejectWithValue }) => {
        try {
            const response = await axios.get(`${API_URL}/dashboard/analytics`, getAuthHeaders());
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || error.message);
        }
    }
);

const initialState = {
    stats: null,
    analytics: null,
    loading: false,
    analyticsLoading: false,
    error: null,
};

const dashboardSlice = createSlice({
    name: "dashboard",
    initialState,
    reducers: {
        clearDashboardError: (state) => { state.error = null; },
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchAdminDashboard.pending, (state) => { state.loading = true; state.error = null; })
            .addCase(fetchAdminDashboard.fulfilled, (state, action) => { state.loading = false; state.stats = action.payload.dashboard; })
            .addCase(fetchAdminDashboard.rejected, (state, action) => { state.loading = false; state.error = action.payload; })

            .addCase(fetchAnalytics.pending, (state) => { state.analyticsLoading = true; })
            .addCase(fetchAnalytics.fulfilled, (state, action) => { state.analyticsLoading = false; state.analytics = action.payload.analytics; })
            .addCase(fetchAnalytics.rejected, (state, action) => { state.analyticsLoading = false; state.error = action.payload; });
    },
});

export const { clearDashboardError } = dashboardSlice.actions;
export default dashboardSlice.reducer;
