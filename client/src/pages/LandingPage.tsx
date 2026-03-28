import React, { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";

/* ---------- Animated Counter ---------- */
function AnimatedCounter({ target, suffix = "" }: { target: number; suffix?: string }) {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  const started = useRef(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !started.current) {
          started.current = true;
          const duration = 1800;
          const steps = 60;
          const increment = target / steps;
          let current = 0;
          const timer = setInterval(() => {
            current += increment;
            if (current >= target) {
              setCount(target);
              clearInterval(timer);
            } else {
              setCount(Math.floor(current));
            }
          }, duration / steps);
        }
      },
      { threshold: 0.3 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [target]);

  return (
    <span ref={ref}>
      {count.toLocaleString()}
      {suffix}
    </span>
  );
}

/* ---------- Particle ---------- */
function Particle({ style }: { style: React.CSSProperties }) {
  return (
    <div
      style={{
        position: "absolute",
        width: 4,
        height: 4,
        borderRadius: "50%",
        background: "rgba(99,102,241,0.6)",
        ...style,
      }}
    />
  );
}

const LandingPage: React.FC = () => {
  const particles = Array.from({ length: 18 }, (_, i) => ({
    id: i,
    top: `${Math.random() * 90}%`,
    left: `${Math.random() * 100}%`,
    delay: `${Math.random() * 6}s`,
    duration: `${4 + Math.random() * 5}s`,
    size: 2 + Math.random() * 4,
    opacity: 0.2 + Math.random() * 0.5,
  }));

  return (
    <div style={{ background: "var(--color-bg-primary)", overflowX: "hidden" }}>
      {/* ===== HERO ===== */}
      <section
        style={{
          minHeight: "100vh",
          position: "relative",
          display: "flex",
          alignItems: "center",
          overflow: "hidden",
        }}
      >
        {/* Gradient orbs */}
        <div
          style={{
            position: "absolute",
            top: "15%",
            left: "5%",
            width: "520px",
            height: "520px",
            background: "radial-gradient(circle, rgba(99,102,241,0.18) 0%, transparent 70%)",
            animation: "orb 14s ease-in-out infinite",
            pointerEvents: "none",
          }}
        />
        <div
          style={{
            position: "absolute",
            top: "30%",
            right: "5%",
            width: "380px",
            height: "380px",
            background: "radial-gradient(circle, rgba(139,92,246,0.14) 0%, transparent 70%)",
            animation: "orb 18s ease-in-out infinite reverse",
            pointerEvents: "none",
          }}
        />
        <div
          style={{
            position: "absolute",
            bottom: "10%",
            left: "40%",
            width: "300px",
            height: "300px",
            background: "radial-gradient(circle, rgba(6,182,212,0.1) 0%, transparent 70%)",
            animation: "orb 12s ease-in-out infinite 2s",
            pointerEvents: "none",
          }}
        />

        {/* Particles */}
        {particles.map((p) => (
          <Particle
            key={p.id}
            style={{
              top: p.top,
              left: p.left,
              width: `${p.size}px`,
              height: `${p.size}px`,
              opacity: p.opacity,
              animation: `particleFloat ${p.duration} ease-in-out ${p.delay} infinite`,
            }}
          />
        ))}

        {/* Grid overlay */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            backgroundImage:
              "linear-gradient(rgba(99,102,241,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(99,102,241,0.04) 1px, transparent 1px)",
            backgroundSize: "60px 60px",
            maskImage: "radial-gradient(ellipse 80% 80% at center, black 20%, transparent 100%)",
            WebkitMaskImage: "radial-gradient(ellipse 80% 80% at center, black 20%, transparent 100%)",
            pointerEvents: "none",
          }}
        />

        <div style={{ maxWidth: "1280px", margin: "0 auto", padding: "120px 32px 80px", position: "relative", zIndex: 2, width: "100%" }}>
          <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: "64px" }}>
            {/* Left: Text */}
            <div style={{ flex: "1 1 480px", maxWidth: "620px" }}>
              {/* Badge */}
              <div
                className="animate-fade-in-up"
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "8px",
                  padding: "6px 16px",
                  background: "rgba(99,102,241,0.12)",
                  border: "1px solid rgba(99,102,241,0.3)",
                  borderRadius: "100px",
                  marginBottom: "28px",
                }}
              >
                <span style={{ width: 8, height: 8, borderRadius: "50%", background: "#6366f1", display: "inline-block", boxShadow: "0 0 8px #6366f1" }} />
                <span style={{ fontSize: "0.8rem", fontWeight: 600, color: "#a5b4fc", letterSpacing: "0.04em" }}>
                  POWERED BY ETHEREUM BLOCKCHAIN
                </span>
              </div>

              <h1
                className="animate-fade-in-up delay-100"
                style={{
                  fontSize: "clamp(2.5rem, 5vw, 4rem)",
                  fontWeight: 900,
                  lineHeight: 1.1,
                  letterSpacing: "-0.03em",
                  marginBottom: "20px",
                  color: "#f1f5f9",
                }}
              >
                Academic Records
                <br />
                <span
                  style={{
                    background: "linear-gradient(135deg, #818cf8 0%, #c084fc 50%, #38bdf8 100%)",
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                    backgroundClip: "text",
                  }}
                >
                  Secured Forever
                </span>
              </h1>

              <p
                className="animate-fade-in-up delay-200"
                style={{
                  fontSize: "1.1rem",
                  color: "#94a3b8",
                  lineHeight: 1.75,
                  maxWidth: "520px",
                  marginBottom: "40px",
                }}
              >
                Create, store, and instantly verify tamper-proof marksheets on the blockchain. Built for institutions that care about trust and transparency.
              </p>

              <div className="animate-fade-in-up delay-300" style={{ display: "flex", gap: "16px", flexWrap: "wrap" }}>
                <Link to="/signup" className="btn-primary" style={{ fontSize: "1rem", padding: "14px 32px" }}>
                  Get Started Free
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <path d="M5 12h14M12 5l7 7-7 7" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </Link>
                <Link to="/login" className="btn-secondary" style={{ fontSize: "1rem", padding: "14px 32px" }}>
                  Sign In
                </Link>
              </div>

              {/* Trust indicators */}
              <div
                className="animate-fade-in-up delay-400"
                style={{ display: "flex", gap: "28px", marginTop: "48px", flexWrap: "wrap" }}
              >
                {[
                  { icon: "🔒", label: "Tamper-proof records" },
                  { icon: "⚡", label: "Instant verification" },
                  { icon: "🌐", label: "Decentralized storage" },
                ].map((item) => (
                  <div key={item.label} style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                    <span style={{ fontSize: "1.1rem" }}>{item.icon}</span>
                    <span style={{ fontSize: "0.82rem", color: "#64748b", fontWeight: 500 }}>{item.label}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Right: Visual card */}
            <div className="animate-slide-right delay-200" style={{ flex: "1 1 340px", maxWidth: "460px" }}>
              <div
                className="animate-float"
                style={{
                  background: "rgba(255,255,255,0.04)",
                  backdropFilter: "blur(24px)",
                  border: "1px solid rgba(255,255,255,0.1)",
                  borderRadius: "24px",
                  padding: "32px",
                  boxShadow: "0 32px 80px rgba(0,0,0,0.6), 0 0 60px rgba(99,102,241,0.08)",
                }}
              >
                {/* Mock marksheet card */}
                <div style={{ display: "flex", alignItems: "center", gap: "14px", marginBottom: "24px" }}>
                  <div style={{
                    width: 48, height: 48,
                    background: "linear-gradient(135deg, #6366f1, #8b5cf6)",
                    borderRadius: "14px",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    boxShadow: "0 8px 24px rgba(99,102,241,0.4)",
                  }}>
                    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
                      <path d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </div>
                  <div>
                    <div style={{ fontWeight: 700, color: "#f1f5f9", fontSize: "0.95rem" }}>Marksheet Verified ✓</div>
                    <div style={{ color: "#64748b", fontSize: "0.78rem" }}>Stored on Ethereum · Block #19842301</div>
                  </div>
                </div>

                {/* Subjects mock */}
                {[
                  { name: "Data Structures", grade: "O", gpa: 10, color: "#34d399" },
                  { name: "Operating Systems", grade: "A+", gpa: 9, color: "#818cf8" },
                  { name: "Machine Learning", grade: "A", gpa: 8, color: "#38bdf8" },
                  { name: "Cloud Computing", grade: "B+", gpa: 7, color: "#fb923c" },
                  { name: "Web Development", grade: "O", gpa: 10, color: "#34d399" },
                ].map((s, i) => (
                  <div key={i} style={{
                    display: "flex", alignItems: "center", justifyContent: "space-between",
                    padding: "10px 14px", marginBottom: "8px",
                    background: "rgba(255,255,255,0.03)",
                    border: "1px solid rgba(255,255,255,0.06)",
                    borderRadius: "10px",
                  }}>
                    <span style={{ color: "#94a3b8", fontSize: "0.83rem" }}>{s.name}</span>
                    <span style={{
                      padding: "3px 10px", borderRadius: "6px",
                      background: `${s.color}20`,
                      color: s.color, fontWeight: 700, fontSize: "0.8rem",
                    }}>{s.grade}</span>
                  </div>
                ))}

                <div style={{
                  marginTop: "20px", padding: "14px",
                  background: "linear-gradient(135deg, rgba(99,102,241,0.15), rgba(139,92,246,0.15))",
                  border: "1px solid rgba(99,102,241,0.25)",
                  borderRadius: "12px",
                  display: "flex", justifyContent: "space-between", alignItems: "center",
                }}>
                  <span style={{ color: "#94a3b8", fontSize: "0.85rem", fontWeight: 500 }}>SGPA</span>
                  <span style={{
                    fontSize: "1.4rem", fontWeight: 800,
                    background: "linear-gradient(135deg, #818cf8, #c084fc)",
                    WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text",
                  }}>9.20</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom gradient fade */}
        <div style={{
          position: "absolute", bottom: 0, left: 0, right: 0, height: "160px",
          background: "linear-gradient(to bottom, transparent, var(--color-bg-primary))",
          pointerEvents: "none",
        }} />
      </section>

      {/* ===== STATS ===== */}
      <section style={{ padding: "72px 32px", borderTop: "1px solid rgba(255,255,255,0.05)", borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
        <div style={{ maxWidth: "1000px", margin: "0 auto", display: "flex", flexWrap: "wrap", gap: "16px", justifyContent: "center" }}>
          {[
            { value: 12000, suffix: "+", label: "Records Secured" },
            { value: 48, suffix: "+", label: "Institutions" },
            { value: 99.9, suffix: "%", label: "Uptime" },
            { value: 3, suffix: "sec", label: "Avg. Verification" },
          ].map((stat) => (
            <div
              key={stat.label}
              style={{
                flex: "1 1 180px",
                textAlign: "center",
                padding: "32px 24px",
                background: "rgba(255,255,255,0.03)",
                border: "1px solid rgba(255,255,255,0.06)",
                borderRadius: "16px",
              }}
            >
              <div style={{ fontSize: "2.4rem", fontWeight: 800, color: "#818cf8", letterSpacing: "-0.02em" }}>
                <AnimatedCounter target={stat.value} suffix={stat.suffix} />
              </div>
              <div style={{ marginTop: "6px", fontSize: "0.85rem", color: "#64748b", fontWeight: 500 }}>
                {stat.label}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ===== FEATURES ===== */}
      <section style={{ padding: "100px 32px" }}>
        <div style={{ maxWidth: "1280px", margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: "64px" }}>
            <div style={{
              display: "inline-block", padding: "6px 18px",
              background: "rgba(99,102,241,0.1)",
              border: "1px solid rgba(99,102,241,0.25)",
              borderRadius: "100px", marginBottom: "16px",
            }}>
              <span style={{ fontSize: "0.8rem", fontWeight: 600, color: "#818cf8", letterSpacing: "0.06em" }}>FEATURES</span>
            </div>
            <h2 style={{ fontSize: "clamp(1.8rem, 3vw, 2.6rem)", fontWeight: 800, letterSpacing: "-0.02em", color: "#f1f5f9", marginBottom: "14px" }}>
              Why choose PramanChain?
            </h2>
            <p style={{ fontSize: "1rem", color: "#64748b", maxWidth: "480px", margin: "0 auto", lineHeight: 1.7 }}>
              Built with modern cryptographic standards and trusted blockchain infrastructure.
            </p>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "24px" }}>
            {[
              {
                icon: (
                  <svg width="26" height="26" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                ),
                color: "#6366f1",
                title: "Tamper-Proof Security",
                desc: "Cryptographic hashing ensures academic records are immutable once stored on-chain. Any modification is immediately detectable.",
              },
              {
                icon: (
                  <svg width="26" height="26" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path d="M13 10V3L4 14h7v7l9-11h-7z" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                ),
                color: "#8b5cf6",
                title: "Instant Verification",
                desc: "Scan the QR code embedded in any marksheet to verify its authenticity in seconds. No centralized database required.",
              },
              {
                icon: (
                  <svg width="26" height="26" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                ),
                color: "#06b6d4",
                title: "Digital Credentials",
                desc: "Generate PDF marksheets with embedded QR codes. Works for single entries or bulk Excel uploads.",
              },
              {
                icon: (
                  <svg width="26" height="26" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                ),
                color: "#ec4899",
                title: "Bulk Processing",
                desc: "Upload Excel files to generate and store hundreds of marksheets in one go, with real-time progress tracking.",
              },
              {
                icon: (
                  <svg width="26" height="26" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                ),
                color: "#f59e0b",
                title: "Role-Based Access",
                desc: "Secure authentication ensures only authorized faculty can issue marksheets while verification is publicly accessible.",
              },
              {
                icon: (
                  <svg width="26" height="26" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                ),
                color: "#34d399",
                title: "Decentralized",
                desc: "No single point of failure. Records are distributed across the Ethereum network, ensuring permanent availability.",
              },
            ].map((f) => (
              <div
                key={f.title}
                className="glass-card"
                style={{ padding: "32px" }}
                onMouseEnter={(e) => {
                  const el = e.currentTarget;
                  el.style.borderColor = `${f.color}50`;
                  el.style.boxShadow = `0 8px 40px rgba(0,0,0,0.5), 0 0 32px ${f.color}18`;
                }}
                onMouseLeave={(e) => {
                  const el = e.currentTarget;
                  el.style.borderColor = "rgba(255,255,255,0.08)";
                  el.style.boxShadow = "var(--shadow-card)";
                }}
              >
                <div style={{
                  width: 52, height: 52, borderRadius: "14px",
                  background: `${f.color}20`,
                  border: `1px solid ${f.color}35`,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  marginBottom: "20px", color: f.color,
                }}>
                  {f.icon}
                </div>
                <h3 style={{ fontWeight: 700, fontSize: "1rem", color: "#f1f5f9", marginBottom: "10px" }}>{f.title}</h3>
                <p style={{ color: "#64748b", fontSize: "0.875rem", lineHeight: 1.7 }}>{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== HOW IT WORKS ===== */}
      <section style={{ padding: "80px 32px", background: "rgba(255,255,255,0.015)", borderTop: "1px solid rgba(255,255,255,0.05)", borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
        <div style={{ maxWidth: "1100px", margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: "64px" }}>
            <div style={{
              display: "inline-block", padding: "6px 18px",
              background: "rgba(139,92,246,0.1)",
              border: "1px solid rgba(139,92,246,0.25)",
              borderRadius: "100px", marginBottom: "16px",
            }}>
              <span style={{ fontSize: "0.8rem", fontWeight: 600, color: "#c084fc", letterSpacing: "0.06em" }}>HOW IT WORKS</span>
            </div>
            <h2 style={{ fontSize: "clamp(1.8rem, 3vw, 2.4rem)", fontWeight: 800, letterSpacing: "-0.02em", color: "#f1f5f9" }}>
              Three steps to secure records
            </h2>
          </div>

          <div style={{ display: "flex", flexWrap: "wrap", gap: "16px", justifyContent: "center" }}>
            {[
              {
                step: "01",
                title: "Connect Wallet",
                desc: "Link your MetaMask wallet to authorize marksheet creation on the Ethereum blockchain.",
                color: "#6366f1",
              },
              {
                step: "02",
                title: "Enter Marks",
                desc: "Input student details, subjects and marks — or upload a bulk Excel file for batch processing.",
                color: "#8b5cf6",
              },
              {
                step: "03",
                title: "Instant Verification",
                desc: "A hash is stored on-chain. Share the QR code for instant, trustless verification by anyone, anywhere.",
                color: "#06b6d4",
              },
            ].map((step, i) => (
              <div key={i} style={{ flex: "1 1 280px", maxWidth: "340px", textAlign: "center", padding: "40px 32px" }}>
                <div style={{
                  width: 64, height: 64,
                  borderRadius: "50%",
                  border: `2px solid ${step.color}50`,
                  background: `${step.color}15`,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  margin: "0 auto 24px",
                  fontSize: "1.2rem",
                  fontWeight: 800,
                  color: step.color,
                  boxShadow: `0 0 32px ${step.color}20`,
                }}>
                  {step.step}
                </div>
                <h3 style={{ fontWeight: 700, fontSize: "1.05rem", color: "#f1f5f9", marginBottom: "12px" }}>{step.title}</h3>
                <p style={{ color: "#64748b", fontSize: "0.875rem", lineHeight: 1.75 }}>{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== CTA ===== */}
      <section style={{ padding: "100px 32px" }}>
        <div style={{ maxWidth: "700px", margin: "0 auto", textAlign: "center" }}>
          <div style={{
            padding: "60px 48px",
            background: "linear-gradient(135deg, rgba(99,102,241,0.12) 0%, rgba(139,92,246,0.1) 50%, rgba(6,182,212,0.08) 100%)",
            border: "1px solid rgba(99,102,241,0.25)",
            borderRadius: "28px",
            position: "relative",
            overflow: "hidden",
          }}>
            <div style={{
              position: "absolute", top: 0, left: "50%", transform: "translateX(-50%)",
              width: "60%", height: "1px",
              background: "linear-gradient(90deg, transparent, rgba(99,102,241,0.6), transparent)",
            }} />
            <h2 style={{ fontSize: "clamp(1.6rem, 3vw, 2.2rem)", fontWeight: 800, color: "#f1f5f9", letterSpacing: "-0.02em", marginBottom: "16px" }}>
              Ready to secure your records?
            </h2>
            <p style={{ color: "#94a3b8", fontSize: "1rem", lineHeight: 1.7, marginBottom: "36px" }}>
              Join institutions already using PramanChain to issue tamper-proof academic credentials on the blockchain.
            </p>
            <div style={{ display: "flex", gap: "16px", justifyContent: "center", flexWrap: "wrap" }}>
              <Link to="/signup" className="btn-primary" style={{ fontSize: "1rem", padding: "14px 36px" }}>
                Create Free Account
              </Link>
              <Link to="/login" className="btn-secondary" style={{ fontSize: "1rem", padding: "14px 36px" }}>
                Sign In
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ===== FOOTER ===== */}
      <footer style={{
        borderTop: "1px solid rgba(255,255,255,0.05)",
        padding: "32px",
        textAlign: "center",
        color: "#475569",
        fontSize: "0.83rem",
      }}>
        <p>© 2026 PramanChain · Blockchain-Powered Academic Records · Built with ❤️ on Ethereum</p>
      </footer>
    </div>
  );
};

export default LandingPage;