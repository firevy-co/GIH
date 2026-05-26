import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

const getAuthHeaders = () => ({
    headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
});

export const fetchDocuments = createAsyncThunk(
    "documents/fetchAll",
    async (params = {}, { rejectWithValue }) => {
        try {
            const query = new URLSearchParams(params).toString();
            const response = await axios.get(`${API_URL}/documents?${query}`, getAuthHeaders());
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || error.message);
        }
    }
);

export const uploadDocument = createAsyncThunk(
    "documents/upload",
    async (formData, { rejectWithValue }) => {
        try {
            const response = await axios.post(`${API_URL}/documents/upload`, formData, {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem("token")}`,
                    "Content-Type": "multipart/form-data",
                },
            });
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || error.message);
        }
    }
);

export const deleteDocument = createAsyncThunk(
    "documents/delete",
    async (id, { rejectWithValue }) => {
        try {
            await axios.delete(`${API_URL}/documents/delete/${id}`, getAuthHeaders());
            return id;
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || error.message);
        }
    }
);

export const signDocument = createAsyncThunk(
    "documents/sign",
    async (id, { rejectWithValue }) => {
        try {
            const response = await axios.post(`${API_URL}/documents/sign/${id}`, {}, getAuthHeaders());
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || error.message);
        }
    }
);

export const updateDocumentAction = createAsyncThunk(
    "documents/update",
    async ({ id, ...payload }, { rejectWithValue }) => {
        try {
            const response = await axios.put(`${API_URL}/documents/update/${id}`, payload, getAuthHeaders());
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || error.message);
        }
    }
);

const initialState = {
    documents: [],
    loading: false,
    error: null,
};

const documentSlice = createSlice({
    name: "documents",
    initialState,
    reducers: {
        clearDocumentError: (state) => { state.error = null; },
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchDocuments.pending, (state) => { state.loading = true; state.error = null; })
            .addCase(fetchDocuments.fulfilled, (state, action) => { state.loading = false; state.documents = action.payload.documents; })
            .addCase(fetchDocuments.rejected, (state, action) => { state.loading = false; state.error = action.payload; })

            .addCase(uploadDocument.fulfilled, (state, action) => { state.documents.unshift(action.payload.document); })
            .addCase(uploadDocument.rejected, (state, action) => { state.error = action.payload; })

            .addCase(deleteDocument.fulfilled, (state, action) => {
                state.documents = state.documents.filter(d => d._id !== action.payload);
            })
            .addCase(deleteDocument.rejected, (state, action) => { state.error = action.payload; })

            .addCase(signDocument.fulfilled, (state, action) => {
                const updated = action.payload.document;
                const idx = state.documents.findIndex(d => d._id === updated._id);
                if (idx !== -1) state.documents[idx] = updated;
            })
            .addCase(signDocument.rejected, (state, action) => { state.error = action.payload; })

            .addCase(updateDocumentAction.fulfilled, (state, action) => {
                const updated = action.payload.document;
                const idx = state.documents.findIndex(d => d._id === updated._id);
                if (idx !== -1) state.documents[idx] = updated;
            })
            .addCase(updateDocumentAction.rejected, (state, action) => { state.error = action.payload; });
    },
});

export const { clearDocumentError } = documentSlice.actions;
export default documentSlice.reducer;
