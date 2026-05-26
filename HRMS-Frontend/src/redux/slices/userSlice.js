import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

// Helper to get auth header
const getAuthHeaders = () => {
    const token = localStorage.getItem("token");
    return {
        headers: {
            Authorization: `Bearer ${token}`,
        },
    };
};

// Fetch all users (Admin)
export const fetchAllUsers = createAsyncThunk(
    "users/fetchAll",
    async (_, { rejectWithValue }) => {
        try {
            const response = await axios.get(`${API_URL}/users/all`, getAuthHeaders());
            return response.data;
        } catch (error) {
            return rejectWithValue(
                error.response && error.response.data.message
                    ? error.response.data.message
                    : error.message
            );
        }
    }
);

// Delete a user (Admin)
export const deleteUser = createAsyncThunk(
    "users/delete",
    async (userId, { rejectWithValue }) => {
        try {
            await axios.delete(`${API_URL}/users/${userId}`, getAuthHeaders());
            return userId;
        } catch (error) {
            return rejectWithValue(
                error.response && error.response.data.message
                    ? error.response.data.message
                    : error.message
            );
        }
    }
);

// Update user status and details (Admin) - block / activate / edit details & roles
export const updateUserStatus = createAsyncThunk(
    "users/updateStatus",
    async ({ userId, ...payload }, { rejectWithValue }) => {
        try {
            const response = await axios.put(
                `${API_URL}/users/${userId}/status`,
                payload,
                getAuthHeaders()
            );
            return response.data;
        } catch (error) {
            return rejectWithValue(
                error.response && error.response.data.message
                    ? error.response.data.message
                    : error.message
            );
        }
    }
);

// Initial State
const initialState = {
    users: [],
    loading: false,
    error: null,
    deleteLoading: false,
    statusLoading: false,
};

// Slice
const userSlice = createSlice({
    name: "users",
    initialState,
    reducers: {
        clearUserError: (state) => {
            state.error = null;
        },
    },
    extraReducers: (builder) => {
        builder
            // Fetch All Users
            .addCase(fetchAllUsers.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchAllUsers.fulfilled, (state, action) => {
                state.loading = false;
                state.users = action.payload.users;
            })
            .addCase(fetchAllUsers.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })

            // Delete User
            .addCase(deleteUser.pending, (state) => {
                state.deleteLoading = true;
                state.error = null;
            })
            .addCase(deleteUser.fulfilled, (state, action) => {
                state.deleteLoading = false;
                state.users = state.users.filter(u => u._id !== action.payload);
            })
            .addCase(deleteUser.rejected, (state, action) => {
                state.deleteLoading = false;
                state.error = action.payload;
            })

            // Update User Status
            .addCase(updateUserStatus.pending, (state) => {
                state.statusLoading = true;
                state.error = null;
            })
            .addCase(updateUserStatus.fulfilled, (state, action) => {
                state.statusLoading = false;
                const updated = action.payload.user;
                const idx = state.users.findIndex(u => u._id === updated._id);
                if (idx !== -1) {
                    state.users[idx] = { ...state.users[idx], ...updated };
                }
            })
            .addCase(updateUserStatus.rejected, (state, action) => {
                state.statusLoading = false;
                state.error = action.payload;
            });
    },
});

export const { clearUserError } = userSlice.actions;
export default userSlice.reducer;
