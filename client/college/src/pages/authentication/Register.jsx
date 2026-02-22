import React, { useState, useEffect } from "react";
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
import axios from "axios";
import { toast } from "react-toastify";
import "./Register.css";

const Register = () => {
  const navigate = useNavigate();

  const [role, setRole] = useState("");
  const [formData, setFormData] = useState({
    roll_no: "",
    full_name: "",
    dob: "",
    gender: "",
    email: "",
    phone: "",
    college: "",
    department: "",
    course: "",
    semester: "",
    designation: "",
    qualification: "",
    experience: "",
    position: "",
    office_role: "",
    password: "",
    confirm_password: "",
    image: null,
  });

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [imagePreview, setImagePreview] = useState(null);

  useEffect(() => {
    return () => {
      if (imagePreview) {
        URL.revokeObjectURL(imagePreview);
      }
    };
  }, [imagePreview]);

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    
    if (name === "image" && files && files[0]) {
      const file = files[0];
      setFormData({ ...formData, image: file });
      
      // Cleanup old preview and create new one
      if (imagePreview) URL.revokeObjectURL(imagePreview);
      setImagePreview(URL.createObjectURL(file));
    } else {
      setFormData({
        ...formData,
        [name]: value,
      });
    }
    setError("");
  };

  const handleRemoveImage = () => {
    if (imagePreview) URL.revokeObjectURL(imagePreview);
    setImagePreview(null);
    setFormData({ ...formData, image: null });
  };

  const buildPayloadByRole = () => {
    const commonFields = {
      role: role,
      full_name: formData.full_name,
      email: formData.email,
      phone: formData.phone,
      password: formData.password,
      image: formData.image,
    };

    if (role === "student") {
      return {
        ...commonFields,
        dob: formData.dob,
        gender: formData.gender,
        college: formData.college,
        department: formData.department,
        course: formData.course,
        semester: formData.semester,
        roll_no: formData.roll_no,
      };
    }

    if (role === "teacher") {
      return {
        ...commonFields,
        designation: formData.designation,
        qualification: formData.qualification,
        department: formData.department,
        experience: formData.experience,
        position: formData.position,
      };
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    if (!role) {
      setError("Please select a role.");
      setLoading(false);
      return;
    }

    // New Validations
    if (formData.phone.length !== 10 || !/^\d+$/.test(formData.phone)) {
      setError("Mobile number must be exactly 10 digits.");
      setLoading(false);
      return;
    }

    if (!formData.email.toLowerCase().endsWith("@gmail.com")) {
      setError("Please use a @gmail.com email address.");
      setLoading(false);
      return;
    }

    if (role === "student" && (formData.roll_no.length !== 10 || !/^\d+$/.test(formData.roll_no))) {
      setError("Register No must be exactly 10 digits.");
      setLoading(false);
      return;
    }

    if (formData.password.length < 8) {
      setError("Password must be at least 8 characters long.");
      setLoading(false);
      return;
    }

    if (formData.password !== formData.confirm_password) {
      setError("Passwords do not match.");
      setLoading(false);
      return;
    }

    try {
      const payload = buildPayloadByRole();
      
      const formDataToSend = new FormData();
      Object.keys(payload).forEach(key => {
        // Append only if value is not null 
        if (payload[key] !== null && payload[key] !== undefined) {
             formDataToSend.append(key, payload[key]);
        }
      });

      console.log("Register Payload (FormData):", payload);
      
      const response = await axios.post("http://127.0.0.1:8000/api/accounts/register/", formDataToSend, {
        headers: { "Content-Type": "multipart/form-data" }
      });
      console.log("Response:", response.data);

      if (response.data.pending) {
        setLoading(false);
        setError(""); // Clear any previous error
        setFormData({ ...formData, password: "", confirm_password: "" }); // Clear sensitive fields
        // Show success alert/message instead of navigating
        toast.success(response.data.message);
        navigate("/authentication/login");
        return;
      }

      // Store user details for immediate login after registration (only for non-pending users)
      localStorage.setItem('userRole', response.data.role);
      localStorage.setItem('userId', response.data.user_id);
      localStorage.setItem('user', JSON.stringify(response.data));

      setLoading(false);
      navigate("/home");
    } catch (err) {
       console.error("Registration Error:", err);
       
       let errorMsg = "Registration failed. Please try again.";
       
       if (err.response?.data) {
           const data = err.response.data;
           // If it's a field-specific error (object), join the messages
           if (typeof data === 'object' && !data.message && !data.error) {
               const firstField = Object.keys(data)[0];
               const errors = data[firstField];
               errorMsg = Array.isArray(errors) ? `${firstField}: ${errors[0]}` : JSON.stringify(data);
           } else {
               errorMsg = data.message || data.error || errorMsg;
           }
       }
       
       setError(errorMsg);
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
              <h2>Create Account</h2>
              <p>Register to access placement portal</p>
            </div>

            {error && <div className="error-msg">{error}</div>}

            <form onSubmit={handleSubmit} className="grid-form">
              {/* Role Selector */}
              <div className="form-group">
                <select 
                  name="role" 
                  className="input-field select" 
                  value={role} 
                  onChange={(e) => setRole(e.target.value)}
                >
                  <option value="">Select Role</option>
                  <option value="student">Student</option>
                  <option value="teacher">Teacher</option>
                </select>
              </div>

              {/* Common Fields */}
              <Input icon={<User />} name="full_name" placeholder="Full Name" onChange={handleChange} />
              <Input icon={<Mail />} name="email" placeholder="Email Address" onChange={handleChange} />
              <Input icon={<Phone />} name="phone" placeholder="Mobile Number" onChange={handleChange} />

              {/* Role-specific Fields */}
              {role === "student" && (
                <>
                  <Input name="roll_no" placeholder="Register No" onChange={handleChange} />
                  <Input type="date" name="dob" placeholder="Date of Birth" onChange={handleChange} />
                  <Select name="gender" options={["Male", "Female"]} onChange={handleChange} />
                  <Input name="college" placeholder="College Name" onChange={handleChange} />
                  <Select name="department" options={["BME","EEE","EL","CM","CT","RPA"]} onChange={handleChange} />
                  <Select name="course" options={["Diploma"]} onChange={handleChange} />
                  <Select name="semester" options={["1st","2nd","3rd","4th","5th","6th"]} onChange={handleChange} />
                </>
              )}

              {role === "teacher" && (
                <>
                  <Input name="designation" placeholder="Designation" onChange={handleChange} />
                  <Input name="qualification" placeholder="Highest Qualification" onChange={handleChange} />
                  <Select name="department" options={["BME","EEE","EL","CM","CT","RPA"]} onChange={handleChange} />
                  <Input name="experience" placeholder="Years of Experience" onChange={handleChange} />
                  <Select name="position" options={["HOD","Faculty"]} onChange={handleChange} />
                </>
              )}

              {/* Password */}
              <Input icon={<Lock />} type="password" name="password" placeholder="Password" onChange={handleChange} />
              <Input icon={<Lock />} type="password" name="confirm_password" placeholder="Confirm Password" onChange={handleChange} />

              {/* Profile Image */}
              <div className="file-upload-wrapper">
                <label className={`file-upload ${imagePreview ? 'has-preview' : ''}`}>
                  <input type="file" name="image" accept="image/*" onChange={handleChange} />
                  {imagePreview ? (
                    <div className="preview-container">
                      <img src={imagePreview} alt="Profile Preview" className="image-preview" />
                      <div className="preview-overlay">
                        <span>Change Image</span>
                      </div>
                    </div>
                  ) : (
                    <>
                      <ImageIcon size={18} />
                      <span>{formData.image ? formData.image.name : "Upload Profile Image.. must be less than 2MB"}</span>
                    </>
                  )}
                </label>
                {imagePreview && (
                  <button type="button" onClick={handleRemoveImage} className="remove-image-btn">
                    Remove Image
                  </button>
                )}
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
