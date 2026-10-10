import { createSlice } from "@reduxjs/toolkit";
import { getAllPosts, createPost, deletePost, incrementPostLike, commentPost, getCommentsByPost } from "../../action/postAction";

const initialState = {
    posts: [],
    isLoading: false,
    isError: false,
    message: "",
    comments: {}
};

const postSlice = createSlice({
    name: "posts",
    initialState,
    reducers: {
        resetPostState: () => initialState
    },
    extraReducers: (builder) => {
        builder
            // Fetch All Posts
            .addCase(getAllPosts.pending, (state) => {
                state.isLoading = true;
            })
            .addCase(getAllPosts.fulfilled, (state, action) => {
                state.isLoading = false;
                state.isError = false;
                state.posts = action.payload.posts || [];
            })
            .addCase(getAllPosts.rejected, (state, action) => {
                state.isLoading = false;
                state.isError = true;
                state.message = action.payload?.message || "Failed to fetch posts";
            })

            // Create Post
            .addCase(createPost.pending, (state) => {
                state.isLoading = true;
            })
            .addCase(createPost.fulfilled, (state) => {
                state.isLoading = false;
                state.isError = false;
                state.message = "Post created successfully";
            })
            .addCase(createPost.rejected, (state, action) => {
                state.isLoading = false;
                state.isError = true;
                state.message = action.payload?.message || "Failed to create post";
            })

            // Delete Post
            .addCase(deletePost.fulfilled, (state) => {
                state.message = "Post deleted";
            })

            // Like Post
            .addCase(incrementPostLike.fulfilled, (state) => {
                state.message = "Post liked";
            })

            // Add Comment
            .addCase(commentPost.fulfilled, (state) => {
                state.message = "Comment added";
            })

            // Get Comments by Post
            .addCase(getCommentsByPost.fulfilled, (state, action) => {
                const { post_id, comments } = action.payload;
                state.comments[post_id] = comments || [];
            });
    }
});

export const { resetPostState } = postSlice.actions;
export default postSlice.reducer;
