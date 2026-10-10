import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { createPost } from "@/config/redux/action/postAction";
import styles from "@/styles/Dashboard.module.css";

export default function CreatePostCard({ currentUser }) {
    const [body, setBody] = useState("");
    const [mediaFile, setMediaFile] = useState(null);
    const [mediaPreview, setMediaPreview] = useState(null);

    const dispatch = useDispatch();
    const { isLoading } = useSelector((state) => state.posts);

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setMediaFile(file);
            setMediaPreview(URL.createObjectURL(file));
        }
    };

    const handleRemoveMedia = () => {
        setMediaFile(null);
        setMediaPreview(null);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!body.trim() && !mediaFile) return;

        const token = localStorage.getItem("token");
        if (!token) return;

        await dispatch(createPost({
            token,
            body,
            media: mediaFile
        }));

        setBody("");
        handleRemoveMedia();
    };

    const firstLetter = currentUser?.name ? currentUser.name.charAt(0).toUpperCase() : "U";

    return (
        <div className={styles.createPostCard}>
            <div className={styles.createPostTop}>
                <div className={styles.postAvatar}>
                    {firstLetter}
                </div>
                <textarea
                    className={styles.createPostTextarea}
                    placeholder="Start a post, share ideas or achievements..."
                    value={body}
                    onChange={(e) => setBody(e.target.value)}
                    rows={2}
                />
            </div>

            {mediaPreview && (
                <div className={styles.mediaPreviewContainer}>
                    <img src={mediaPreview} alt="Upload preview" className={styles.mediaPreview} />
                    <button
                        type="button"
                        className={styles.removeMediaBtn}
                        onClick={handleRemoveMedia}
                        title="Remove photo"
                    >
                        &times;
                    </button>
                </div>
            )}

            <div className={styles.createPostActions}>
                <label className={styles.mediaUploadLabel}>
                    📷 <span>Add Photo</span>
                    <input
                        type="file"
                        accept="image/*"
                        className={styles.fileInput}
                        onChange={handleFileChange}
                    />
                </label>

                <button
                    className={styles.btnSubmitPost}
                    onClick={handleSubmit}
                    disabled={isLoading || (!body.trim() && !mediaFile)}
                >
                    {isLoading ? "Posting..." : "Post"}
                </button>
            </div>
        </div>
    );
}
