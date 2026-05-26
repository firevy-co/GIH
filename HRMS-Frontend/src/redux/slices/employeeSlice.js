import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

const API_URL = "http://localhost:5000/api";

const getAuthHeaders = () => ({
    headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
});

export const fetchEmployees = createAsyncThunk(
    "employees/fetchAll",
    async (_, { rejectWithValue }) => {
        try {
            const response = await axios.get(`${API_URL}/employees`, getAuthHeaders());
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || error.message);
        }
    }
);

export const createEmployee = createAsyncThunk(
    "employees/create",
    async (data, { rejectWithValue }) => {
        try {
            const response = await axios.post(`${API_URL}/employees`, data, getAuthHeaders());
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || error.message);
        }
    }
);

export const updateEmployee = createAsyncThunk(
    "employees/update",
    async ({ id, data }, { rejectWithValue }) => {
        try {
            const response = await axios.put(`${API_URL}/employees/${id}`, data, getAuthHeaders());
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || error.message);
        }
    }
);

export const deleteEmployee = createAsyncThunk(
    "employees/delete",
    async (id, { rejectWithValue }) => {
        try {
            await axios.delete(`${API_URL}/employees/${id}`, getAuthHeaders());
            return id;
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || error.message);
        }
    }
);

const initialState = {
    employees: [],
    loading: false,
    error: null,
};

const employeeSlice = createSlice({
    name: "employees",
    initialState,
    reducers: {
        clearEmployeeError: (state) => { state.error = null; },
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchEmployees.pending, (state) => { state.loading = true; state.error = null; })
            .addCase(fetchEmployees.fulfilled, (state, action) => { state.loading = false; state.employees = action.payload.employees; })
            .addCase(fetchEmployees.rejected, (state, action) => { state.loading = false; state.error = action.payload; })

            .addCase(createEmployee.fulfilled, (state, action) => { state.employees.unshift(action.payload.employee); })
            .addCase(createEmployee.rejected, (state, action) => { state.error = action.payload; })

            .addCase(updateEmployee.fulfilled, (state, action) => {
                const updated = action.payload.employee;
                const idx = state.employees.findIndex(e => e._id === updated._id);
                if (idx !== -1) state.employees[idx] = updated;
            })
            .addCase(updateEmployee.rejected, (state, action) => { state.error = action.payload; })

            .addCase(deleteEmployee.fulfilled, (state, action) => {
                state.employees = state.employees.filter(e => e._id !== action.payload);
            })
            .addCase(deleteEmployee.rejected, (state, action) => { state.error = action.payload; });
    },
});

export const { clearEmployeeError } = employeeSlice.actions;
export default employeeSlice.reducer;
