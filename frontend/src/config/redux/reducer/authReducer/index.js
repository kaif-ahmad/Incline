import { createSlice } from "@reduxjs/toolkit"
import { loginUser, registerUser } from "../../action/authAction"


const initialState = {
    user: [],
    isError: false,
    isSuccess: false,
    isLoading: false,
    isLoggedIn: false,
    message: "",
    profileFetched: false,
    connections: [],
    connectionRequest: []
}

const authSlice = createSlice({
    name: "auth",
    initialState,
    reducers: {
        reset: () => initialState,
        handleLoginUser: (state) => {
            state.message = "hello"
        },
    },
    extraReducers: (builder) => {
        builder
        .addCase(loginUser.pending, (state) => {
            state.isLoading = true;
            state.message = "KnockingTheDoor...";
        })
        .addCase(loginUser.fulfilled, (state, action) => {
            state.isLoading = false;
            state.isError = false;
            state.isSuccess = true;
            state.isLoggedIn = true;
            state.message = "LoggedIn";
        })
        .addCase(loginUser.rejected, (state, action) => {
            state.isLoading = false;
            state.isError = true;
            state.message = action.payload;
        })
        .addCase(registerUser.pending, (state) => {
            state.isLoading = true;
            state.message = "Registering You...";
        })
        .addCase(registerUser.fulfilled, (state, action) => {
            state.isLoading = false;
            state.isError = false;
            state.isSuccess = true;
            state.isLoggedIn = true;
            state.message = "Registration Done";
        })
        .addCase(registerUser.rejected, (state, action) => {
            state.isLoading = false;
            state.isError = true;
            state.message = action.payload;
        })
    }
})

export const { reset, handleLoginUser } = authSlice.actions;

export default authSlice.reducer;