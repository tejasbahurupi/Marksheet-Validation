import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { handleError, handleSuccess } from "../utils/utils";
import { ToastContainer } from "react-toastify";
import { Link } from "react-router-dom";

export default function Login() {
  const [loginInfo, setLoginInfo] = useState({
    email: "",
    password: "",
  });
  const [isLoading, setIsLoading] = useState(false);

  const navigate = useNavigate();

  useEffect(() => {
    const user = localStorage.getItem("loggedInUser");
    if (user) {
      navigate("/home");
    }
    console.log("Backend URL:", import.meta.env.VITE_BACKEND_URL);
    testBackendConnection();
  }, [navigate]);

  const testBackendConnection = async () => {
    try {
      console.log("Testing connection to backend...");
      const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/auth/login`, {
        method: "HEAD",
      });
      console.log("Backend response status:", response.status);
    } catch (error) {
      console.error("Backend connection test failed:", error);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setLoginInfo((prev) => ({ ...prev, [name]: value }));
  };

  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const { email, password } = loginInfo;
    if (!email || !password) {
      return handleError("Email or Password are not Provided");
    }
    setIsLoading(true);
    try {
      const url = `${import.meta.env.VITE_BACKEND_URL}/auth/login`;
      console.log("Login request to URL:", url);
      const response = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(loginInfo),
      });
      console.log("Login response status:", response.status);
      if (!response.ok) {
        const errorText = await response.text();
        console.error("Error response text:", errorText);
        throw new Error(`Server responded with status ${response.status}: ${errorText}`);
      }
      const result = await response.json();
      console.log("Login result:", result);
      const { success, message, jwtToken, name, error, email: userEmail } = result;
      if (success) {
        handleSuccess(message);
        localStorage.setItem("token", jwtToken);
        localStorage.setItem("loggedInUser", name);
        localStorage.setItem("email", userEmail);
        setTimeout(() => { navigate("/home"); }, 1000);
      } else if (error) {
        const details = error?.details?.[0]?.message || error.message || "Login failed";
        handleError(details);
      } else {
        handleError(message || "Login failed");
      }
    } catch (error) {
      console.error("Login error details:", error);
      handleError((error as Error).message || "An error occurred during login");
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
        {/* Background orb */}
        <div style={{
          position: "absolute",
          top: "20%", left: "10%",
          width: "400px", height: "400px",
          background: "radial-gradient(circle, rgba(99,102,241,0.12) 0%, transparent 70%)",
          animation: "orb 12s ease-in-out infinite",
          pointerEvents: "none",
        }} />
        <div style={{
          position: "absolute",
          bottom: "10%", right: "5%",
          width: "300px", height: "300px",
          background: "radial-gradient(circle, rgba(139,92,246,0.08) 0%, transparent 70%)",
          animation: "orb 16s ease-in-out infinite reverse",
          pointerEvents: "none",
        }} />

        {/* Grid */}
        <div style={{
          position: "absolute", inset: 0,
          backgroundImage: "linear-gradient(rgba(99,102,241,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(99,102,241,0.04) 1px, transparent 1px)",
          backgroundSize: "50px 50px",
          maskImage: "radial-gradient(ellipse 80% 80% at center, black 20%, transparent 100%)",
          WebkitMaskImage: "radial-gradient(ellipse 80% 80% at center, black 20%, transparent 100%)",
          pointerEvents: "none",
        }} />

        <div style={{ position: "relative", zIndex: 2, textAlign: "center", maxWidth: "400px" }}>
          {/* Logo */}
          <div style={{
            width: 72, height: 72,
            background: "linear-gradient(135deg, #6366f1, #8b5cf6)",
            borderRadius: "22px",
            display: "flex", alignItems: "center", justifyContent: "center",
            margin: "0 auto 28px",
            boxShadow: "0 16px 48px rgba(99,102,241,0.4)",
          }}>
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
              <path d="M10 13a5 5 0 007.54.54l3-3a5 5 0 00-7.07-7.07l-1.72 1.71" strokeLinecap="round" strokeLinejoin="round" />
              <path d="M14 11a5 5 0 00-7.54-.54l-3 3a5 5 0 007.07 7.07l1.71-1.71" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>

          <h1 style={{
            fontSize: "2rem", fontWeight: 800, letterSpacing: "-0.03em",
            background: "linear-gradient(135deg, #818cf8 0%, #c084fc 100%)",
            WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text",
            marginBottom: "12px",
          }}>PramanChain</h1>
          <p style={{ color: "#64748b", fontSize: "0.95rem", lineHeight: 1.7 }}>
            Blockchain-powered academic credential management trusted by institutions.
          </p>

          {/* Feature bullets */}
          <div style={{ marginTop: "48px", display: "flex", flexDirection: "column", gap: "16px", textAlign: "left" }}>
            {[
              { icon: "🔒", text: "Tamper-proof on Ethereum" },
              { icon: "⚡", text: "Instant QR verification" },
              { icon: "📄", text: "Auto-generated PDF records" },
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
          position: "relative",
        }}
      >
        <div style={{ width: "100%", maxWidth: "420px" }}>
          <div style={{ marginBottom: "40px" }}>
            <h2 style={{ fontSize: "1.9rem", fontWeight: 800, color: "#f1f5f9", letterSpacing: "-0.02em", marginBottom: "8px" }}>
              Welcome back
            </h2>
            <p style={{ color: "#64748b", fontSize: "0.9rem" }}>
              Sign in to your account to manage marksheets
            </p>
          </div>

          <form onSubmit={handleLogin} style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
            <div>
              <label style={{ display: "block", fontSize: "0.82rem", fontWeight: 600, color: "#94a3b8", marginBottom: "8px", letterSpacing: "0.04em" }}>
                EMAIL ADDRESS
              </label>
              <input
                onChange={handleChange}
                type="email"
                name="email"
                autoComplete="email"
                className="input-field"
                placeholder="you@institution.edu"
                value={loginInfo.email}
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
                autoComplete="current-password"
                className="input-field"
                placeholder="Enter your password"
                value={loginInfo.password}
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="btn-primary"
              style={{ marginTop: "8px", padding: "14px", fontSize: "1rem", width: "100%", opacity: isLoading ? 0.7 : 1 }}
            >
              {isLoading ? (
                <>
                  <svg style={{ animation: "spin 1s linear infinite" }} width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" strokeLinecap="round" />
                  </svg>
                  Signing in…
                </>
              ) : "Sign In"}
            </button>
          </form>

          <p style={{ marginTop: "28px", textAlign: "center", color: "#475569", fontSize: "0.875rem" }}>
            Don't have an account?{" "}
            <Link to="/signup" style={{ color: "#818cf8", fontWeight: 600, textDecoration: "none" }}>
              Create one
            </Link>
          </p>
        </div>
      </div>

      <ToastContainer />
    </div>
  );
}
