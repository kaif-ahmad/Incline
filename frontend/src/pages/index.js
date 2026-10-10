import React, { useState, useEffect } from "react";
import Head from "next/head";
import Link from "next/link";
import { useRouter } from "next/router";
import AuthModal from "@/components/AuthModal";
import styles from "@/styles/Landing.module.css";

export default function Home() {
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [authMode, setAuthMode] = useState("login");
  const [hasToken, setHasToken] = useState(false);
  const router = useRouter();

  useEffect(() => {
    if (typeof window !== "undefined") {
      const token = localStorage.getItem("token");
      if (token) {
        setHasToken(true);
      }
    }
  }, []);

  const openAuth = (mode) => {
    setAuthMode(mode);
    setIsAuthOpen(true);
  };

  return (
    <>
      <Head>
        <title>Incline | Professional Community</title>
        <meta name="description" content="Connect, learn and grow with professionals on Incline." />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <div className={styles.container}>
        {/* Navigation Bar */}
        <header className={styles.navbar}>
          <div className={styles.logo}>
            In<span className={styles.logoBadge}>cline</span>
          </div>

          <div className={styles.navActions}>
            {hasToken ? (
              <button
                className={styles.btnPrimary}
                onClick={() => router.push("/dashboard")}
              >
                Go to Dashboard &rarr;
              </button>
            ) : (
              <>
                <button
                  className={styles.navLink}
                  onClick={() => openAuth("register")}
                >
                  Join now
                </button>
                <button
                  className={styles.btnOutline}
                  onClick={() => openAuth("login")}
                >
                  Sign in
                </button>
              </>
            )}
          </div>
        </header>

        {/* Hero Section */}
        <main className={styles.hero}>
          <div className={styles.heroContent}>
            <h1 className={styles.headline}>
              Welcome to your professional community
            </h1>
            <p className={styles.subheadline}>
              Discover colleagues, industry leaders, and exciting career opportunities. Share insights, build connections, and elevate your career with Incline.
            </p>

            <div className={styles.ctaGroup}>
              {hasToken ? (
                <button
                  className={styles.btnPrimary}
                  onClick={() => router.push("/dashboard")}
                >
                  Open Dashboard
                </button>
              ) : (
                <>
                  <button
                    className={styles.btnPrimary}
                    onClick={() => openAuth("register")}
                  >
                    Get Started Free
                  </button>
                  <button
                    className={styles.btnOutline}
                    onClick={() => openAuth("login")}
                  >
                    Sign In
                  </button>
                </>
              )}
            </div>
          </div>

          {/* Visual Showcase */}
          <div className={styles.heroVisual}>
            <div className={styles.illustrationCard}>
              <div className={styles.featuresGrid}>
                <div className={styles.featureItem}>
                  <div className={styles.featureIcon}>🌐</div>
                  <div>
                    <div className={styles.featureTitle}>Expand Your Network</div>
                    <div className={styles.featureDesc}>Connect with developers and creators worldwide.</div>
                  </div>
                </div>

                <div className={styles.featureItem}>
                  <div className={styles.featureIcon}>📝</div>
                  <div>
                    <div className={styles.featureTitle}>Share Your Insights</div>
                    <div className={styles.featureDesc}>Post updates, multimedia content, and achievements.</div>
                  </div>
                </div>

                <div className={styles.featureItem}>
                  <div className={styles.featureIcon}>📄</div>
                  <div>
                    <div className={styles.featureTitle}>Download Instant Resume</div>
                    <div className={styles.featureDesc}>Export your profile directly to PDF format with 1 click.</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </main>

        <footer className={styles.footer}>
          Incline &copy; {new Date().getFullYear()} &middot; Built with Next.js, Express & MongoDB
        </footer>

        {/* Authentication Modal */}
        <AuthModal
          isOpen={isAuthOpen}
          onClose={() => setIsAuthOpen(false)}
          initialMode={authMode}
        />
      </div>
    </>
  );
}
