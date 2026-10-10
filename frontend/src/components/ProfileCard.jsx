import React from "react";
import styles from "@/styles/Dashboard.module.css";
import { clientServer } from "@/config";

export default function ProfileCard({ userProfile, currentUser }) {
    const user = userProfile?.userId || currentUser;

    const handleDownloadResume = async () => {
        if (!user?._id) return;
        try {
            const res = await clientServer.get(`/user/download_resume?id=${user._id}`);
            if (res.data?.message) {
                // Open the generated PDF in a new tab
                window.open(`http://localhost:9090/${res.data.message}`, "_blank");
            }
        } catch (err) {
            alert(err.response?.data?.message || "Failed to download resume");
        }
    };

    const firstLetter = user?.name ? user.name.charAt(0).toUpperCase() : "U";

    return (
        <div className={styles.card}>
            <div className={styles.profileCardHeader}>
                <div className={styles.profileAvatarWrapper}>
                    {user?.profilePicture && user.profilePicture !== "default.jpg" ? (
                        <img
                            src={`http://localhost:9090/${user.profilePicture}`}
                            alt={user.name}
                            className={styles.profileAvatar}
                        />
                    ) : (
                        <div className={styles.profileAvatar}>{firstLetter}</div>
                    )}
                </div>
            </div>

            <div className={styles.profileCardBody}>
                <h3 className={styles.profileName}>{user?.name || "Welcome!"}</h3>
                <p className={styles.profileUsername}>@{user?.username || "user"}</p>
                <p className={styles.profileBio}>
                    {userProfile?.currentPost || userProfile?.bio || "Professional on Incline"}
                </p>

                <div className={styles.profileDivider} />

                <div className={styles.profileMeta}>
                    <span>Connections</span>
                    <span className={styles.profileMetaVal}>Grow network</span>
                </div>

                <div className={styles.profileMeta}>
                    <span>Email</span>
                    <span>{user?.email || "-"}</span>
                </div>

                <button
                    className={styles.btnResume}
                    onClick={handleDownloadResume}
                    title="Download auto-generated resume PDF"
                >
                    📄 Download Profile PDF
                </button>
            </div>
        </div>
    );
}
