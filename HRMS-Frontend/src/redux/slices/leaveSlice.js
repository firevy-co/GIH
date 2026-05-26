import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

const getAuthHeaders = () => ({
    headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
});

export const fetchLeaves = createAsyncThunk(
    "leaves/fetchAll",
    async (params = {}, { rejectWithValue }) => {
        try {
            const query = new URLSearchParams(params).toString();
            const response = await axios.get(`${API_URL}/leaves/history?${query}`, getAuthHeaders());
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || error.message);
        }
    }
);

export const applyLeave = createAsyncThunk(
    "leaves/apply",
    async (data, { rejectWithValue }) => {
        try {
            const response = await axios.post(`${API_URL}/leaves/apply`, data, getAuthHeaders());
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || error.message);
        }
    }
);

export const approveLeave = createAsyncThunk(
    "leaves/approve",
    async (id, { rejectWithValue }) => {
        try {
            const response = await axios.put(`${API_URL}/leaves/approve/${id}`, {}, getAuthHeaders());
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || error.message);
        }
    }
);

export const rejectLeave = createAsyncThunk(
    "leaves/reject",
    async (id, { rejectWithValue }) => {
        try {
            const response = await axios.put(`${API_URL}/leaves/reject/${id}`, {}, getAuthHeaders());
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || error.message);
        }
    }
);

const initialState = {
    leaves: [],
    loading: false,
    error: null,
};

const leaveSlice = createSlice({
    name: "leaves",
    initialState,
    reducers: {
        clearLeaveError: (state) => { state.error = null; },
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchLeaves.pending, (state) => { state.loading = true; state.error = null; })
            .addCase(fetchLeaves.fulfilled, (state, action) => { state.loading = false; state.leaves = action.payload.leaves; })
            .addCase(fetchLeaves.rejected, (state, action) => { state.loading = false; state.error = action.payload; })

            .addCase(applyLeave.fulfilled, (state, action) => { state.leaves.unshift(action.payload.leave); })
            .addCase(applyLeave.rejected, (state, action) => { state.error = action.payload; })

            .addCase(approveLeave.fulfilled, (state, action) => {
                const updated = action.payload.leave;
                const idx = state.leaves.findIndex(l => l._id === updated._id);
                if (idx !== -1) state.leaves[idx] = updated;
            })
            .addCase(approveLeave.rejected, (state, action) => { state.error = action.payload; })

            .addCase(rejectLeave.fulfilled, (state, action) => {
                const updated = action.payload.leave;
                const idx = state.leaves.findIndex(l => l._id === updated._id);
                if (idx !== -1) state.leaves[idx] = updated;
            })
            .addCase(rejectLeave.rejected, (state, action) => { state.error = action.payload; });
    },
});

export const { clearLeaveError } = leaveSlice.actions;
export default leaveSlice.reducer;
