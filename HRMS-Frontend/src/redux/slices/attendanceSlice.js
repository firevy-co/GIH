import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

const getAuthHeaders = () => ({
    headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
});

export const fetchAttendance = createAsyncThunk(
    "attendance/fetchAll",
    async (params = {}, { rejectWithValue }) => {
        try {
            const query = new URLSearchParams(params).toString();
            const response = await axios.get(`${API_URL}/attendance?${query}`, getAuthHeaders());
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || error.message);
        }
    }
);

export const checkInEmployee = createAsyncThunk(
    "attendance/checkIn",
    async (data, { rejectWithValue }) => {
        try {
            const response = await axios.post(`${API_URL}/attendance/check-in`, data, getAuthHeaders());
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || error.message);
        }
    }
);

export const checkOutEmployee = createAsyncThunk(
    "attendance/checkOut",
    async (data, { rejectWithValue }) => {
        try {
            const response = await axios.post(`${API_URL}/attendance/check-out`, data, getAuthHeaders());
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || error.message);
        }
    }
);

export const updateAttendance = createAsyncThunk(
    "attendance/update",
    async ({ id, data }, { rejectWithValue }) => {
        try {
            const response = await axios.put(`${API_URL}/attendance/${id}`, data, getAuthHeaders());
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || error.message);
        }
    }
);

export const deleteAttendance = createAsyncThunk(
    "attendance/delete",
    async (id, { rejectWithValue }) => {
        try {
            await axios.delete(`${API_URL}/attendance/${id}`, getAuthHeaders());
            return id;
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || error.message);
        }
    }
);

const initialState = {
    records: [],
    loading: false,
    error: null,
};

const attendanceSlice = createSlice({
    name: "attendance",
    initialState,
    reducers: {
        clearAttendanceError: (state) => { state.error = null; },
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchAttendance.pending, (state) => { state.loading = true; state.error = null; })
            .addCase(fetchAttendance.fulfilled, (state, action) => { state.loading = false; state.records = action.payload.attendance; })
            .addCase(fetchAttendance.rejected, (state, action) => { state.loading = false; state.error = action.payload; })

            .addCase(checkInEmployee.fulfilled, (state, action) => { state.records.unshift(action.payload.attendance); })
            .addCase(checkOutEmployee.fulfilled, (state, action) => {
                const updated = action.payload.attendance;
                const idx = state.records.findIndex(r => r._id === updated._id);
                if (idx !== -1) state.records[idx] = updated;
            })

            .addCase(updateAttendance.fulfilled, (state, action) => {
                const updated = action.payload.attendance;
                const idx = state.records.findIndex(r => r._id === updated._id);
                if (idx !== -1) state.records[idx] = updated;
            })

            .addCase(deleteAttendance.fulfilled, (state, action) => {
                state.records = state.records.filter(r => r._id !== action.payload);
            });
    },
});

export const { clearAttendanceError } = attendanceSlice.actions;
export default attendanceSlice.reducer;
