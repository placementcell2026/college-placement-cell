import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  User,
  Mail,
  Phone,
  Lock,
  GraduationCap,
  Image as ImageIcon,
  ChevronRight,
  Loader2,
} from "lucide-react";
import axios from "axios";
import "./Register.css";

const RegisterPCF = () => {
  const navigate = useNavigate();

  // Fixed role for this page
  const role = "placement";
  
  const [formData, setFormData] = useState({
    full_name: "",
    email: "",
    phone: "",
    designation: "",
    office_role: "",
    experience: "",
    college: "",
    password: "",
    confirm_password: "",
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

    if (formData.password !== formData.confirm_password) {
      setError("Passwords do not match.");
      setLoading(false);
      return;
    }

    try {
      const payload = {
        role: role,
        full_name: formData.full_name,
        email: formData.email,
        phone: formData.phone,
        designation: formData.designation,
        office_role: formData.office_role,
        experience: formData.experience,
        college: formData.college,
        password: formData.password,
        image: formData.image,
      };
      
      const formDataToSend = new FormData();
      Object.keys(payload).forEach(key => {
        if (payload[key] !== null && payload[key] !== undefined) {
             formDataToSend.append(key, payload[key]);
        }
      });

      const response = await axios.post("http://127.0.0.1:8000/api/accounts/register/", formDataToSend, {
        headers: { "Content-Type": "multipart/form-data" }
      });

      localStorage.setItem('userRole', response.data.role);
      localStorage.setItem('userId', response.data.user_id);
      localStorage.setItem('user', JSON.stringify(response.data));

      setLoading(false);
      navigate("/home");
    } catch (err) {
       console.error("Registration Error:", err);
       setError(err.response?.data?.error || "Registration failed. Please try again.");
       setLoading(false);
    }
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
              <h2>Registration</h2>
              <p>Placement Cell Officer Portal Access</p>
            </div>

            {error && <div className="error-msg">{error}</div>}

            <form onSubmit={handleSubmit} className="grid-form">
              <Input icon={<User />} name="full_name" placeholder="Full Name" onChange={handleChange} required />
              <Input icon={<Mail />} name="email" placeholder="Email Address" onChange={handleChange} required />
              <Input icon={<Phone />} name="phone" placeholder="Mobile Number" onChange={handleChange} required />
              
              <Input name="designation" placeholder="Designation" onChange={handleChange} required />
              <Input name="office_role" placeholder="Office Role" onChange={handleChange} required />
              <Input name="experience" placeholder="Years of Experience" onChange={handleChange} required />
              <Input name="college" placeholder="College Name" onChange={handleChange} required />

              <Input icon={<Lock />} type="password" name="password" placeholder="Password" onChange={handleChange} required />
              <Input icon={<Lock />} type="password" name="confirm_password" placeholder="Confirm Password" onChange={handleChange} required />

              <div className="file-upload">
                <ImageIcon size={18} />
                <input type="file" name="image" accept="image/*" onChange={handleChange} />
                <span>Upload Profile Image</span>
              </div>

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                type="submit"
                className="submit-btn"
              >
                {loading ? <Loader2 className="spin" /> : <>Register PCF <ChevronRight size={16} /></>}
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

const Input = ({ icon, ...props }) => (
  <div className="form-group">
    {icon && <div className="input-icon">{icon}</div>}
    <input className="input-field" {...props} />
  </div>
);

export default RegisterPCF;
