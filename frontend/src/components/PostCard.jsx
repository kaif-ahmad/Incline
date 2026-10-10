import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { incrementPostLike, commentPost, deletePost, getCommentsByPost } from "@/config/redux/action/postAction";
import styles from "@/styles/Dashboard.module.css";

export default function PostCard({ post, currentUser }) {
    const [showComments, setShowComments] = useState(false);
    const [commentText, setCommentText] = useState("");
    const [isSubmittingComment, setIsSubmittingComment] = useState(false);

    const dispatch = useDispatch();
    const commentsState = useSelector((state) => state.posts.comments[post._id] || []);

    const author = post.userId || {};
    const authorName = author.name || "Incline Member";
    const authorUsername = author.username ? `@${author.username}` : "";
    const firstLetter = authorName.charAt(0).toUpperCase();

    const [copied, setCopied] = useState(false);

    const isOwnPost = currentUser?._id && author._id && currentUser._id.toString() === author._id.toString();

    const handleShare = () => {
        const postUrl = `${window.location.origin}/dashboard#post-${post._id}`;
        if (navigator.clipboard) {
            navigator.clipboard.writeText(postUrl);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        }
    };

    const handleLike = () => {
        dispatch(incrementPostLike({ post_id: post._id }));
    };

    const handleToggleComments = () => {
        if (!showComments) {
            dispatch(getCommentsByPost({ post_id: post._id }));
        }
        setShowComments(!showComments);
    };

    const handleAddComment = async (e) => {
        e.preventDefault();
        if (!commentText.trim()) return;

        const token = localStorage.getItem("token");
        if (!token) return;

        setIsSubmittingComment(true);
        await dispatch(commentPost({
            token,
            post_id: post._id,
            commentBody: commentText.trim()
        }));
        await dispatch(getCommentsByPost({ post_id: post._id }));
        setCommentText("");
        setIsSubmittingComment(false);
    };

    const handleDelete = () => {
        if (confirm("Are you sure you want to delete this post?")) {
            const token = localStorage.getItem("token");
            if (token) {
                dispatch(deletePost({ token, post_id: post._id }));
            }
        }
    };

    // Format post date
    const formattedDate = post.createdAt
        ? new Date(post.createdAt).toLocaleDateString(undefined, {
            month: "short",
            day: "numeric",
            hour: "2-digit",
            minute: "2-digit"
        })
        : "Just now";

    return (
        <div className={styles.postCard}>
            {/* Header */}
            <div className={styles.postHeader}>
                <div className={styles.postAuthorInfo}>
                    {author.profilePicture && author.profilePicture !== "default.jpg" ? (
                        <img
                            src={`http://localhost:9090/${author.profilePicture}`}
                            alt={authorName}
                            className={styles.postAvatar}
                        />
                    ) : (
                        <div className={styles.postAvatar}>{firstLetter}</div>
                    )}
                    <div>
                        <div className={styles.postAuthorName}>{authorName}</div>
                        <div className={styles.postAuthorUsername}>{authorUsername}</div>
                        <div className={styles.postTime}>{formattedDate}</div>
                    </div>
                </div>

                {isOwnPost && (
                    <button
                        className={styles.btnDeletePost}
                        onClick={handleDelete}
                        title="Delete this post"
                    >
                        Delete
                    </button>
                )}
            </div>

            {/* Content Body */}
            {post.body && <p className={styles.postBody}>{post.body}</p>}

            {/* Media Attachment */}
            {post.media && (
                <div className={styles.postMediaWrapper}>
                    <img
                        src={`http://localhost:9090/${post.media}`}
                        alt="Post media"
                        className={styles.postMedia}
                    />
                </div>
            )}

            {/* Stats Bar */}
            <div className={styles.postStats}>
                <span>👍 {post.likes || 0} {post.likes === 1 ? "like" : "likes"}</span>
                <span onClick={handleToggleComments} style={{ cursor: "pointer" }}>
                    💬 {commentsState.length} {commentsState.length === 1 ? "comment" : "comments"}
                </span>
            </div>

            {/* Action Bar */}
            <div className={styles.postActionButtons}>
                <button
                    className={`${styles.postActionBtn} ${post.likes > 0 ? styles.likedBtn : ""}`}
                    onClick={handleLike}
                >
                    👍 Like
                </button>
                <button
                    className={styles.postActionBtn}
                    onClick={handleToggleComments}
                >
                    💬 Comment
                </button>
                <button
                    className={styles.postActionBtn}
                    onClick={handleShare}
                >
                    🔗 {copied ? "Copied!" : "Share"}
                </button>
            </div>

            {/* Comments Drawer */}
            {showComments && (
                <div className={styles.commentsSection}>
                    <form className={styles.addCommentBox} onSubmit={handleAddComment}>
                        <input
                            type="text"
                            placeholder="Add a comment..."
                            className={styles.commentInput}
                            value={commentText}
                            onChange={(e) => setCommentText(e.target.value)}
                        />
                        <button
                            type="submit"
                            className={styles.btnSendComment}
                            disabled={isSubmittingComment || !commentText.trim()}
                        >
                            {isSubmittingComment ? "..." : "Send"}
                        </button>
                    </form>

                    <div className={styles.commentsList}>
                        {commentsState.length === 0 ? (
                            <p style={{ fontSize: "12px", color: "#888", textAlign: "center", padding: "8px 0" }}>
                                No comments yet. Be the first to share your thoughts!
                            </p>
                        ) : (
                            commentsState.map((c) => {
                                const cAuthor = c.userId?.name || "Member";
                                const cLetter = cAuthor.charAt(0).toUpperCase();
                                return (
                                    <div key={c._id} className={styles.commentItem}>
                                        <div className={styles.postAvatar} style={{ width: 32, height: 32, fontSize: 13 }}>
                                            {cLetter}
                                        </div>
                                        <div className={styles.commentBubble}>
                                            <div className={styles.commentAuthor}>{cAuthor}</div>
                                            <div className={styles.commentText}>{c.body || c.comment}</div>
                                        </div>
                                    </div>
                                );
                            })
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
