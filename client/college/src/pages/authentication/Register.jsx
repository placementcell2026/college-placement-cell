import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  User,
  Mail,
  Phone,
  Lock,
  Calendar,
  GraduationCap,
  Building2,
  BookOpen,
  Image as ImageIcon,
  ChevronRight,
  Loader2,
} from "lucide-react";
import "./Register.css";

const Register = () => {
  const navigate = useNavigate();

  const [role, setRole] = useState("");
  const [formData, setFormData] = useState({
    studentId: "",
    fullName: "",
    dob: "",
    gender: "",
    email: "",
    phone: "",
    college: "",
    department: "",
    course: "",
    semester: "",
    rollNo: "",
    designation: "",
    qualification: "",
    experience: "",
    position: "",
    officeRole: "",
    password: "",
    confirmPassword: "",
    image: null,
  });

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    setFormData({
      ...formData,
      [name]: files ? files[0] : value,
    });
    setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    if (!role) {
      setError("Please select a role.");
      setLoading(false);
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match.");
      setLoading(false);
      return;
    }

    // Simulate API call
    await new Promise((r) => setTimeout(r, 800));

    const payload = { role, ...formData };
    console.log("Register Payload:", payload);

    setLoading(false);
    navigate("/authentication/login");
  };

  return (
    <div className="register-page">
      <div className="bg-shape blue" />
      <div className="bg-shape purple" />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="register-container"
      >
        <div className="register-card">
          <div className="card-padding">
            <div className="register-header">
              <div className="icon-wrapper">
                <GraduationCap size={32} color="white" />
              </div>
              <h2>Create Account</h2>
              <p>Register to access placement portal</p>
            </div>

            {error && <div className="error-msg">{error}</div>}

            <form onSubmit={handleSubmit} className="grid-form">
              {/* Role Selector */}
              <Select
                name="role"
                value={role}
                options={["Student", "Teacher", "Placement Cell Officer"]}
                onChange={(e) => setRole(e.target.value.toLowerCase())}
              />

              {/* Common Fields */}
              <Input icon={<User />} name="fullName" placeholder="Full Name" onChange={handleChange} />
              <Input icon={<Mail />} name="email" placeholder="Email Address" onChange={handleChange} />
              <Input icon={<Phone />} name="phone" placeholder="Mobile Number" onChange={handleChange} />

              {/* Role-specific Fields */}
              {role === "student" && (
                <>
                  <Input name="studentId" placeholder="Student ID" onChange={handleChange} />
                  <Input type="date" name="dob" placeholder="Date of Birth" onChange={handleChange} />
                  <Select name="gender" options={["Male", "Female", "Other"]} onChange={handleChange} />
                  <Input name="college" placeholder="College Name" onChange={handleChange} />
                  <Input name="department" placeholder="Department / Branch" onChange={handleChange} />
                  <Select name="course" options={["UG", "PG"]} onChange={handleChange} />
                  <Input name="semester" placeholder="Current Semester / Year" onChange={handleChange} />
                  <Input name="rollNo" placeholder="Enrollment / Roll Number" onChange={handleChange} />
                </>
              )}

              {role === "teacher" && (
                <>
                  <Input name="designation" placeholder="Designation" onChange={handleChange} />
                  <Input name="qualification" placeholder="Highest Qualification" onChange={handleChange} />
                  <Input name="department" placeholder="Department / Branch" onChange={handleChange} />
                  <Input name="experience" placeholder="Years of Experience" onChange={handleChange} />
                  <Input name="position" placeholder="Position (HOD / Faculty)" onChange={handleChange} />
                </>
              )}

              {role === "placement" && (
                <>
                  <Input name="designation" placeholder="Designation" onChange={handleChange} />
                  <Input name="officeRole" placeholder="Office Role" onChange={handleChange} />
                  <Input name="experience" placeholder="Years of Experience" onChange={handleChange} />
                  <Input name="college" placeholder="College Name" onChange={handleChange} />
                </>
              )}

              {/* Password */}
              <Input icon={<Lock />} type="password" name="password" placeholder="Password" onChange={handleChange} />
              <Input icon={<Lock />} type="password" name="confirmPassword" placeholder="Confirm Password" onChange={handleChange} />

              {/* Profile Image */}
              <div className="file-upload">
                <ImageIcon size={18} />
                <input type="file" name="image" accept="image/*" onChange={handleChange} />
                <span>Upload Profile Image</span>
              </div>

              {/* Submit */}
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                type="submit"
                className="submit-btn"
              >
                {loading ? <Loader2 className="spin" /> : <>Register <ChevronRight size={16} /></>}
              </motion.button>
            </form>
          </div>

          <div className="register-footer">
            <p>
              Already have an account?
              <button onClick={() => navigate("/authentication/login")}>Login</button>
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

/* ---------------- Reusable Components ---------------- */
const Input = ({ icon, ...props }) => (
  <div className="form-group">
    {icon && <div className="input-icon">{icon}</div>}
    <input className="input-field" {...props} />
  </div>
);

const Select = ({ name, options, value, onChange }) => (
  <div className="form-group">
    <select name={name} className="input-field select" value={value} onChange={onChange}>
      <option value="">Select {name}</option>
      {options.map((o) => (
        <option key={o} value={o.toLowerCase()}>
          {o}
        </option>
      ))}
    </select>
  </div>
);

export default Register;
