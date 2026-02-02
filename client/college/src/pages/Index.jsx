import { hover, motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import {
  ArrowRight,
  Users,
  TrendingUp,
  Award,
} from "lucide-react";

/* ---------------- Styles ---------------- */
const styles = {
  page: {
    minHeight: "100vh",
    background:
      "radial-gradient(circle at top left, rgba(59,130,246,0.15), transparent 40%)," +
      "radial-gradient(circle at bottom right, rgba(34,211,238,0.15), transparent 40%)," +
      "linear-gradient(135deg, #020617, #020617)",
    color: "#e5e7eb",
    position: "relative",
    overflow: "hidden",
    fontFamily: "Inter, system-ui, sans-serif",
  },
  center: {
    minHeight: "100vh",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    textAlign: "center",
    padding: "4rem 1rem",
    position: "relative",
    zIndex: 2,
  },
  badge: {
    display: "inline-flex",
    alignItems: "center",
    gap: "10px",
    padding: "8px 16px",
    borderRadius: "999px",
    background: "rgba(255,255,255,0.08)",
    border: "1px solid rgba(255,255,255,0.15)",
    fontSize: "14px",
    marginBottom: "2rem",
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: "50%",
    background: "#3b82f6",
  },
  title: {
    fontSize: "clamp(2.8rem, 6vw, 4.5rem)",
    fontWeight: 800,
    lineHeight: 1.15,
    marginBottom: "1.5rem",
  },
  gradientText: {
    background: "linear-gradient(90deg, #60a5fa, #22d3ee)",
    WebkitBackgroundClip: "text",
    WebkitTextFillColor: "transparent",
  },
  subtitle: {
    maxWidth: 700,
    fontSize: "1.1rem",
    lineHeight: 1.8,
    color: "#cbd5f5",
    marginBottom: "2.5rem",
  },
  cta: {
    display: "flex",
    gap: "1rem",
    flexWrap: "wrap",
    justifyContent: "center",
    marginBottom: "4rem",
  },
  btnPrimary: {
    display: "inline-flex",
    alignItems: "center",
    gap: "10px",
    padding: "14px 26px",
    borderRadius: "14px",
    background: "linear-gradient(135deg, #3b82f6, #2563eb)",
    color: "#fff",
    border: "none",
    cursor: "pointer",
    fontWeight: 600,
  },
  btnSecondary: {
    display: "inline-flex",
    alignItems: "center",
    gap: "10px",
    padding: "14px 26px",
    borderRadius: "14px",
    background: "transparent",
    color: "#e5e7eb",
    border: "1px solid rgba(255,255,255,0.2)",
    cursor: "pointer",
    fontWeight: 600,
  },
  statsGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))",
    gap: "1.5rem",
    maxWidth: 900,
    width: "100%",
    padding: "2rem",
    borderRadius: "20px",
    background: "rgba(15,23,42,0.6)",
    border: "1px solid rgba(255,255,255,0.08)",
    backdropFilter: "blur(12px)",
  },
  features: {
    marginTop: "4rem",
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
    gap: "1.5rem",
    maxWidth: 1000,
    width: "100%",
  },
};

/* ---------------- Floating Orbs ---------------- */
const FloatingOrbs = () => (
  <>
    <motion.div
      style={{
        position: "absolute",
        width: 380,
        height: 380,
        borderRadius: "50%",
        background: "rgba(59,130,246,0.15)",
        filter: "blur(120px)",
        top: "10%",
        left: "10%",
      }}
      animate={{ y: [0, -30, 0], x: [0, 20, 0] }}
      transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
    />
    <motion.div
      style={{
        position: "absolute",
        width: 300,
        height: 300,
        borderRadius: "50%",
        background: "rgba(34,211,238,0.18)",
        filter: "blur(110px)",
        bottom: "20%",
        right: "15%",
      }}
      animate={{ y: [0, 40, 0], x: [0, -30, 0] }}
      transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
    />
  </>
);

/* ---------------- Stats Card ---------------- */
const StatsCard = ({ number, label }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.6 }}
  >
    <div style={{ fontSize: "2rem", fontWeight: 700, color: "#60a5fa" }}>
      {number}
    </div>
    <div style={{ color: "#9ca3af", marginTop: 4 }}>{label}</div>
  </motion.div>
);

/* ---------------- Feature Card ---------------- */
const FeatureCard = ({ icon, title, description }) => (
  <motion.div
    whileHover={{ y: -6, scale: 1.03 }}
    transition={{ duration: 0.25 }}
    style={{
      padding: "24px",
      borderRadius: "18px",
      background: "rgba(15,23,42,0.6)",
      border: "1px solid rgba(255,255,255,0.08)",
      textAlign: "left",
    }}
  >
    <div
      style={{
        width: 48,
        height: 48,
        borderRadius: 12,
        background: "rgba(59,130,246,0.2)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        color: "#60a5fa",
        marginBottom: 16,
      }}
    >
      {icon}
    </div>
    <h3 style={{ marginBottom: 8 }}>{title}</h3>
    <p style={{ color: "#9ca3af", fontSize: 14 }}>{description}</p>
  </motion.div>
);

const Index = () => {
  const navigate = useNavigate();
  return (
    <div style={styles.page}>
      <FloatingOrbs />

      <div style={styles.center}>

        <motion.h1
          style={styles.title}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <span style={styles.gradientText}>College Placement</span>
          <br />
          Cell Portal
        </motion.h1>

        <motion.p
          style={styles.subtitle}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          Connecting talented students with top-tier companies. Explore
          opportunities, build skills, and land your dream job.
        </motion.p>

        <motion.div style={styles.cta}>
          <button style={styles.btnPrimary}
            onClick={() => navigate("/login")}
            >
            Explore Opportunities <ArrowRight size={18} />
          </button>
        </motion.div>

        <div style={styles.statsGrid}>
          <StatsCard number="70+" label="Companies" />
          <StatsCard number="95%" label="Placement Rate" />
          <StatsCard number="100+" label="Students Placed" />
        </div>

        <div style={styles.features}>
          <FeatureCard
            icon={<Users size={22} />}
            title="Student Registration"
            description="Create your profile and get discovered by top recruiters"
          />
          <FeatureCard
            icon={<TrendingUp size={22} />}
            title="Career Resources"
            description="career guidance, resume reviews & workshops"
          />
          <FeatureCard
            icon={<Award size={22} />}
            title="Campus Drives"
            description="Stay updated with upcoming placement drives"
          />
        </div>
      </div>
    </div>
  );
};

export default Index;
