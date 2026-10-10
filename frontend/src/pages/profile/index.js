import React, { useState, useEffect } from "react";
import Head from "next/head";
import { useRouter } from "next/router";
import Header from "@/components/Header";
import { clientServer } from "@/config";
import styles from "@/styles/Profile.module.css";

export default function MyProfile() {
    const router = useRouter();
    const [userProfile, setUserProfile] = useState(null);
    const [currentUser, setCurrentUser] = useState(null);
    const [isLoading, setIsLoading] = useState(true);

    // Edit Profile Modal State
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [editData, setEditData] = useState({ currentPost: "", bio: "" });

    // Add Work Modal State
    const [isWorkModalOpen, setIsWorkModalOpen] = useState(false);
    const [workData, setWorkData] = useState({ company: "", position: "", years: "" });

    const fetchProfile = async () => {
        const token = localStorage.getItem("token");
        if (!token) {
            router.replace("/");
            return;
        }

        try {
            const res = await clientServer.post("/get_user_and_profile", { token });
            if (res.data) {
                setUserProfile(res.data);
                setCurrentUser(res.data.userId);
                setEditData({
                    currentPost: res.data.currentPost || "",
                    bio: res.data.bio || ""
                });
            }
        } catch (err) {
            console.error("Failed to load profile", err);
            if (err.response?.status === 404 || err.response?.status === 401) {
                localStorage.removeItem("token");
                router.replace("/");
            }
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchProfile();
    }, []);

    const handleProfilePictureUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const token = localStorage.getItem("token");
        if (!token) return;

        const formData = new FormData();
        formData.append("token", token);
        formData.append("profile_picture", file);

        try {
            await clientServer.post("/update_profile_picture", formData, {
                headers: { "Content-Type": "multipart/form-data" }
            });
            fetchProfile();
        } catch (err) {
            alert(err.response?.data?.message || "Failed to update profile picture");
        }
    };

    const handleSaveProfile = async (e) => {
        e.preventDefault();
        const token = localStorage.getItem("token");
        if (!token) return;

        try {
            await clientServer.post("/update_profile_data", {
                token,
                currentPost: editData.currentPost,
                bio: editData.bio
            });
            setIsEditModalOpen(false);
            fetchProfile();
        } catch (err) {
            alert(err.response?.data?.message || "Failed to update profile");
        }
    };

    const handleAddWork = async (e) => {
        e.preventDefault();
        const token = localStorage.getItem("token");
        if (!token) return;

        const updatedPastWork = [...(userProfile?.pastWork || []), workData];

        try {
            await clientServer.post("/update_profile_data", {
                token,
                pastWork: updatedPastWork
            });
            setIsWorkModalOpen(false);
            setWorkData({ company: "", position: "", years: "" });
            fetchProfile();
        } catch (err) {
            alert(err.response?.data?.message || "Failed to add work experience");
        }
    };

    const handleDownloadResume = async () => {
        if (!currentUser?._id) return;
        try {
            const res = await clientServer.get(`/user/download_resume?id=${currentUser._id}`);
            if (res.data?.message) {
                window.open(`http://localhost:9090/${res.data.message}`, "_blank");
            }
        } catch (err) {
            alert(err.response?.data?.message || "Failed to download resume");
        }
    };

    if (isLoading) {
        return (
            <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100vh" }}>
                <p style={{ fontWeight: 600, color: "#666" }}>Loading profile...</p>
            </div>
        );
    }

    const firstLetter = currentUser?.name ? currentUser.name.charAt(0).toUpperCase() : "U";

    return (
        <>
            <Head>
                <title>{currentUser?.name || "Profile"} | Incline</title>
            </Head>

            <div className={styles.profileContainer}>
                <Header activeTab="profile" />

                <main className={styles.profileContent}>
                    {/* Top Identity Card */}
                    <div className={styles.profileCard}>
                        <div className={styles.banner} />

                        <div className={styles.avatarSection}>
                            <div className={styles.avatarWrapper}>
                                {currentUser?.profilePicture && currentUser.profilePicture !== "default.jpg" ? (
                                    <img
                                        src={`http://localhost:9090/${currentUser.profilePicture}`}
                                        alt={currentUser.name}
                                        className={styles.avatar}
                                    />
                                ) : (
                                    <div className={styles.avatar}>{firstLetter}</div>
                                )}

                                <label className={styles.avatarUploadBadge} title="Change photo">
                                    📷
                                    <input
                                        type="file"
                                        accept="image/*"
                                        className={styles.avatarInput}
                                        onChange={handleProfilePictureUpload}
                                    />
                                </label>
                            </div>

                            <div className={styles.profileActions}>
                                <button className={styles.btnEdit} onClick={() => setIsEditModalOpen(true)}>
                                    Edit Profile
                                </button>
                                <button className={styles.btnPrimaryAction} onClick={handleDownloadResume}>
                                    📄 Download PDF
                                </button>
                            </div>
                        </div>

                        <div className={styles.profileInfo}>
                            <h1 className={styles.name}>{currentUser?.name}</h1>
                            <p className={styles.username}>@{currentUser?.username}</p>
                            <p className={styles.currentPost}>
                                {userProfile?.currentPost || "No title set"}
                            </p>
                            <p className={styles.bio}>
                                {userProfile?.bio || "No bio added yet. Click Edit Profile to add one."}
                            </p>
                        </div>
                    </div>

                    {/* Work Experience Section */}
                    <div className={styles.sectionCard}>
                        <div className={styles.sectionHeader}>
                            <h2 className={styles.sectionTitle}>Experience</h2>
                            <button
                                className={styles.btnAdd}
                                onClick={() => setIsWorkModalOpen(true)}
                                title="Add work experience"
                            >
                                +
                            </button>
                        </div>

                        {userProfile?.pastWork && userProfile.pastWork.length > 0 ? (
                            <div className={styles.itemList}>
                                {userProfile.pastWork.map((work, index) => (
                                    <div key={index} className={styles.itemCard}>
                                        <div className={styles.itemIcon}>💼</div>
                                        <div>
                                            <div className={styles.itemPosition}>{work.position}</div>
                                            <div className={styles.itemCompany}>{work.company}</div>
                                            <div className={styles.itemYears}>{work.years} years</div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <p className={styles.emptySection}>
                                No experience listed yet. Click + to add your roles!
                            </p>
                        )}
                    </div>

                    {/* Education Section */}
                    <div className={styles.sectionCard}>
                        <div className={styles.sectionHeader}>
                            <h2 className={styles.sectionTitle}>Education</h2>
                        </div>

                        {userProfile?.education && userProfile.education.length > 0 ? (
                            <div className={styles.itemList}>
                                {userProfile.education.map((edu, index) => (
                                    <div key={index} className={styles.itemCard}>
                                        <div className={styles.itemIcon}>🎓</div>
                                        <div>
                                            <div className={styles.itemPosition}>{edu.degree} - {edu.fieldOfStudy}</div>
                                            <div className={styles.itemCompany}>{edu.school}</div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <p className={styles.emptySection}>
                                Self-taught or university details can be showcased here.
                            </p>
                        )}
                    </div>
                </main>

                {/* Edit Profile Modal */}
                {isEditModalOpen && (
                    <div className={styles.modalOverlay} onClick={() => setIsEditModalOpen(false)}>
                        <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
                            <div className={styles.modalHeader}>
                                <h3 className={styles.modalTitle}>Edit Profile Info</h3>
                                <button
                                    onClick={() => setIsEditModalOpen(false)}
                                    style={{ background: "none", fontSize: "20px", cursor: "pointer" }}
                                >
                                    &times;
                                </button>
                            </div>
                            <form className={styles.modalForm} onSubmit={handleSaveProfile}>
                                <div className={styles.inputGroup}>
                                    <label className={styles.inputLabel}>Current Position / Title</label>
                                    <input
                                        type="text"
                                        className={styles.inputField}
                                        placeholder="e.g. Senior Software Engineer"
                                        value={editData.currentPost}
                                        onChange={(e) => setEditData({ ...editData, currentPost: e.target.value })}
                                    />
                                </div>
                                <div className={styles.inputGroup}>
                                    <label className={styles.inputLabel}>Bio / About</label>
                                    <textarea
                                        rows={4}
                                        className={styles.inputField}
                                        placeholder="Brief summary of your professional journey..."
                                        value={editData.bio}
                                        onChange={(e) => setEditData({ ...editData, bio: e.target.value })}
                                    />
                                </div>
                                <div className={styles.modalFooter}>
                                    <button
                                        type="button"
                                        className={styles.btnCancel}
                                        onClick={() => setIsEditModalOpen(false)}
                                    >
                                        Cancel
                                    </button>
                                    <button type="submit" className={styles.btnSave}>
                                        Save Changes
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}

                {/* Add Work Modal */}
                {isWorkModalOpen && (
                    <div className={styles.modalOverlay} onClick={() => setIsWorkModalOpen(false)}>
                        <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
                            <div className={styles.modalHeader}>
                                <h3 className={styles.modalTitle}>Add Experience</h3>
                                <button
                                    onClick={() => setIsWorkModalOpen(false)}
                                    style={{ background: "none", fontSize: "20px", cursor: "pointer" }}
                                >
                                    &times;
                                </button>
                            </div>
                            <form className={styles.modalForm} onSubmit={handleAddWork}>
                                <div className={styles.inputGroup}>
                                    <label className={styles.inputLabel}>Position / Role</label>
                                    <input
                                        type="text"
                                        className={styles.inputField}
                                        placeholder="e.g. Frontend Developer"
                                        value={workData.position}
                                        onChange={(e) => setWorkData({ ...workData, position: e.target.value })}
                                        required
                                    />
                                </div>
                                <div className={styles.inputGroup}>
                                    <label className={styles.inputLabel}>Company Name</label>
                                    <input
                                        type="text"
                                        className={styles.inputField}
                                        placeholder="e.g. Google, Incline, etc."
                                        value={workData.company}
                                        onChange={(e) => setWorkData({ ...workData, company: e.target.value })}
                                        required
                                    />
                                </div>
                                <div className={styles.inputGroup}>
                                    <label className={styles.inputLabel}>Years Experience</label>
                                    <input
                                        type="text"
                                        className={styles.inputField}
                                        placeholder="e.g. 2"
                                        value={workData.years}
                                        onChange={(e) => setWorkData({ ...workData, years: e.target.value })}
                                        required
                                    />
                                </div>
                                <div className={styles.modalFooter}>
                                    <button
                                        type="button"
                                        className={styles.btnCancel}
                                        onClick={() => setIsWorkModalOpen(false)}
                                    >
                                        Cancel
                                    </button>
                                    <button type="submit" className={styles.btnSave}>
                                        Add Role
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}
            </div>
        </>
    );
}
