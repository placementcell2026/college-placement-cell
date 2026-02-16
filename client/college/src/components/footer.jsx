import { Github, Twitter, Linkedin, Mail, Heart } from "lucide-react";
import "./Footer.css";

const Footer = () => {
  return (
    <footer className="footer">
      <div className="footer-container">
        <div className="footer-grid">
          {/* Brand */}
          <div className="col-span-1 md:col-span-1">
            <div className="brand-header">
              <div className="brand-icon">C</div>
              <span className="brand-text">Placement Cell</span>
            </div>
            <p className="brand-desc">
              Empowering students to achieve their career dreams through
              world-class opportunities and guidance.
            </p>
            <div className="social-links">
              <SocialIcon icon={<Github size={18} />} />
              <SocialIcon icon={<Twitter size={18} />} />
              <SocialIcon icon={<Linkedin size={18} />} />
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="footer-heading">Quick Links</h3>
            <ul className="footer-links">
              <FooterLink>Home</FooterLink>
              <FooterLink>Jobs</FooterLink>
              <FooterLink>Companies</FooterLink>
              <FooterLink>Events</FooterLink>
            </ul>
          </div>

          {/* Resources */}
          <div>
            <h3 className="footer-heading">Resources</h3>
            <ul className="footer-links">
              <FooterLink>Resume Builder</FooterLink>
              <FooterLink>Interview Prep</FooterLink>
              <FooterLink>Career Guide</FooterLink>
              <FooterLink>Alumni Network</FooterLink>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="footer-heading">Contact</h3>
            <ul className="footer-links">
              <li className="contact-item">
                <Mail size={16} className="contact-icon" />
                <span>support@placement.edu</span>
              </li>
              <li className="contact-item">123 University Avenue</li>
              <li className="contact-item">Tech District, CA 94043</li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="footer-bottom">
          <p className="copyright">
            © {new Date().getFullYear()} College Placement Cell. All rights
            reserved.
          </p>
          <div className="made-with">
            <span>Made with</span>
            <Heart size={14} className="heart-icon" />
            <span>for students</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

const SocialIcon = ({ icon }) => (
  <a href="#" className="social-icon">
    {icon}
  </a>
);

const FooterLink = ({ children }) => (
  <li>
    <a href="#" className="footer-link">
      {children}
    </a>
  </li>
);

export default Footer;
