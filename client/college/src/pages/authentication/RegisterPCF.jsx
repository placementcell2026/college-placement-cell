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
  RefreshCw,
  ShieldCheck,
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
    captcha_value: "",
  });

  const [captcha, setCaptcha] = useState({ key: "", image: null });
  const [isCaptchaLoading, setIsCaptchaLoading] = useState(false);
  const [imagePreview, setImagePreview] = useState(null);

  React.useEffect(() => {
    fetchCaptcha();
  }, []);

  const fetchCaptcha = async () => {
    setIsCaptchaLoading(true);
    try {
      const res = await axios.get("http://127.0.0.1:8000/api/accounts/captcha/");
      setCaptcha({ key: res.data.captcha_key, image: res.data.captcha_image });
      setFormData(prev => ({ ...prev, captcha_value: "" }));
    } catch (err) {
      console.error("Failed to fetch captcha:", err);
    } finally {
      setIsCaptchaLoading(false);
    }
  };

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    
    if (name === "image" && files && files[0]) {
      const file = files[0];
      setFormData({ ...formData, image: file });
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    if (formData.password !== formData.confirm_password) {
      setError("Passwords do not match.");
      setLoading(false);
      return;
    }

    if (!formData.captcha_value) {
      setError("Please prove you're not a robot! 🤖");
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
        captcha_key: captcha.key,
        captcha_value: formData.captcha_value,
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
      navigate("/home/placement");
    } catch (err) {
       console.error("Registration Error:", err);
       setError(err.response?.data?.error || "Registration failed. Please try again.");
       setLoading(false);
       fetchCaptcha();
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
                {imagePreview ? (
                  <img src={imagePreview} alt="Preview" style={{ width: '40px', height: '40px', borderRadius: '4px', objectFit: 'cover' }} />
                ) : (
                  <ImageIcon size={18} />
                )}
                <input type="file" name="image" accept="image/*" onChange={handleChange} />
                <span>{formData.image ? formData.image.name : "Upload Profile Image"}</span>
              </div>

              {/* Captcha Section */}
              <div className="captcha-section md:col-span-2">
                <div className="funny-quote" style={{ color: '#94a3b8', fontSize: '0.875rem', marginBottom: '0.5rem', textAlign: 'center' }}>
                  Are you a robot? 🤖 Then prove it! 🧐...
                </div>
                <div className="captcha-container" style={{ display: 'flex', gap: '1rem', alignItems: 'center', background: 'rgba(15, 23, 42, 0.5)', padding: '1rem', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.1)' }}>
                  <div className="captcha-image-wrapper" style={{ position: 'relative' }}>
                    {isCaptchaLoading ? (
                      <div style={{ padding: '10px' }}><Loader2 className="spin" size={20} /></div>
                    ) : captcha.image ? (
                      <img src={captcha.image} alt="Captcha" style={{ height: '40px', borderRadius: '4px' }} />
                    ) : null}
                    <button 
                      type="button" 
                      onClick={fetchCaptcha} 
                      style={{ position: 'absolute', top: '-10px', right: '-10px', background: '#3b82f6', border: 'none', borderRadius: '50%', width: '24px', height: '24px', display: 'flex', alignItems: 'center', justifyCenter: 'center', cursor: 'pointer', color: 'white' }}
                      disabled={isCaptchaLoading}
                    >
                      <RefreshCw size={12} className={isCaptchaLoading ? "spin" : ""} />
                    </button>
                  </div>
                  <div style={{ flex: 1 }}>
                    <Input 
                      icon={<ShieldCheck size={18} />} 
                      name="captcha_value" 
                      placeholder="Verify Captcha" 
                      value={formData.captcha_value}
                      onChange={handleChange}
                      required
                      style={{ marginBottom: 0 }}
                    />
                  </div>
                </div>
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
