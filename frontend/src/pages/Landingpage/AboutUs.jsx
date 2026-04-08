import React from "react";
import "./LandingPageCss.css";

import { FaShieldAlt } from "react-icons/fa";

const AboutUs = () => {
  return (
    <section className="about-section">
      
      <div className="about-container">

        {/* LEFT */}
        <div className="about-left">
          
          <div className="about-label">
            <div className="line"></div>
            <span>OUR MISSION</span>
          </div>

          <h1 className="about-title">
            BUILT ON <span>HONOR</span>, <br />
            DRIVEN BY DUTY
          </h1>

          <p className="about-text">
            The Philippine National Police is the national civilian police force 
            tasked with enforcing the law, preventing crimes, and maintaining peace and order.
          </p>

          <p className="about-text">
            As a PNP Officer, you become a guardian of your community — protecting the innocent, 
            upholding justice, and serving with integrity.
          </p>

          {/* CARDS */}
          <div className="about-cards">

            <div className="about-card">
              <h4>INTEGRITY</h4>
              <p>Upholding the highest ethical standards in all duties.</p>
            </div>

            <div className="about-card">
              <h4>SERVICE</h4>
              <p>Serving the public with respect and professionalism.</p>
            </div>

            <div className="about-card">
              <h4>EXCELLENCE</h4>
              <p>Continuously improving skills to serve better.</p>
            </div>

          </div>
        </div>

        {/* RIGHT */}
        <div className="about-right">
          <div className="about-visual-box">
            <div className="shield-glow"></div>

            <div className="shield-icon">
              <FaShieldAlt />
            </div>

            <h3 className="visual-text">
              GUARDIANS OF THE NATION
            </h3>

          </div>
        </div>

      </div>
    </section>
  );
};

export default AboutUs;