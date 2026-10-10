import React, { useEffect, useState } from "react";
import Head from "next/head";
import { useRouter } from "next/router";
import { useDispatch, useSelector } from "react-redux";
import { getAllPosts } from "@/config/redux/action/postAction";
import { clientServer } from "@/config";
import ProfileCard from "@/components/ProfileCard";
import CreatePostCard from "@/components/CreatePostCard";
import PostCard from "@/components/PostCard";
import Header from "@/components/Header";
import styles from "@/styles/Dashboard.module.css";

export default function Dashboard() {
    const router = useRouter();
    const dispatch = useDispatch();

    const [currentUser, setCurrentUser] = useState(null);
    const [userProfile, setUserProfile] = useState(null);
    const [otherUsers, setOtherUsers] = useState([]);
    const [connectedIds, setConnectedIds] = useState(new Set());
    const [isPageLoading, setIsPageLoading] = useState(true);

    const { posts, isLoading: isPostsLoading } = useSelector((state) => state.posts);

    useEffect(() => {
        const token = localStorage.getItem("token");
        if (!token) {
            router.replace("/");
            return;
        }

        // Fetch current user and profile data
        const fetchUserData = async () => {
            try {
                const res = await clientServer.post("/get_user_and_profile", { token });
                if (res.data) {
                    setUserProfile(res.data);
                    if (res.data.userId) {
                        setCurrentUser(res.data.userId);
                    }
                }
            } catch (err) {
                console.error("Failed to load user profile", err);
                // If token is invalid, clear and redirect
                if (err.response?.status === 404 || err.response?.status === 401) {
                    localStorage.removeItem("token");
                    router.replace("/");
                    return;
                }
            } finally {
                setIsPageLoading(false);
            }
        };

        // Fetch all users for connection suggestions
        const fetchAllUsers = async () => {
            try {
                const res = await clientServer.get("/user/get_all_users");
                if (res.data?.profiles) {
                    setOtherUsers(res.data.profiles);
                }
            } catch (err) {
                console.error("Failed to load users list", err);
            }
        };

        fetchUserData();
        fetchAllUsers();
        dispatch(getAllPosts());
    }, [router, dispatch]);

    const handleLogout = () => {
        localStorage.removeItem("token");
        router.push("/");
    };

    const handleConnect = async (targetUserId) => {
        const token = localStorage.getItem("token");
        if (!token || !targetUserId) return;

        try {
            await clientServer.post("/user/send_connection_request", {
                token,
                connectionId: targetUserId
            });
            setConnectedIds((prev) => new Set([...prev, targetUserId]));
        } catch (err) {
            alert(err.response?.data?.message || "Failed to send connection request");
        }
    };

    if (isPageLoading) {
        return (
            <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100vh", background: "#f4f2ee" }}>
                <p style={{ fontSize: "18px", color: "#666", fontWeight: 600 }}>Loading Incline...</p>
            </div>
        );
    }

    return (
        <>
            <Head>
                <title>Feed | Incline</title>
                <meta name="description" content="Incline dashboard and professional feed." />
            </Head>

            <div className={styles.dashboardContainer}>
                {/* Header Navbar */}
                <Header activeTab="home" />

                {/* Main 3-Column Layout */}
                <main className={styles.mainLayout}>
                    {/* Left Sidebar */}
                    <aside>
                        <ProfileCard userProfile={userProfile} currentUser={currentUser} />
                    </aside>

                    {/* Center Post Feed */}
                    <section>
                        <CreatePostCard currentUser={currentUser} />

                        {isPostsLoading && posts.length === 0 ? (
                            <div style={{ textAlign: "center", padding: "30px", color: "#666" }}>
                                Loading feed...
                            </div>
                        ) : posts.length === 0 ? (
                            <div className={styles.card} style={{ padding: "40px 20px", textAlign: "center", color: "#666" }}>
                                <h3>No posts yet</h3>
                                <p style={{ fontSize: "14px", marginTop: "6px" }}>
                                    Be the first in your network to share an update or article!
                                </p>
                            </div>
                        ) : (
                            // Render posts in reverse chronological order
                            [...posts].reverse().map((post) => (
                                <PostCard
                                    key={post._id}
                                    post={post}
                                    currentUser={currentUser}
                                />
                            ))
                        )}
                    </section>

                    {/* Right Sidebar - Suggestions */}
                    <aside>
                        <div className={styles.card}>
                            <h4 className={styles.widgetTitle}>Add to your feed</h4>
                            <div className={styles.userSuggestionList}>
                                {otherUsers
                                    .filter((p) => p.userId && p.userId._id !== currentUser?._id)
                                    .slice(0, 5)
                                    .map((p) => {
                                        const u = p.userId;
                                        const isConnected = connectedIds.has(u._id);
                                        const firstChar = u.name ? u.name.charAt(0).toUpperCase() : "U";

                                        return (
                                            <div key={p._id} className={styles.userSuggestionItem}>
                                                <div className={styles.suggestionLeft}>
                                                    <div className={styles.postAvatar} style={{ width: 36, height: 36, fontSize: 14 }}>
                                                        {firstChar}
                                                    </div>
                                                    <div>
                                                        <div className={styles.suggestionName}>{u.name}</div>
                                                        <div className={styles.suggestionUsername}>
                                                            {p.currentPost || `@${u.username}`}
                                                        </div>
                                                    </div>
                                                </div>

                                                <button
                                                    className={`${styles.btnConnect} ${isConnected ? styles.btnConnected : ""}`}
                                                    onClick={() => !isConnected && handleConnect(u._id)}
                                                    disabled={isConnected}
                                                >
                                                    {isConnected ? "Requested" : "+ Connect"}
                                                </button>
                                            </div>
                                        );
                                    })}

                                {otherUsers.length <= 1 && (
                                    <p style={{ fontSize: "13px", color: "#888", padding: "12px 16px" }}>
                                        No new member recommendations right now.
                                    </p>
                                )}
                            </div>
                        </div>
                    </aside>
                </main>
            </div>
        </>
    );
}
