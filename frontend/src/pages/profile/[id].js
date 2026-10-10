import React, { useState, useEffect } from "react";
import Head from "next/head";
import { useRouter } from "next/router";
import Header from "@/components/Header";
import { clientServer } from "@/config";
import styles from "@/styles/Profile.module.css";

export default function UserProfileView({ initialProfile, userId }) {
    const router = useRouter();
    const [profile, setProfile] = useState(initialProfile || null);
    const [isLoading, setIsLoading] = useState(!initialProfile);
    const [isConnected, setIsConnected] = useState(false);

    useEffect(() => {
        if (!initialProfile && router.query.id) {
            const fetchUserProfile = async () => {
                try {
                    const res = await clientServer.get("/user/get_all_users");
                    const found = res.data?.profiles?.find(p => p.userId?._id === router.query.id);
                    if (found) {
                        setProfile(found);
                    }
                } catch (err) {
                    console.error("Error loading profile", err);
                } finally {
                    setIsLoading(false);
                }
            };
            fetchUserProfile();
        }
    }, [router.query.id, initialProfile]);

    const handleConnect = async () => {
        const token = localStorage.getItem("token");
        if (!token) {
            router.push("/");
            return;
        }

        const targetId = profile?.userId?._id;
        if (!targetId) return;

        try {
            await clientServer.post("/user/send_connection_request", {
                token,
                connectionId: targetId
            });
            setIsConnected(true);
        } catch (err) {
            alert(err.response?.data?.message || "Failed to send connection request");
        }
    };

    const handleDownloadResume = async () => {
        const targetId = profile?.userId?._id;
        if (!targetId) return;

        try {
            const res = await clientServer.get(`/user/download_resume?id=${targetId}`);
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

    if (!profile) {
        return (
            <div style={{ textAlign: "center", padding: "80px 20px" }}>
                <h2>Member not found</h2>
                <button
                    className={styles.btnPrimaryAction}
                    style={{ marginTop: "16px" }}
                    onClick={() => router.push("/network")}
                >
                    Back to Network
                </button>
            </div>
        );
    }

    const user = profile.userId || {};
    const firstLetter = user.name ? user.name.charAt(0).toUpperCase() : "U";

    return (
        <>
            <Head>
                <title>{user.name || "Member Profile"} | Incline</title>
            </Head>

            <div className={styles.profileContainer}>
                <Header activeTab="network" />

                <main className={styles.profileContent}>
                    {/* Identity Card */}
                    <div className={styles.profileCard}>
                        <div className={styles.banner} />

                        <div className={styles.avatarSection}>
                            <div className={styles.avatarWrapper}>
                                {user.profilePicture && user.profilePicture !== "default.jpg" ? (
                                    <img
                                        src={`http://localhost:9090/${user.profilePicture}`}
                                        alt={user.name}
                                        className={styles.avatar}
                                    />
                                ) : (
                                    <div className={styles.avatar}>{firstLetter}</div>
                                )}
                            </div>

                            <div className={styles.profileActions}>
                                <button
                                    className={`${styles.btnEdit} ${isConnected ? styles.btnConnected : ""}`}
                                    onClick={!isConnected ? handleConnect : undefined}
                                >
                                    {isConnected ? "Requested" : "+ Connect"}
                                </button>
                                <button className={styles.btnPrimaryAction} onClick={handleDownloadResume}>
                                    📄 Download PDF
                                </button>
                            </div>
                        </div>

                        <div className={styles.profileInfo}>
                            <h1 className={styles.name}>{user.name}</h1>
                            <p className={styles.username}>@{user.username}</p>
                            <p className={styles.currentPost}>
                                {profile.currentPost || "Professional on Incline"}
                            </p>
                            <p className={styles.bio}>
                                {profile.bio || "No bio added yet."}
                            </p>
                        </div>
                    </div>

                    {/* Work Experience */}
                    <div className={styles.sectionCard}>
                        <div className={styles.sectionHeader}>
                            <h2 className={styles.sectionTitle}>Experience</h2>
                        </div>

                        {profile.pastWork && profile.pastWork.length > 0 ? (
                            <div className={styles.itemList}>
                                {profile.pastWork.map((work, index) => (
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
                            <p className={styles.emptySection}>No experience listed yet.</p>
                        )}
                    </div>

                    {/* Education */}
                    <div className={styles.sectionCard}>
                        <div className={styles.sectionHeader}>
                            <h2 className={styles.sectionTitle}>Education</h2>
                        </div>

                        {profile.education && profile.education.length > 0 ? (
                            <div className={styles.itemList}>
                                {profile.education.map((edu, index) => (
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
                            <p className={styles.emptySection}>No education details listed yet.</p>
                        )}
                    </div>
                </main>
            </div>
        </>
    );
}

// Server-Side Rendering (SSR) data loader
export async function getServerSideProps(context) {
    const { id } = context.params;
    try {
        const res = await fetch("http://localhost:9090/user/get_all_users");
        if (res.ok) {
            const data = await res.json();
            const found = data?.profiles?.find(p => p.userId?._id === id);
            if (found) {
                return {
                    props: {
                        initialProfile: found,
                        userId: id
                    }
                };
            }
        }
    } catch (err) {
        // Fallback to client-side hydration if backend is not reachable during build
    }

    return {
        props: {
            initialProfile: null,
            userId: id
        }
    };
}
