import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

const API_URL = "http://localhost:5000/api";

const getAuthHeaders = () => ({
    headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
});

export const fetchSettings = createAsyncThunk(
    "settings/fetch",
    async (_, { rejectWithValue }) => {
        try {
            const response = await axios.get(`${API_URL}/settings`, getAuthHeaders());
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || error.message);
        }
    }
);

export const saveSettings = createAsyncThunk(
    "settings/save",
    async (formData, { rejectWithValue }) => {
        try {
            const token = localStorage.getItem("token");
            const response = await axios.put(`${API_URL}/settings/update`, formData, {
                headers: {
                    Authorization: `Bearer ${token}`,
                    "Content-Type": "multipart/form-data",
                },
            });
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || error.message);
        }
    }
);

const initialState = {
    settings: {
        companyName: "",
        companyEmail: "",
        companyPhone: "",
        websiteLogo: "",
        maintenanceMode: false
    },
    loading: false,
    error: null,
    success: false
};

const settingSlice = createSlice({
    name: "settings",
    initialState,
    reducers: {
        clearSettingsError: (state) => { state.error = null; },
        resetSettingsSuccess: (state) => { state.success = false; }
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchSettings.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchSettings.fulfilled, (state, action) => {
                state.loading = false;
                state.settings = action.payload.settings;
            })
            .addCase(fetchSettings.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })

            .addCase(saveSettings.pending, (state) => {
                state.loading = true;
                state.error = null;
                state.success = false;
            })
            .addCase(saveSettings.fulfilled, (state, action) => {
                state.loading = false;
                state.settings = action.payload.settings;
                state.success = true;
            })
            .addCase(saveSettings.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            });
    }
});

export const { clearSettingsError, resetSettingsSuccess } = settingSlice.actions;
export default settingSlice.reducer;
