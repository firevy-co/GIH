import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

const API_URL = "http://localhost:5000/api";

const getAuthHeaders = () => ({
    headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
});

export const fetchNotifications = createAsyncThunk(
    "notifications/fetchAll",
    async (params = {}, { rejectWithValue }) => {
        try {
            const query = new URLSearchParams(params).toString();
            const response = await axios.get(`${API_URL}/notifications?${query}`, getAuthHeaders());
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || error.message);
        }
    }
);

export const sendNotification = createAsyncThunk(
    "notifications/send",
    async (data, { rejectWithValue }) => {
        try {
            const response = await axios.post(`${API_URL}/notifications/send`, data, getAuthHeaders());
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || error.message);
        }
    }
);

export const markNotificationRead = createAsyncThunk(
    "notifications/markRead",
    async (id, { rejectWithValue }) => {
        try {
            const response = await axios.put(`${API_URL}/notifications/read/${id}`, {}, getAuthHeaders());
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || error.message);
        }
    }
);

// Fetch user dashboard summary
export const fetchUserDashboard = createAsyncThunk(
    "notifications/fetchUserDashboard",
    async (_, { rejectWithValue }) => {
        try {
            const response = await axios.get(`${API_URL}/dashboard/user`, getAuthHeaders());
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || error.message);
        }
    }
);

const initialState = {
    notifications: [],
    userDashboard: null,
    loading: false,
    dashboardLoading: false,
    error: null,
};

const notificationSlice = createSlice({
    name: "notifications",
    initialState,
    reducers: {
        clearNotificationError: (state) => { state.error = null; },
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchNotifications.pending, (state) => { state.loading = true; state.error = null; })
            .addCase(fetchNotifications.fulfilled, (state, action) => { state.loading = false; state.notifications = action.payload.notifications; })
            .addCase(fetchNotifications.rejected, (state, action) => { state.loading = false; state.error = action.payload; })

            .addCase(sendNotification.fulfilled, (state, action) => { state.notifications.unshift(action.payload.notification); })
            .addCase(sendNotification.rejected, (state, action) => { state.error = action.payload; })

            .addCase(markNotificationRead.fulfilled, (state, action) => {
                const updated = action.payload.notification;
                const idx = state.notifications.findIndex(n => n._id === updated._id);
                if (idx !== -1) state.notifications[idx] = updated;
            })

            .addCase(fetchUserDashboard.pending, (state) => { state.dashboardLoading = true; })
            .addCase(fetchUserDashboard.fulfilled, (state, action) => { state.dashboardLoading = false; state.userDashboard = action.payload.dashboard; })
            .addCase(fetchUserDashboard.rejected, (state, action) => { state.dashboardLoading = false; state.error = action.payload; });
    },
});

export const { clearNotificationError } = notificationSlice.actions;
export default notificationSlice.reducer;
