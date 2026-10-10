import React, { useState, useEffect } from "react";
import Head from "next/head";
import { useRouter } from "next/router";
import Header from "@/components/Header";
import { clientServer } from "@/config";
import styles from "@/styles/Network.module.css";

export default function MyNetwork() {
    const router = useRouter();
    const [incomingRequests, setIncomingRequests] = useState([]);
    const [allProfiles, setAllProfiles] = useState([]);
    const [currentUserId, setCurrentUserId] = useState(null);
    const [sentRequestIds, setSentRequestIds] = useState(new Set());
    const [isLoading, setIsLoading] = useState(true);

    const fetchData = async () => {
        const token = localStorage.getItem("token");
        if (!token) {
            router.replace("/");
            return;
        }

        try {
            // Get current user identity
            const userRes = await clientServer.post("/get_user_and_profile", { token });
            if (userRes.data?.userId?._id) {
                setCurrentUserId(userRes.data.userId._id);
            }

            // Get incoming requests
            const reqRes = await clientServer.post("/user/user_connection_request", { token });
            if (reqRes.data?.connections) {
                // Filter requests that are still pending (status_accepted is null or false)
                setIncomingRequests(reqRes.data.connections.filter(c => c.status_accepted === null));
            }

            // Get all community profiles
            const usersRes = await clientServer.get("/user/get_all_users");
            if (usersRes.data?.profiles) {
                setAllProfiles(usersRes.data.profiles);
            }
        } catch (err) {
            console.error("Failed to load network data", err);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const handleAcceptRequest = async (requestId, actionType) => {
        const token = localStorage.getItem("token");
        if (!token) return;

        try {
            await clientServer.post("/user/accept_connection_request", {
                token,
                requestId,
                action_type: actionType
            });
            // Remove from incoming list
            setIncomingRequests(prev => prev.filter(r => r._id !== requestId));
        } catch (err) {
            alert(err.response?.data?.message || "Failed to update connection request");
        }
    };

    const handleConnect = async (targetUserId) => {
        const token = localStorage.getItem("token");
        if (!token || !targetUserId) return;

        try {
            await clientServer.post("/user/send_connection_request", {
                token,
                connectionId: targetUserId
            });
            setSentRequestIds(prev => new Set([...prev, targetUserId]));
        } catch (err) {
            alert(err.response?.data?.message || "Failed to send request");
        }
    };

    if (isLoading) {
        return (
            <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100vh" }}>
                <p style={{ fontWeight: 600, color: "#666" }}>Loading your network...</p>
            </div>
        );
    }

    return (
        <>
            <Head>
                <title>My Network | Incline</title>
            </Head>

            <div className={styles.networkContainer}>
                <Header activeTab="network" />

                <main className={styles.networkContent}>
                    {/* Incoming Invitations */}
                    <section className={styles.card}>
                        <div className={styles.cardHeader}>
                            <h2 className={styles.cardTitle}>
                                Invitations ({incomingRequests.length})
                            </h2>
                        </div>

                        {incomingRequests.length === 0 ? (
                            <p style={{ fontSize: "14px", color: "#71717a", textAlign: "center", padding: "12px 0" }}>
                                No pending invitations. You're all caught up!
                            </p>
                        ) : (
                            <div className={styles.requestList}>
                                {incomingRequests.map((req) => {
                                    const sender = req.userId || {};
                                    const senderLetter = sender.name ? sender.name.charAt(0).toUpperCase() : "U";

                                    return (
                                        <div key={req._id} className={styles.requestItem}>
                                            <div className={styles.userMeta}>
                                                {sender.profilePicture && sender.profilePicture !== "default.jpg" ? (
                                                    <img
                                                        src={`http://localhost:9090/${sender.profilePicture}`}
                                                        alt={sender.name}
                                                        className={styles.avatar}
                                                    />
                                                ) : (
                                                    <div className={styles.avatar}>{senderLetter}</div>
                                                )}
                                                <div>
                                                    <div className={styles.userName}>{sender.name}</div>
                                                    <div className={styles.userSub}>@{sender.username}</div>
                                                </div>
                                            </div>

                                            <div className={styles.actionGroup}>
                                                <button
                                                    className={styles.btnIgnore}
                                                    onClick={() => handleAcceptRequest(req._id, "ignore")}
                                                >
                                                    Ignore
                                                </button>
                                                <button
                                                    className={styles.btnAccept}
                                                    onClick={() => handleAcceptRequest(req._id, "accept")}
                                                >
                                                    Accept
                                                </button>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </section>

                    {/* Discover People Section */}
                    <section className={styles.card}>
                        <div className={styles.cardHeader}>
                            <h2 className={styles.cardTitle}>People you may know</h2>
                        </div>

                        <div className={styles.discoverGrid}>
                            {allProfiles
                                .filter((p) => p.userId && p.userId._id !== currentUserId)
                                .map((profile) => {
                                    const u = profile.userId;
                                    const isSent = sentRequestIds.has(u._id);
                                    const firstChar = u.name ? u.name.charAt(0).toUpperCase() : "U";

                                    return (
                                        <div key={profile._id} className={styles.memberCard}>
                                            {u.profilePicture && u.profilePicture !== "default.jpg" ? (
                                                <img
                                                    src={`http://localhost:9090/${u.profilePicture}`}
                                                    alt={u.name}
                                                    className={styles.avatar}
                                                />
                                            ) : (
                                                <div className={styles.avatar}>{firstChar}</div>
                                            )}

                                            <div className={styles.userName}>{u.name}</div>
                                            <div className={styles.userSub}>
                                                {profile.currentPost || `@${u.username}`}
                                            </div>

                                            <button
                                                className={`${styles.btnConnect} ${isSent ? styles.btnConnected : ""}`}
                                                onClick={() => !isSent && handleConnect(u._id)}
                                                disabled={isSent}
                                            >
                                                {isSent ? "Requested" : "+ Connect"}
                                            </button>
                                        </div>
                                    );
                                })}
                        </div>
                    </section>
                </main>
            </div>
        </>
    );
}
