import type { ReactNode } from "react";
import { Link } from "react-router-dom";

interface FooterProps {
  children?: ReactNode;
}

export default function Footer({ children }: FooterProps) {
  return (
    <footer className="site-footer">
      <div className="site-footer__main">
        <div className="site-footer__container">
          <div className="site-footer__col site-footer__col--brand">
            <Link className="brand site-footer__brand" to="/" aria-label="Exertio Home">
              <span className="brand__mark brand__mark--exertio" aria-hidden="true">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
                  <path d="M12 2L2 12L12 22L22 12L12 2Z" fill="url(#exertio-footer-grad)" />
                  <path d="M12 6L6 12L12 18L18 12L12 6Z" fill="#ffffff" />
                  <defs>
                    <linearGradient id="exertio-footer-grad" x1="2" y1="2" x2="22" y2="22" gradientUnits="userSpaceOnUse">
                      <stop stopColor="#ff5b60" />
                      <stop offset="1" stopColor="#ff3366" />
                    </linearGradient>
                  </defs>
                </svg>
              </span>
              <span className="brand__text brand__text--exertio">exertio<span>.</span></span>
            </Link>
            <p className="site-footer__tagline">
              Connecting visionaries with world-class freelance professionals for any project, anytime, anywhere.
            </p>
          </div>

          <div className="site-footer__col">
            <h4>For Clients</h4>
            <ul>
              <li><Link to="/freelancers">Find Freelancers</Link></li>
              <li><Link to="/projects/create">Post a Project</Link></li>
              <li><Link to="/projects">Browse Catalog</Link></li>
              <li><Link to="/register">Client Sign Up</Link></li>
            </ul>
          </div>

          <div className="site-footer__col">
            <h4>For Freelancers</h4>
            <ul>
              <li><Link to="/projects">Find Work</Link></li>
              <li><Link to="/register">Create Profile</Link></li>
              <li><Link to="/projects?status=OPEN">Latest Jobs</Link></li>
              <li><Link to="/login">Freelancer Login</Link></li>
            </ul>
          </div>

          <div className="site-footer__col">
            <h4>Popular Categories</h4>
            <ul>
              <li><Link to="/projects?category=Web+Development">Web Development</Link></li>
              <li><Link to="/projects?category=Mobile+Apps">Mobile App Dev</Link></li>
              <li><Link to="/projects?category=Digital+Marketing">Digital Marketing</Link></li>
              <li><Link to="/projects?category=SEO">SEO & SMM Services</Link></li>
            </ul>
          </div>
        </div>
      </div>

      <div className="site-footer__bottom">
        <div className="site-footer__bottom-container">
          <p>&copy; {new Date().getFullYear()} Exertio Freelancer Marketplace. All rights reserved.</p>
          <div className="site-footer__links">
            <Link to="/projects">Privacy Policy</Link>
            <span className="dot">•</span>
            <Link to="/projects">Terms of Service</Link>
            <span className="dot">•</span>
            <Link to="/projects">Support</Link>
          </div>
          {children && <div className="site-footer__extra">{children}</div>}
        </div>
      </div>
    </footer>
  );
}

