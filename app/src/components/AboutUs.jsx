import React from 'react';
import '../styles/AboutUs.css';

export default function AboutUs() {
  return (
    <div className="about-container">
      <h1 className="about-title">About Us</h1>
      <p className="about-subtitle">
        We are passionate about bringing you the best music experience possible.
        Our mission is to make streaming simple, enjoyable, and ad-free for everyone.
      </p>

      <div className="about-section">
        <h2>🎯 Our Mission</h2>
        <p>
          To empower music lovers with a platform that delivers high-quality audio,
          personalized playlists, and exclusive content.
        </p>
      </div>

      <div className="about-section">
        <h2>💡 Why Choose Us?</h2>
        <ul>
          <li>Unlimited access to premium playlists</li>
          <li>Completely ad-free experience</li>
          <li>Offline listening mode</li>
          <li>Early access to new features</li>
        </ul>
      </div>
    </div>
  );
}
