import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

const getAuthHeaders = () => ({
    headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
});

export const fetchInvestments = createAsyncThunk(
    "investments/fetchAll",
    async (_, { rejectWithValue }) => {
        try {
            const response = await axios.get(`${API_URL}/investments`, getAuthHeaders());
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || error.message);
        }
    }
);

export const createInvestment = createAsyncThunk(
    "investments/create",
    async (data, { rejectWithValue }) => {
        try {
            const response = await axios.post(`${API_URL}/investments/create`, data, getAuthHeaders());
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || error.message);
        }
    }
);

export const updateInvestment = createAsyncThunk(
    "investments/update",
    async ({ id, data }, { rejectWithValue }) => {
        try {
            const response = await axios.put(`${API_URL}/investments/update/${id}`, data, getAuthHeaders());
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || error.message);
        }
    }
);

export const deleteInvestment = createAsyncThunk(
    "investments/delete",
    async (id, { rejectWithValue }) => {
        try {
            await axios.delete(`${API_URL}/investments/delete/${id}`, getAuthHeaders());
            return id;
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || error.message);
        }
    }
);

const initialState = {
    investments: [],
    loading: false,
    error: null,
};

const investmentSlice = createSlice({
    name: "investments",
    initialState,
    reducers: {
        clearInvestmentError: (state) => { state.error = null; },
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchInvestments.pending, (state) => { state.loading = true; state.error = null; })
            .addCase(fetchInvestments.fulfilled, (state, action) => { state.loading = false; state.investments = action.payload.investments; })
            .addCase(fetchInvestments.rejected, (state, action) => { state.loading = false; state.error = action.payload; })

            .addCase(createInvestment.fulfilled, (state, action) => { state.investments.unshift(action.payload.investment); })
            .addCase(createInvestment.rejected, (state, action) => { state.error = action.payload; })

            .addCase(updateInvestment.fulfilled, (state, action) => {
                const updated = action.payload.investment;
                const idx = state.investments.findIndex(i => i._id === updated._id);
                if (idx !== -1) state.investments[idx] = updated;
            })
            .addCase(updateInvestment.rejected, (state, action) => { state.error = action.payload; })

            .addCase(deleteInvestment.fulfilled, (state, action) => {
                state.investments = state.investments.filter(i => i._id !== action.payload);
            })
            .addCase(deleteInvestment.rejected, (state, action) => { state.error = action.payload; });
    },
});

export const { clearInvestmentError } = investmentSlice.actions;
export default investmentSlice.reducer;
