import React from "react";
import Link from "next/link";
import { useRouter } from "next/router";
import styles from "@/styles/Dashboard.module.css";

export default function Header({ activeTab = "home" }) {
    const router = useRouter();

    const handleLogout = () => {
        if (typeof window !== "undefined") {
            localStorage.removeItem("token");
        }
        router.push("/");
    };

    return (
        <header className={styles.header}>
            <div className={styles.headerInner}>
                <div className={styles.headerLeft}>
                    <div className={styles.logo} onClick={() => router.push("/dashboard")}>
                        In<span className={styles.logoBadge}>cline</span>
                    </div>
                    <div className={styles.searchBox}>
                        <span>🔍</span>
                        <input
                            type="text"
                            placeholder="Search people, posts..."
                            className={styles.searchInput}
                        />
                    </div>
                </div>

                <div className={styles.headerNav}>
                    <Link
                        href="/dashboard"
                        className={`${styles.navItem} ${activeTab === "home" ? styles.navItemActive : ""}`}
                    >
                        <span>🏠</span>
                        <span>Home</span>
                    </Link>

                    <Link
                        href="/network"
                        className={`${styles.navItem} ${activeTab === "network" ? styles.navItemActive : ""}`}
                    >
                        <span>👥</span>
                        <span>My Network</span>
                    </Link>

                    <Link
                        href="/profile"
                        className={`${styles.navItem} ${activeTab === "profile" ? styles.navItemActive : ""}`}
                    >
                        <span>👤</span>
                        <span>Profile</span>
                    </Link>

                    <button className={styles.logoutBtn} onClick={handleLogout}>
                        Sign Out
                    </button>
                </div>
            </div>
        </header>
    );
}
