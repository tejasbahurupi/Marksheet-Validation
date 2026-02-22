import { Link, useNavigate, useLocation } from "react-router-dom";
import { handleSuccess } from "../utils/utils";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Wallet from "./Wallet";

export default function Navbar() {
  const isLoggedIn = localStorage.getItem("token");
  const navigate = useNavigate();
  const location = useLocation();
  const isLandingPage = location.pathname === "/";

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("loggedInUser");
    handleSuccess("Successfully Logged out");
    setTimeout(() => {
      navigate("/");
    }, 1000);
  };

  return (
    <>
      <nav
        style={{
          position: isLandingPage ? "absolute" : "sticky",
          top: 0,
          left: 0,
          right: 0,
          zIndex: 100,
          background: isLandingPage
            ? "transparent"
            : "rgba(7, 8, 15, 0.85)",
          backdropFilter: isLandingPage ? "none" : "blur(20px)",
          WebkitBackdropFilter: isLandingPage ? "none" : "blur(20px)",
          borderBottom: isLandingPage
            ? "none"
            : "1px solid rgba(255,255,255,0.07)",
          padding: "0 24px",
          transition: "all 0.3s ease",
        }}
      >
        <div
          style={{
            maxWidth: "1280px",
            margin: "0 auto",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            height: "64px",
          }}
        >
          {/* Logo */}
          <Link
            to={isLoggedIn ? "/home" : "/"}
            style={{ textDecoration: "none", display: "flex", alignItems: "center", gap: "10px" }}
          >
            {/* Chain icon */}
            <div
              style={{
                width: "34px",
                height: "34px",
                background: "linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)",
                borderRadius: "9px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
                boxShadow: "0 4px 16px rgba(99,102,241,0.45)",
              }}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M10 13a5 5 0 007.54.54l3-3a5 5 0 00-7.07-7.07l-1.72 1.71" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M14 11a5 5 0 00-7.54-.54l-3 3a5 5 0 007.07 7.07l1.71-1.71" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
            <span
              style={{
                fontWeight: 700,
                fontSize: "1.1rem",
                background: "linear-gradient(135deg, #818cf8 0%, #c084fc 100%)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
                letterSpacing: "-0.01em",
              }}
            >
              PramanChain
            </span>
          </Link>

          {/* Nav actions */}
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            {isLoggedIn ? (
              <>
                <Wallet />
                <button
                  onClick={handleLogout}
                  style={{
                    padding: "8px 20px",
                    background: "rgba(239,68,68,0.12)",
                    color: "#f87171",
                    border: "1px solid rgba(239,68,68,0.25)",
                    borderRadius: "9px",
                    fontWeight: 600,
                    fontSize: "0.875rem",
                    cursor: "pointer",
                    transition: "all 0.2s ease",
                    fontFamily: "'Inter', sans-serif",
                  }}
                  onMouseEnter={(e) => {
                    (e.currentTarget as HTMLButtonElement).style.background = "rgba(239,68,68,0.2)";
                    (e.currentTarget as HTMLButtonElement).style.borderColor = "rgba(239,68,68,0.5)";
                  }}
                  onMouseLeave={(e) => {
                    (e.currentTarget as HTMLButtonElement).style.background = "rgba(239,68,68,0.12)";
                    (e.currentTarget as HTMLButtonElement).style.borderColor = "rgba(239,68,68,0.25)";
                  }}
                >
                  Logout
                </button>
              </>
            ) : (
              !isLandingPage && (
                <>
                  <Link
                    to="/login"
                    style={{
                      padding: "8px 20px",
                      color: "#94a3b8",
                      textDecoration: "none",
                      fontWeight: 500,
                      fontSize: "0.875rem",
                      borderRadius: "9px",
                      transition: "color 0.2s ease",
                    }}
                    onMouseEnter={(e) => ((e.currentTarget as HTMLAnchorElement).style.color = "#f1f5f9")}
                    onMouseLeave={(e) => ((e.currentTarget as HTMLAnchorElement).style.color = "#94a3b8")}
                  >
                    Login
                  </Link>
                  <Link
                    to="/signup"
                    className="btn-primary"
                    style={{ padding: "8px 20px", fontSize: "0.875rem" }}
                  >
                    Sign Up
                  </Link>
                </>
              )
            )}
          </div>
        </div>
      </nav>
      <ToastContainer aria-label="Notification container" />
    </>
  );
}
