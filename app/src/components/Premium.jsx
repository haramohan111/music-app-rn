// Premium.jsx
import React from 'react';
import '../styles/Premium.css'; // optional styling

export default function Premium() {
  return (
    <div className="premium-container">
      <h1 className="premium-title">Go Premium</h1>
      <p className="premium-subtitle">
        Unlock all features, enjoy ad-free streaming, and get early access to new playlists!
      </p>

      <div className="premium-benefits">
        <ul>
          <li>🎵 Unlimited playlists</li>
          <li>🚫 No ads</li>
          <li>📀 Offline listening</li>
          <li>✨ Exclusive content</li>
        </ul>
      </div>

      <button className="premium-button">
        Upgrade Now
      </button>
    </div>
  );
}
