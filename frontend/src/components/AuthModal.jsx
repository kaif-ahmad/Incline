import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useRouter } from "next/router";
import { loginUser, registerUser } from "@/config/redux/action/authAction";
import styles from "@/styles/Auth.module.css";

export default function AuthModal({ isOpen, onClose, initialMode = "login" }) {
    const [isLoginMode, setIsLoginMode] = useState(initialMode === "login");
    const [formData, setFormData] = useState({
        name: "",
        username: "",
        email: "",
        password: ""
    });
    const [localError, setLocalError] = useState("");

    const dispatch = useDispatch();
    const router = useRouter();
    const authState = useSelector((state) => state.auth);

    useEffect(() => {
        setIsLoginMode(initialMode === "login");
        setLocalError("");
    }, [initialMode, isOpen]);

    useEffect(() => {
        if (authState.isLoggedIn && typeof window !== "undefined") {
            const token = localStorage.getItem("token");
            if (token) {
                onClose();
                router.push("/dashboard");
            }
        }
    }, [authState.isLoggedIn, router, onClose]);

    if (!isOpen) return null;

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
        setLocalError("");
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLocalError("");

        if (isLoginMode) {
            if (!formData.email || !formData.password) {
                setLocalError("Please enter both email and password.");
                return;
            }
            const res = await dispatch(loginUser({
                email: formData.email,
                password: formData.password
            }));
            if (loginUser.fulfilled.match(res)) {
                onClose();
                router.push("/dashboard");
            } else {
                setLocalError(res.payload?.message || "Invalid email or password");
            }
        } else {
            if (!formData.name || !formData.username || !formData.email || !formData.password) {
                setLocalError("Please fill out all registration fields.");
                return;
            }
            const res = await dispatch(registerUser({
                name: formData.name,
                username: formData.username,
                email: formData.email,
                password: formData.password
            }));
            if (registerUser.fulfilled.match(res)) {
                setIsLoginMode(true);
            } else {
                setLocalError(res.payload?.message || "Registration failed");
            }
        }
    };

    return (
        <div className={styles.overlay} onClick={onClose}>
            <div className={styles.authCard} onClick={(e) => e.stopPropagation()}>
                <button className={styles.closeBtn} onClick={onClose} aria-label="Close modal">
                    &times;
                </button>

                <h2 className={styles.title}>
                    {isLoginMode ? "Welcome Back" : "Join Incline"}
                </h2>
                <p className={styles.subtitle}>
                    {isLoginMode
                        ? "Stay updated on your professional world."
                        : "Make the most of your professional life."}
                </p>

                <div className={styles.tabs}>
                    <button
                        type="button"
                        className={`${styles.tab} ${isLoginMode ? styles.tabActive : ""}`}
                        onClick={() => { setIsLoginMode(true); setLocalError(""); }}
                    >
                        Sign In
                    </button>
                    <button
                        type="button"
                        className={`${styles.tab} ${!isLoginMode ? styles.tabActive : ""}`}
                        onClick={() => { setIsLoginMode(false); setLocalError(""); }}
                    >
                        Join Now
                    </button>
                </div>

                {localError && <div className={styles.alertError}>{localError}</div>}
                {authState.isSuccess && !isLoginMode && (
                    <div className={styles.alertSuccess}>
                        Registration successful! Please sign in with your credentials.
                    </div>
                )}

                <form className={styles.form} onSubmit={handleSubmit}>
                    {!isLoginMode && (
                        <>
                            <div className={styles.inputGroup}>
                                <label className={styles.label}>Full Name</label>
                                <input
                                    type="text"
                                    name="name"
                                    className={styles.input}
                                    placeholder="e.g. Kaif Ahmad"
                                    value={formData.name}
                                    onChange={handleChange}
                                    required
                                />
                            </div>
                            <div className={styles.inputGroup}>
                                <label className={styles.label}>Username</label>
                                <input
                                    type="text"
                                    name="username"
                                    className={styles.input}
                                    placeholder="e.g. kaif123"
                                    value={formData.username}
                                    onChange={handleChange}
                                    required
                                />
                            </div>
                        </>
                    )}

                    <div className={styles.inputGroup}>
                        <label className={styles.label}>Email Address</label>
                        <input
                            type="email"
                            name="email"
                            className={styles.input}
                            placeholder="you@company.com"
                            value={formData.email}
                            onChange={handleChange}
                            required
                        />
                    </div>

                    <div className={styles.inputGroup}>
                        <label className={styles.label}>Password</label>
                        <input
                            type="password"
                            name="password"
                            className={styles.input}
                            placeholder="At least 6 characters"
                            value={formData.password}
                            onChange={handleChange}
                            required
                        />
                    </div>

                    <button
                        type="submit"
                        className={styles.submitBtn}
                        disabled={authState.isLoading}
                    >
                        {authState.isLoading
                            ? (isLoginMode ? "Signing in..." : "Creating account...")
                            : (isLoginMode ? "Sign In" : "Agree & Join")}
                    </button>
                </form>

                <p className={styles.toggleText}>
                    {isLoginMode ? "New to Incline?" : "Already on Incline?"}
                    <button
                        type="button"
                        className={styles.toggleLink}
                        onClick={() => {
                            setIsLoginMode(!isLoginMode);
                            setLocalError("");
                        }}
                    >
                        {isLoginMode ? "Join now" : "Sign in"}
                    </button>
                </p>
            </div>
        </div>
    );
}
