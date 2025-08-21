import React from "react";
import "../styles/Support.css";

const SupportPage = () => {
  return (
    <div className="support-page">
      <header className="support-header">
        <h1>Support</h1>
        <p>We’re here to help you with anything you need.</p>
      </header>

      <section className="support-section">
        <div className="support-card">
          <h2>Contact Us</h2>
          <p>Need help? Reach out to our team.</p>
          <a href="mailto:support@example.com" className="support-btn">
            Email Support
          </a>
        </div>

        <div className="support-card">
          <h2>FAQs</h2>
          <p>Find quick answers to common questions.</p>
          <button className="support-btn">View FAQs</button>
        </div>

        <div className="support-card">
          <h2>Live Chat</h2>
          <p>Chat with us for instant support.</p>
          <button className="support-btn">Start Chat</button>
        </div>
      </section>
    </div>
  );
};

export default SupportPage;
