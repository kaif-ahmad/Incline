import { createAsyncThunk } from "@reduxjs/toolkit";
import { clientServer } from "@/config";

// Fetch all posts for the dashboard feed
export const getAllPosts = createAsyncThunk(
    "post/getAllPosts",
    async (_, thunkAPI) => {
        try {
            const response = await clientServer.get("/posts");
            return response.data;
        } catch (err) {
            return thunkAPI.rejectWithValue(err.response?.data || { message: err.message });
        }
    }
);

// Create a new post with text and optional media file
export const createPost = createAsyncThunk(
    "post/createPost",
    async (postData, thunkAPI) => {
        try {
            const formData = new FormData();
            formData.append("token", postData.token);
            formData.append("body", postData.body);
            if (postData.media) {
                formData.append("media", postData.media);
            }

            const response = await clientServer.post("/post", formData, {
                headers: {
                    "Content-Type": "multipart/form-data"
                }
            });

            // Re-fetch all posts after creating
            thunkAPI.dispatch(getAllPosts());
            return response.data;
        } catch (err) {
            return thunkAPI.rejectWithValue(err.response?.data || { message: err.message });
        }
    }
);

// Delete a user post
export const deletePost = createAsyncThunk(
    "post/deletePost",
    async ({ token, post_id }, thunkAPI) => {
        try {
            const response = await clientServer.post("/delete_post", {
                token,
                post_id
            });
            thunkAPI.dispatch(getAllPosts());
            return response.data;
        } catch (err) {
            return thunkAPI.rejectWithValue(err.response?.data || { message: err.message });
        }
    }
);

// Like a post
export const incrementPostLike = createAsyncThunk(
    "post/incrementLike",
    async ({ post_id }, thunkAPI) => {
        try {
            const response = await clientServer.post("/increment_post_like", {
                post_id
            });
            thunkAPI.dispatch(getAllPosts());
            return response.data;
        } catch (err) {
            return thunkAPI.rejectWithValue(err.response?.data || { message: err.message });
        }
    }
);

// Add a comment to a post
export const commentPost = createAsyncThunk(
    "post/commentPost",
    async ({ token, post_id, commentBody }, thunkAPI) => {
        try {
            const response = await clientServer.post("/comment", {
                token,
                post_id,
                commentBody
            });
            thunkAPI.dispatch(getAllPosts());
            return response.data;
        } catch (err) {
            return thunkAPI.rejectWithValue(err.response?.data || { message: err.message });
        }
    }
);

// Get comments for a specific post
export const getCommentsByPost = createAsyncThunk(
    "post/getComments",
    async ({ post_id }, thunkAPI) => {
        try {
            const response = await clientServer.get(`/get_comments?post_id=${post_id}`);
            return { post_id, comments: response.data.comments };
        } catch (err) {
            return thunkAPI.rejectWithValue(err.response?.data || { message: err.message });
        }
    }
);
