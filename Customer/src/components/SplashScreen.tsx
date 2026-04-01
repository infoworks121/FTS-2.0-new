import React, { useEffect, useState } from 'react';
import './SplashScreen.css';

const SplashScreen = ({ onComplete }: { onComplete: () => void }) => {
  const [isFading, setIsFading] = useState(false);

  useEffect(() => {
    const fadeTimer = setTimeout(() => setIsFading(true), 5700);
    const completionTimer = setTimeout(() => onComplete(), 6500);
    return () => {
      clearTimeout(fadeTimer);
      clearTimeout(completionTimer);
    };
  }, [onComplete]);

  return (
    <div className={`splash-container ${isFading ? 'fade-out' : ''}`}>
      <div className="video-wrapper">
        <video autoPlay muted playsInline className="splash-video">
          <source src="/FTS_Logo_Animation_Generation.mp4" type="video/mp4" />
        </video>
      </div>
    </div>
  );
};

export default SplashScreen;
