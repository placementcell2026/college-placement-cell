import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { User, Lock, Briefcase, GraduationCap, ChevronRight, Loader2 } from "lucide-react";
import "./Login.css";

const Login = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    phone: "",
    password: "",
    role: "",
  });
  console.log("formData", formData);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    if (error) setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    // Simulate network delay for effect
    await new Promise((resolve) => setTimeout(resolve, 800));

    if (!formData.phone || !formData.password || !formData.role) {
      setError("Please complete all fields to continue.");
      setIsLoading(false);
      return;
    }

    console.log("Login Attempt:", formData);
    setIsLoading(false);
    navigate("/dashboard");
  };

  return (
    <div className="login-page">
      {/* Abstract Background Elements */}
      <div className="bg-shape blue" />
      <div className="bg-shape purple" />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="login-container"
      >
        <div className="login-card">
          <div className="card-padding">
            <div className="login-header">
              <motion.div
                initial={{ scale: 0.5, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.2, duration: 0.5 }}
                className="icon-wrapper"
              >
                <GraduationCap size={32} color="white" />
              </motion.div>
              <h2 className="welcome-text">Welcome Back</h2>
              <p className="subtitle-text">Sign in to access your portal</p>
            </div>

            {error && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                className="error-msg"
              >
                {error}
              </motion.div>
            )}

            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <div className="input-icon">
                  <User size={20} />
                </div>
                <input
                  type="tel"
                  name="phone"
                  placeholder="Phone Number"
                  value={formData.phone}
                  onChange={handleChange}
                  className="input-field"
                />
              </div>

              <div className="form-group">
                <div className="input-icon">
                  <Lock size={20} />
                </div>
                <input
                  type="password"
                  name="password"
                  placeholder="Password"
                  value={formData.password}
                  onChange={handleChange}
                  className="input-field"
                />
              </div>

              <div className="form-group select-wrapper">
                <div className="input-icon">
                  <Briefcase size={20} />
                </div>
                <select
                  name="role"
                  value={formData.role}
                  onChange={handleChange}
                  className="input-field select"
                >
                  <option value="">Select Role</option>
                  <option value="student">Student</option>
                  <option value="teacher">Teacher</option>
                  <option value="placement">Placement Cell Officer</option>
                </select>
                <div className="select-chevron">
                  <ChevronRight size={16} />
                </div>
              </div>

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                type="submit"
                disabled={isLoading}
                className="submit-btn"
              >
                {isLoading ? (
                  <Loader2 size={20} className="animate-spin" style={{ animation: "spin 1s linear infinite" }} />
                ) : (
                  <>
                    Sign In
                    <ChevronRight size={16} className="btn-arrow" />
                  </>
                )}
              </motion.button>
            </form>
          </div>

          <div className="login-footer">
            <p className="footer-text">
              Don't have an account?{" "}
              <button
                onClick={() => navigate("/register")}
                className="register-link"
              >
                Register now
              </button>
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default Login;
