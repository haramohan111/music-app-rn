import React, { useState } from 'react';
import axios from 'axios';

const PasswordGenerator = () => {
  const [generatedPassword, setGeneratedPassword] = useState(null);

  const handleGenerate = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/v1/generate-password');
      setGeneratedPassword(response.data);
    } catch (err) {
      console.error('Error generating password:', err);
    }
  };

  return (
    <div>
      <button onClick={handleGenerate}>Generate Hashed Password</button>

      {generatedPassword && (
        <div>
          <p><strong>Raw:</strong> {generatedPassword.raw}</p>
          <p><strong>Hashed:</strong> {generatedPassword.hashed}</p>
        </div>
      )}
    </div>
  );
};

export default PasswordGenerator;
