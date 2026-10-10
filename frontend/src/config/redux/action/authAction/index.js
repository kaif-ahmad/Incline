import { createAsyncThunk } from "@reduxjs/toolkit";
import { clientServer } from "@/config";

export const loginUser = createAsyncThunk(
    "user/login",
    async (user, thunkAPI) => {
        try {
            const response = await clientServer.post('/login', {
                email: user.email,
                password: user.password
            });

            if (response.data.token) {
                localStorage.setItem("token", response.data.token);
            }

            return response.data;
        } catch (err) {
            return thunkAPI.rejectWithValue(err.response?.data || { message: err.message });
        }
    }
);

export const registerUser = createAsyncThunk(
    "user/register",
    async (user, thunkAPI) => {
        try {
            const response = await clientServer.post('/register', {
                name: user.name,
                email: user.email,
                password: user.password,
                username: user.username
            });

            return response.data;
        } catch (err) {
            return thunkAPI.rejectWithValue(err.response?.data || { message: err.message });
        }
    }
);