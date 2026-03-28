import React, { useState } from "react";
import { handleSuccess } from "../utils/utils.tsx";
import { handleError } from "../utils/utils.tsx";
import { ToastContainer } from "react-toastify";
import { useNavigate, Link } from "react-router-dom";

export default function Signup() {
  const [signupInfo, setsignupInfo] = useState({
    name: "",
    email: "",
    password: "",
  });
  const [isLoading, setIsLoading] = useState(false);

  const navigate = useNavigate();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setsignupInfo({ ...signupInfo, [name]: value });
  };

  const handleSignup = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const { name, email, password } = signupInfo;
    if (!name || !email || !password) {
      return handleError("Either Name, Email or Password are not Provided");
    }
    setIsLoading(true);
    try {
      const url = `${import.meta.env.VITE_BACKEND_URL}/auth/signup`;
      const response = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(signupInfo),
      });
      const result = await response.json();
      const { success, message, error } = result;
      if (success) {
        handleSuccess(message);
        setTimeout(() => { navigate("/login"); }, 1000);
      } else if (error) {
        const details = error?.details[0].message;
        handleError(details);
      } else if (!success) {
        handleError(message);
      }
    } catch (error: any) {
      handleError(error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: "100vh",
      background: "var(--color-bg-primary)",
      display: "flex",
      alignItems: "stretch",
    }}>
      {/* Left panel — branding */}
      <div
        className="animate-slide-left"
        style={{
          flex: "1 1 45%",
          background: "linear-gradient(145deg, #0d0f1a 0%, #111827 50%, #0a0d1a 100%)",
          borderRight: "1px solid rgba(255,255,255,0.06)",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          padding: "60px 48px",
          position: "relative",
          overflow: "hidden",
        }}
      >
        <div style={{
          position: "absolute", top: "20%", right: "10%",
          width: "360px", height: "360px",
          background: "radial-gradient(circle, rgba(139,92,246,0.12) 0%, transparent 70%)",
          animation: "orb 14s ease-in-out infinite",
          pointerEvents: "none",
        }} />
        <div style={{
          position: "absolute", bottom: "15%", left: "5%",
          width: "280px", height: "280px",
          background: "radial-gradient(circle, rgba(6,182,212,0.08) 0%, transparent 70%)",
          animation: "orb 18s ease-in-out infinite reverse",
          pointerEvents: "none",
        }} />
        <div style={{
          position: "absolute", inset: 0,
          backgroundImage: "linear-gradient(rgba(139,92,246,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(139,92,246,0.04) 1px, transparent 1px)",
          backgroundSize: "50px 50px",
          maskImage: "radial-gradient(ellipse 80% 80% at center, black 20%, transparent 100%)",
          WebkitMaskImage: "radial-gradient(ellipse 80% 80% at center, black 20%, transparent 100%)",
          pointerEvents: "none",
        }} />

        <div style={{ position: "relative", zIndex: 2, textAlign: "center", maxWidth: "400px" }}>
          <div style={{
            width: 72, height: 72,
            background: "linear-gradient(135deg, #8b5cf6, #06b6d4)",
            borderRadius: "22px",
            display: "flex", alignItems: "center", justifyContent: "center",
            margin: "0 auto 28px",
            boxShadow: "0 16px 48px rgba(139,92,246,0.4)",
          }}>
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
              <path d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>

          <h1 style={{
            fontSize: "2rem", fontWeight: 800, letterSpacing: "-0.03em",
            background: "linear-gradient(135deg, #c084fc 0%, #38bdf8 100%)",
            WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text",
            marginBottom: "12px",
          }}>Join PramanChain</h1>
          <p style={{ color: "#64748b", fontSize: "0.95rem", lineHeight: 1.7 }}>
            Create your administrator account and start issuing blockchain-secured marksheets today.
          </p>

          <div style={{ marginTop: "48px", display: "flex", flexDirection: "column", gap: "16px", textAlign: "left" }}>
            {[
              { icon: "🚀", text: "Set up in under 2 minutes" },
              { icon: "🔐", text: "Secure wallet-based auth" },
              { icon: "📊", text: "Bulk & single entry modes" },
            ].map((f) => (
              <div key={f.text} style={{
                display: "flex", alignItems: "center", gap: "12px",
                padding: "12px 16px",
                background: "rgba(255,255,255,0.03)",
                border: "1px solid rgba(255,255,255,0.06)",
                borderRadius: "10px",
              }}>
                <span style={{ fontSize: "1.1rem" }}>{f.icon}</span>
                <span style={{ color: "#94a3b8", fontSize: "0.875rem", fontWeight: 500 }}>{f.text}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right panel — form */}
      <div
        className="animate-slide-right"
        style={{
          flex: "1 1 55%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "60px 48px",
        }}
      >
        <div style={{ width: "100%", maxWidth: "420px" }}>
          <div style={{ marginBottom: "40px" }}>
            <h2 style={{ fontSize: "1.9rem", fontWeight: 800, color: "#f1f5f9", letterSpacing: "-0.02em", marginBottom: "8px" }}>
              Create account
            </h2>
            <p style={{ color: "#64748b", fontSize: "0.9rem" }}>
              Start issuing tamper-proof academic credentials
            </p>
          </div>

          <form onSubmit={handleSignup} style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
            <div>
              <label style={{ display: "block", fontSize: "0.82rem", fontWeight: 600, color: "#94a3b8", marginBottom: "8px", letterSpacing: "0.04em" }}>
                FULL NAME
              </label>
              <input
                onChange={handleChange}
                type="text"
                name="name"
                className="input-field"
                placeholder="Prof. John Doe"
                value={signupInfo.name}
              />
            </div>

            <div>
              <label style={{ display: "block", fontSize: "0.82rem", fontWeight: 600, color: "#94a3b8", marginBottom: "8px", letterSpacing: "0.04em" }}>
                EMAIL ADDRESS
              </label>
              <input
                onChange={handleChange}
                type="email"
                name="email"
                className="input-field"
                placeholder="you@institution.edu"
                value={signupInfo.email}
              />
            </div>

            <div>
              <label style={{ display: "block", fontSize: "0.82rem", fontWeight: 600, color: "#94a3b8", marginBottom: "8px", letterSpacing: "0.04em" }}>
                PASSWORD
              </label>
              <input
                onChange={handleChange}
                type="password"
                name="password"
                className="input-field"
                placeholder="Create a strong password"
                value={signupInfo.password}
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="btn-primary"
              style={{
                marginTop: "8px", padding: "14px", fontSize: "1rem", width: "100%",
                opacity: isLoading ? 0.7 : 1,
                background: "linear-gradient(135deg, #8b5cf6 0%, #06b6d4 100%)",
                boxShadow: "0 4px 20px rgba(139,92,246,0.4)",
              }}
            >
              {isLoading ? (
                <>
                  <svg style={{ animation: "spin 1s linear infinite" }} width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" strokeLinecap="round" />
                  </svg>
                  Creating account…
                </>
              ) : "Create Account"}
            </button>
          </form>

          <p style={{ marginTop: "28px", textAlign: "center", color: "#475569", fontSize: "0.875rem" }}>
            Already have an account?{" "}
            <Link to="/login" style={{ color: "#c084fc", fontWeight: 600, textDecoration: "none" }}>
              Sign in
            </Link>
          </p>
        </div>
      </div>

      <ToastContainer />
    </div>
  );
}
